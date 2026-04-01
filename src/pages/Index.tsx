import { useState, useRef, useEffect, useCallback } from "react";
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
import { useIntusAuth } from "../hooks/useIntusAuth";
import { useIntusContext } from "../hooks/useIntusContext";
import { useLanguage } from "../i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [showSplash, setShowSplash] = useState(true);
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
  const [appPhase, setAppPhase] = useState<"splash" | "onboarding" | "conversation">("splash");
  const [isNewSession, setIsNewSession] = useState(true);
  const [skipLogin, setSkipLogin] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, loading, isReady } = useIntusAuth();
  const isGuest = !!user?.is_anonymous;
  const isAuthenticated = !!user;
  const { loadContext, saveProfile, resetContext } = useIntusContext();
  const { t, lang } = useLanguage();

  const ONBOARDING_STEPS = [
    { aiMessage: t("onboarding_q1"), field: "name" as const },
    { aiMessageFn: (name: string) => t("onboarding_q2")(name), field: "ageRange" as const },
    { aiMessage: t("onboarding_q3"), field: "lifeContext" as const },
    { aiMessageFn: (name: string) => t("onboarding_q4")(name), field: "emotionalEntry" as const },
  ];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const addAIMessage = useCallback((content: string, crisis?: boolean) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content, sender: "ai", crisis },
      ]);

      if (content.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (content.includes("Non la leggerà nessuno")) {
        setLetterModeOffered(true);
      }
    }, 300);
  }, []);

  const startOnboarding = useCallback(() => {
    // Check if profile already has required data — skip onboarding if so
    if (profile.name && profile.ageRange && profile.lifeContext) {
      setProfile(prev => ({ ...prev, onboardingComplete: true }));
      setAppPhase("conversation");
      const welcomeMsg = `Ciao ${profile.name}. Sono qui. Di cosa hai bisogno oggi?`;
      setTimeout(() => addAIMessage(welcomeMsg), 500);
      return;
    }
    setAppPhase("onboarding");
    // Find the first unanswered onboarding step
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
    const msg = step.aiMessageFn ? step.aiMessageFn(profile.name) : step.aiMessage!;
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
      if (ctx.user_name && ctx.session_count && ctx.session_count > 0) {
        setProfile({
          name: ctx.user_name || "",
          ageRange: ctx.age_range || "",
          lifeContext: ctx.life_context || "",
          emotionalEntry: "",
          onboardingComplete: true,
        });
        setAppPhase("conversation");

        let welcomeMsg: string;
        const reentryAlreadyShown = sessionStorage.getItem("intus_reentry_shown") === "true";
        // Helper: reject raw metadata strings
        const sanitizeHookInline = (s: string): string | null => {
          if (!s) return null;
          if (/\b(developing|conflict|app-based|co-founder|evangelization|recurring_theme|session_count|emotional_theme|CONTEXT|UPDATE|MODE \d|PHASE \d)\b/i.test(s)) return null;
          if (s.includes('{') || s.includes('[') || s.includes(':')) return null;
          return s;
        };
        if (!reentryAlreadyShown && ctx.next_session_hook) {
          const safeHook = sanitizeHookInline(ctx.next_session_hook);
          welcomeMsg = safeHook || `Bentornato/a ${ctx.user_name}. Come stai oggi?`;
          sessionStorage.setItem("intus_reentry_shown", "true");
        } else if (!reentryAlreadyShown && ctx.step_proposed) {
          const safeStep = sanitizeHookInline(ctx.step_proposed);
          welcomeMsg = safeStep
            ? `Bentornato/a ${ctx.user_name}. L'ultima volta avevi deciso di ${safeStep}. Com'è andata?`
            : `Bentornato/a ${ctx.user_name}. Come stai oggi?`;
          sessionStorage.setItem("intus_reentry_shown", "true");
        } else if (!reentryAlreadyShown && (ctx.recurring_theme_count || 0) >= 3) {
          welcomeMsg = `Ciao ${ctx.user_name}. Ultimamente parliamo spesso di qualcosa di simile. Vuoi provare un approccio diverso questa volta?`;
          sessionStorage.setItem("intus_reentry_shown", "true");
        } else {
          welcomeMsg = `Ciao ${ctx.user_name}. Sono qui. Di cosa hai bisogno oggi?`;
        }
        setTimeout(() => addAIMessage(welcomeMsg), 500);
        return; // Skip onboarding entirely
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
    if (!showSplash && isReady && isAuthenticated && !hasCheckedRef.current) {
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

          sessionStorage.setItem("intus_session_active", "true");

          const hoursSinceLast = ctx.last_session_at
            ? (Date.now() - new Date(ctx.last_session_at).getTime()) / (1000 * 60 * 60)
            : Infinity;
          const showBentornato = !isContinuingSession && hoursSinceLast >= 8;

      const reentryAlreadyShown = sessionStorage.getItem("intus_reentry_shown") === "true";

          // Helper: sanitize any context string to ensure no raw metadata leaks
          const sanitizeHook = (s: string): string | null => {
            if (!s) return null;
            // Reject strings that look like raw metadata summaries
            const metadataPatterns = /\b(developing|conflict|app-based|co-founder|evangelization|recurring_theme|session_count|emotional_theme|CONTEXT|UPDATE|MODE \d|PHASE \d)\b/i;
            if (metadataPatterns.test(s)) return null;
            // Reject strings with JSON-like patterns
            if (s.includes('{') || s.includes('[') || s.includes(':')) return null;
            return s;
          };

          let welcomeMsg: string;
          if (!reentryAlreadyShown && showBentornato && ctx.next_session_hook) {
            const safeHook = sanitizeHook(ctx.next_session_hook);
            if (safeHook) {
              welcomeMsg = safeHook;
            } else {
              welcomeMsg = `Bentornato/a ${ctx.user_name}. Come stai oggi?`;
            }
            sessionStorage.setItem("intus_reentry_shown", "true");
          } else if (!reentryAlreadyShown && showBentornato && ctx.step_proposed) {
            const safeStep = sanitizeHook(ctx.step_proposed);
            if (safeStep) {
              welcomeMsg = `Bentornato/a ${ctx.user_name}. L'ultima volta avevi deciso di ${safeStep}. Com'è andata?`;
            } else {
              welcomeMsg = `Bentornato/a ${ctx.user_name}. Come stai oggi?`;
            }
            sessionStorage.setItem("intus_reentry_shown", "true");
          } else if (!reentryAlreadyShown && (ctx.recurring_theme_count || 0) >= 3) {
            welcomeMsg = `Ciao ${ctx.user_name}. Ultimamente parliamo spesso di qualcosa di simile. Vuoi provare un approccio diverso questa volta?`;
            sessionStorage.setItem("intus_reentry_shown", "true");
          } else if (!reentryAlreadyShown && showBentornato && ctx.session_count && ctx.session_count > 1 && ctx.ongoing_situation) {
            welcomeMsg = `Bentornato/a ${ctx.user_name}. Come stai oggi?`;
            sessionStorage.setItem("intus_reentry_shown", "true");
          } else {
            welcomeMsg = `Ciao ${ctx.user_name}. Sono qui. Di cosa hai bisogno oggi?`;
          }
          setTimeout(() => addAIMessage(welcomeMsg), 500);
        } else {
          // Check if we have partial profile data (name, age, life_context) even without completed onboarding
          // This prevents re-asking questions the user already answered
          const partialProfile = {
            name: ctx.user_name || "",
            ageRange: ctx.age_range || "",
            lifeContext: ctx.life_context || "",
          };
          if (partialProfile.name) {
            setProfile(prev => ({ ...prev, ...partialProfile }));
          }
        }
      }).catch(() => {
      }).finally(() => {
        setCheckingProfile(false);
      });
    }
  }, [showSplash, isReady, isAuthenticated, user, loadContext, addAIMessage]);

  const mountUserRef = useRef<string | undefined>(undefined);
  const didCaptureMount = useRef(false);
  useEffect(() => {
    if (!isReady) return;
    if (!didCaptureMount.current) {
      didCaptureMount.current = true;
      mountUserRef.current = user?.id;
      return;
    }
    if (user && user.id !== mountUserRef.current) {
      const anonId = localStorage.getItem("intus_anon_id");
      if (anonId && anonId !== user.id && !user.is_anonymous) {
        supabase.functions.invoke("migrate-guest-data", {
          body: { anonUserId: anonId, newUserId: user.id },
        }).then(({ error }) => {
          if (error) console.error("Guest data migration failed:", error);
          else console.log("Guest data migrated successfully");
        }).finally(() => {
          localStorage.removeItem("intus_anon_id");
        });
      }
      setSkipLogin(true);
      startConversation();
    }
  }, [isReady, user, startConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendToAI = async (allMessages: Message[], onboardingData?: {
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
            .slice(-10)
            .map((m) => ({
              role: m.sender === "ai" ? "assistant" : "user",
              content: m.content,
            })),
          userContext: ctx,
          userId: user.id,
          localHour: new Date().getHours(),
          isNewSession,
          language: lang,
          ...(onboardingData ? { onboardingData } : {}),
        },
      });

      if (isNewSession) setIsNewSession(false);

      if (error) throw error;

      if (data.isCrisisLevel3) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), content: data.text, sender: "ai", crisis: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), content: data.text, sender: "ai" },
        ]);
      }

      if (data.text.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (data.text.includes("Non la leggerà nessuno")) {
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
      const next = ONBOARDING_STEPS[nextStep];
      const msg = next.aiMessageFn ? next.aiMessageFn(newProfile.name) : next.aiMessage!;
      addAIMessage(msg);
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
        isFirstResponseAfterOnboarding: true,
        name: finalProfile.name,
        ageRange: finalProfile.ageRange,
        lifeContext: finalProfile.lifeContext,
        emotionalEntry: finalProfile.emotionalEntry,
      });
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
    setSkipLogin(false);
    setShowWelcome(true);
  };


  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} fadingOut={splashFadingOut} />;
  }

  if (!isReady || checkingProfile) {
    return (
      <div className="fixed inset-0 bg-parchment flex items-center justify-center">
        <span className="text-5xl text-trust-blue select-none animate-pulse">✦</span>
      </div>
    );
  }

  if (!isAuthenticated || (!skipLogin && appPhase === "splash")) {
    return <LoginScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-parchment max-w-[600px] mx-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 pt-safe">
        <h1 className="font-display text-xl tracking-wide text-foreground">CLAURIA</h1>
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
            <MessageBubble content={msg.content} sender={msg.sender} />
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
      />

      {/* Settings */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={profile.name}
        onNameChange={(name) => {
          const updated = { ...profile, name };
          setProfile(updated);
          if (user) {
            supabase.from("intus_profiles").update({ user_name: name }).eq("id", user.id);
          }
        }}
        onResetMemory={handleResetMemory}
        isAuthenticated={true}
      />

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
