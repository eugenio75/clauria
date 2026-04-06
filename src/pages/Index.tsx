import { useState, useRef, useEffect, useCallback } from "react";
import { getWarmReaction } from "../utils/onboardingWarmReaction";
import { cleanAIText } from "../utils/cleanAIText";
import { AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import ChatInput from "../components/ChatInput";
import SettingsPanel from "../components/SettingsPanel";
import CrisisCard from "../components/CrisisCard";
import SilenceMode from "../components/SilenceMode";
import SplashScreen from "../components/SplashScreen";
import UnsentLetter from "../components/UnsentLetter";
import LoginScreen from "../components/LoginScreen";
import WelcomeScreen from "../components/WelcomeScreen";
import CompanionSelector from "../components/CompanionSelector";
import { useIntusAuth } from "../hooks/useIntusAuth";
import { useIntusContext } from "../hooks/useIntusContext";
import { useLanguage } from "../i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/runtime-client";
import { toast } from "sonner";
import { COMPANIONS, Companion } from "../types/companion";

interface Message {
  id: string;
  content: string;
  sender: "ai" | "user";
  crisis?: boolean;
}

interface UserProfile {
  name: string;
  ageRange: string;
  lifeContext: string;
  emotionalEntry: string;
  onboardingComplete: boolean;
}

const Index = () => {
  const [showSplash, setShowSplash] = useState(!window.location.hash.includes("access_token"));
  const [splashFadingOut, setSplashFadingOut] = useState(false);
  const welcomeAlreadySeen = localStorage.getItem("intus_welcome_seen") === "true";
  const [showWelcome, setShowWelcome] = useState(!welcomeAlreadySeen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState(false);
  const [silenceModeOffered, setSilenceModeOffered] = useState(false);
  const [letterMode, setLetterMode] = useState(false);
  const [letterModeOffered, setLetterModeOffered] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    ageRange: "",
    lifeContext: "",
    emotionalEntry: "",
    onboardingComplete: false,
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingStartedRef = useRef(false);
  const greetingSentRef = useRef(false);
  const [appPhase, setAppPhase] = useState<"splash" | "onboarding" | "conversation">("splash");
  const [isNewSession, setIsNewSession] = useState(true);
  const [skipLogin, setSkipLogin] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Companion state
  const [activeCompanion, setActiveCompanion] = useState<Companion["id"]>("clauria");
  const [showCompanionSelector, setShowCompanionSelector] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, loading, isReady } = useIntusAuth();
  const isGuest = !!user?.is_anonymous;
  const isAuthenticated = !!user;
  const { loadContext, saveProfile, resetContext } = useIntusContext();
  const { t, lang } = useLanguage();

  const activeCompanionData = COMPANIONS.find(c => c.id === activeCompanion) || COMPANIONS[0];

  const onboardingStepsRef = useRef([
    { aiMessage: t("onboarding_q1"), field: "name" as const },
    { aiMessageFn: (name: string) => t("onboarding_q2")(name), field: "ageRange" as const },
    { aiMessage: t("onboarding_q3"), field: "lifeContext" as const },
    { field: "emotionalEntry" as const, dynamic: true },
  ]);
  onboardingStepsRef.current = [
    { aiMessage: t("onboarding_q1"), field: "name" as const },
    { aiMessageFn: (name: string) => t("onboarding_q2")(name), field: "ageRange" as const },
    { aiMessage: t("onboarding_q3"), field: "lifeContext" as const },
    { field: "emotionalEntry" as const, dynamic: true },
  ];
  const ONBOARDING_STEPS = onboardingStepsRef.current;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const addAIMessage = useCallback((content: string, crisis?: boolean) => {
    const cleaned = cleanAIText(content);
    if (!cleaned) return;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: cleaned, sender: "ai", crisis },
      ]);

      if (cleaned.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (cleaned.includes("Non la leggerà nessuno")) {
        setLetterModeOffered(true);
      }
    }, 300);
  }, []);

  const startOnboarding = useCallback(() => {
    if (onboardingStartedRef.current) return;
    onboardingStartedRef.current = true;

    if (profile.name && profile.ageRange && profile.lifeContext) {
      setProfile(prev => ({ ...prev, onboardingComplete: true }));
      setAppPhase("conversation");
      sendToAI([], undefined);
      return;
    }
    setAppPhase("onboarding");
    const fields = ["name", "ageRange", "lifeContext", "emotionalEntry"] as const;
    let firstEmpty = 0;
    for (let i = 0; i < fields.length; i++) {
      if (!profile[fields[i]]) {
        firstEmpty = i;
        break;
      }
      if (i === fields.length - 1) firstEmpty = fields.length;
    }
    if (firstEmpty >= ONBOARDING_STEPS.length) {
      setProfile(prev => ({ ...prev, onboardingComplete: true }));
      setAppPhase("conversation");
      return;
    }
    setOnboardingStep(firstEmpty);
    const step = ONBOARDING_STEPS[firstEmpty];
    let msg: string;
    if (step.dynamic) {
      const warmReaction = getWarmReaction(profile.lifeContext, lang);
      const fixedQuestion = t("onboarding_q4_question");
      msg = `${warmReaction}\n\n${fixedQuestion}`;
    } else {
      msg = step.aiMessageFn ? step.aiMessageFn(profile.name) : step.aiMessage!;
    }
    setTimeout(() => addAIMessage(msg), 500);
  }, [addAIMessage, profile, ONBOARDING_STEPS]);

  const handleWelcomeComplete = useCallback(() => {
    localStorage.setItem("intus_welcome_seen", "true");
    setShowWelcome(false);
  }, []);

  const startConversation = useCallback(async () => {
    if (!user) return;

    try {
      const ctx = await loadContext(user.id);

      // Restore active companion from DB
      if (ctx.active_companion) {
        setActiveCompanion(ctx.active_companion as Companion["id"]);
      }

      if (ctx.user_name && ctx.session_count && ctx.session_count > 0) {
        setProfile({
          name: ctx.user_name || "",
          ageRange: ctx.age_range || "",
          lifeContext: ctx.life_context || "",
          emotionalEntry: "",
          onboardingComplete: true,
        });
        setAppPhase("conversation");

        if (greetingSentRef.current) return;
        greetingSentRef.current = true;

        // Let AI generate the opening message with full context
        sendToAI([], undefined);
        return;
      }
    } catch {
      // No profile in DB yet
    }

    startOnboarding();
  }, [user, loadContext, addAIMessage, startOnboarding]);

  const handleSplashComplete = useCallback(() => {
    setSplashFadingOut(true);
    setTimeout(() => {
      setShowSplash(false);
      setSplashFadingOut(false);
    }, 400);
  }, []);

  const hasCheckedRef = useRef(false);
  useEffect(() => {
    if (showSplash || showWelcome) return;
    if (isReady && isAuthenticated && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      setCheckingProfile(true);
      
      const isContinuingSession = sessionStorage.getItem("intus_session_active") === "true";

      loadContext(user!.id).then((ctx) => {
        const hasProfile = ctx.user_name && ctx.session_count && ctx.session_count > 0;
        
        if (hasProfile) {
          setSkipLogin(true);
          setProfile({
            name: ctx.user_name || "",
            ageRange: ctx.age_range || "",
            lifeContext: ctx.life_context || "",
            emotionalEntry: "",
            onboardingComplete: true,
          });
          setAppPhase("conversation");

          if (ctx.active_companion) {
            setActiveCompanion(ctx.active_companion as Companion["id"]);
          }

          sessionStorage.setItem("intus_session_active", "true");

          const hoursSinceLast = ctx.last_session_at
            ? (Date.now() - new Date(ctx.last_session_at).getTime()) / (1000 * 60 * 60)
            : Infinity;
          const showBentornato = !isContinuingSession && hoursSinceLast >= 8;

          const reentryAlreadyShown = sessionStorage.getItem("intus_reentry_shown") === "true";

          const sanitizeHook = (s: string): string | null => {
            if (!s) return null;
            const metadataPatterns = /\b(developing|conflict|app-based|co-founder|evangelization|recurring_theme|session_count|emotional_theme|CONTEXT|UPDATE|MODE \d|PHASE \d)\b/i;
            if (metadataPatterns.test(s)) return null;
            if (s.includes('{') || s.includes('[') || s.includes(':')) return null;
            return s;
          };

          if (greetingSentRef.current) return;
          greetingSentRef.current = true;

          // Let AI generate the opening message with full context
          sendToAI([], undefined);
        } else {
          const partialProfile = {
            name: ctx.user_name || "",
            ageRange: ctx.age_range || "",
            lifeContext: ctx.life_context || "",
          };
          if (partialProfile.name) {
            setProfile(prev => ({ ...prev, ...partialProfile }));
          }
          setSkipLogin(true);
          startOnboarding();
        }
      }).catch(() => {
      }).finally(() => {
        setCheckingProfile(false);
      });
    }
  }, [showSplash, showWelcome, isReady, isAuthenticated, user, loadContext, addAIMessage]);

  const mountUserRef = useRef<string | undefined>(undefined);
  const didCaptureMount = useRef(false);
  useEffect(() => {
    if (!isReady) return;
    if (!didCaptureMount.current) {
      didCaptureMount.current = true;
      mountUserRef.current = user?.id;
      if (user && !user.is_anonymous) {
        hasCheckedRef.current = false;
      }
      return;
    }
    if (user && user.id !== mountUserRef.current) {
      const anonId = localStorage.getItem("intus_anon_id");
      if (anonId && anonId !== user.id && !user.is_anonymous) {
        supabase.functions.invoke("migrate-guest-data", {
          body: { anonUserId: anonId, newUserId: user.id },
        }).then(({ error }) => {
          if (error) console.error("Guest data migration failed:", error);
        }).finally(() => {
          localStorage.removeItem("intus_anon_id");
        });
      }
      mountUserRef.current = user.id;
      setSkipLogin(true);
      startConversation();
    }
  }, [isReady, user, startConversation]);

  // Splash completes via its own animation timer, not skipped for authenticated users

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendToAI = async (allMessages: Message[], onboardingData?: {
    isOnboarding?: boolean;
    onboardingStep?: number;
    isFirstResponseAfterOnboarding: boolean;
    name: string;
    ageRange: string;
    lifeContext: string;
    emotionalEntry: string;
  }) => {
    if (!user) return;

    setIsTyping(true);
    try {
      const ctx = await loadContext(user.id);

      const { data, error } = await supabase.functions.invoke("intus-chat", {
        body: {
          messages: allMessages
            .filter((m) => m.sender === "ai" || m.sender === "user")
            .map((m) => ({
              role: m.sender === "ai" ? "assistant" : "user",
              content: m.content,
            })),
          userContext: ctx,
          userId: user.id,
          localHour: new Date().getHours(),
          isNewSession,
          language: lang,
          companionId: activeCompanion,
          ...(onboardingData ? { onboardingData } : {}),
        },
      });

      if (isNewSession) setIsNewSession(false);

      if (error) throw error;

      const cleanedText = cleanAIText(data.text);

      if (data.isCrisisLevel3) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), content: cleanedText, sender: "ai", crisis: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), content: cleanedText, sender: "ai" },
        ]);
      }

      if (cleanedText.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (cleanedText.includes("Non la leggerà nessuno")) {
        setLetterModeOffered(true);
      }
    } catch (err) {
      console.error("AI error:", err);
      const errorMsg = err instanceof Error && err.message.includes("429")
        ? t("chat_error_rate_limit")
        : t("chat_error_generic");
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: errorMsg, sender: "ai" },
      ]);
      if (err instanceof Error && err.message.includes("402")) {
        toast.error(t("chat_error_credits"));
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), content: text, sender: "user" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    setSilenceModeOffered(false);
    setLetterModeOffered(false);

    if (appPhase === "onboarding") {
      handleOnboardingResponse(text);
    } else {
      sendToAI(newMessages);
    }
  };

  const handleOnboardingResponse = async (text: string) => {
    const step = ONBOARDING_STEPS[onboardingStep];
    const newProfile = { ...profile, [step.field]: text };
    setProfile(newProfile);

    const nextStep = onboardingStep + 1;

    if (nextStep < ONBOARDING_STEPS.length) {
      setOnboardingStep(nextStep);
      const contextualMessages = [...messages, { id: "u", content: text, sender: "user" as const }];
      await sendToAI(contextualMessages, {
        isOnboarding: true,
        onboardingStep: nextStep,
        isFirstResponseAfterOnboarding: false,
        name: newProfile.name || "",
        ageRange: newProfile.ageRange || "",
        lifeContext: newProfile.lifeContext || "",
        emotionalEntry: newProfile.emotionalEntry || "",
      });
    } else {
      const finalProfile = { ...newProfile, onboardingComplete: true };
      setProfile(finalProfile);

      if (user) {
        try {
          await saveProfile(user.id, {
            name: finalProfile.name,
            ageRange: finalProfile.ageRange,
            lifeContext: finalProfile.lifeContext,
          });
        } catch (err) {
          console.error("Failed to save profile:", err);
        }
      }

      setAppPhase("conversation");

      const contextualMessages = messages.concat([
        { id: "sys", content: text, sender: "user" as const },
      ]);
      sendToAI(contextualMessages, {
        isOnboarding: false,
        onboardingStep: 4,
        isFirstResponseAfterOnboarding: true,
        name: finalProfile.name,
        ageRange: finalProfile.ageRange,
        lifeContext: finalProfile.lifeContext,
        emotionalEntry: finalProfile.emotionalEntry,
      });
    }
  };

  const handleCompanionChange = async (id: Companion["id"]) => {
    setActiveCompanion(id);
    if (user) {
      try {
        await supabase.from("intus_context").upsert(
          {
            user_id: user.id,
            active_companion: id,
          },
          { onConflict: "user_id" }
        );
      } catch (err) {
        console.error("Failed to save companion:", err);
      }
    }
  };

  const handleResetMemory = async () => {
    if (user) {
      try {
        await resetContext(user.id);
      } catch (err) {
        console.error("Failed to reset context:", err);
      }
    }
    setProfile({ name: "", ageRange: "", lifeContext: "", emotionalEntry: "", onboardingComplete: false });
    setMessages([]);
    setOnboardingStep(0);
    hasCheckedRef.current = false;
    onboardingStartedRef.current = false;
    greetingSentRef.current = false;
    setSkipLogin(false);
    localStorage.removeItem("intus_welcome_seen");
    setShowWelcome(true);
  };


  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} fadingOut={splashFadingOut} />;
  }

  if (!isReady || checkingProfile) {
    return (
      <div className="fixed inset-0 bg-parchment flex items-center justify-center">
        <span className="text-5xl text-trust-blue select-none animate-breathe">✦</span>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-parchment max-w-[600px] mx-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 pt-safe">
        <button
          onClick={() => setShowCompanionSelector(true)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-lg" style={{ color: activeCompanionData.color }}>
            {activeCompanionData.emoji}
          </span>
          <h1 className="font-display text-xl tracking-wide text-foreground">
            {activeCompanionData.name.toUpperCase()}
          </h1>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-4 pb-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble
              content={msg.content}
              sender={msg.sender}
              companionEmoji={activeCompanionData.emoji}
            />
            {msg.crisis && <CrisisCard />}
          </div>
        ))}
        {isTyping && <TypingIndicator />}

        {silenceModeOffered && !silenceMode && (
          <div className="flex justify-center mt-2 mb-4">
            <button
              onClick={() => { setSilenceMode(true); setSilenceModeOffered(false); }}
              className="text-sm text-trust-blue/80 italic underline-offset-2 underline font-medium"
            >
              {t("offer_silence")}
            </button>
          </div>
        )}

        {letterModeOffered && !letterMode && (
          <div className="flex justify-center mt-2 mb-4">
            <button
              onClick={() => { setLetterMode(true); setLetterModeOffered(false); }}
              className="text-sm text-trust-blue/80 italic underline-offset-2 underline font-medium"
            >
              {t("offer_letter")}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        guestMessageCount={0}
        isAuthenticated={true}
        companionColor={activeCompanionData.color}
        companionId={activeCompanion}
      />

      {/* Settings */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={profile.name}
        userEmail={user?.email || ""}
        authProvider={user?.app_metadata?.provider || "email"}
        userId={user?.id}
        onNameChange={(name) => {
          setProfile((prev) => ({ ...prev, name }));
        }}
        onResetMemory={handleResetMemory}
        isAuthenticated={true}
      />

      {/* Companion Selector */}
      <AnimatePresence>
        {showCompanionSelector && (
          <CompanionSelector
            currentCompanion={activeCompanion}
            onSelect={handleCompanionChange}
            onClose={() => setShowCompanionSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Silence Mode */}
      <AnimatePresence>
        {silenceMode && <SilenceMode onReturn={() => setSilenceMode(false)} />}
      </AnimatePresence>

      {/* Unsent Letter */}
      <AnimatePresence>
        {letterMode && <UnsentLetter onClose={() => setLetterMode(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
