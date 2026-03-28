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
import EmailUpgrade from "../components/EmailUpgrade";
import { useIntusAuth } from "../hooks/useIntusAuth";
import { useIntusContext } from "../hooks/useIntusContext";
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

const ONBOARDING_STEPS = [
  {
    aiMessage: "Ciao. Sono qui per te.\nPrima di cominciare, aiutami a conoscerti un po'.\nCome ti chiami?",
    field: "name" as const,
  },
  {
    aiMessageFn: (name: string) => `${name}, piacere. Quanti anni hai più o meno?`,
    field: "ageRange" as const,
  },
  {
    aiMessage: "E nella vita di tutti i giorni, cosa fai?\nLavori, sei in un momento di cambiamento, stai a casa...",
    field: "lifeContext" as const,
  },
  {
    aiMessage: "Capito. E in questo momento — c'è qualcosa di specifico\nche ti pesa, o è più una sensazione generale che porti dentro?",
    field: "emotionalEntry" as const,
  },
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState(false);
  const [silenceModeOffered, setSilenceModeOffered] = useState(false);
  const [letterMode, setLetterMode] = useState(false);
  const [letterModeOffered, setLetterModeOffered] = useState(false);
  const [showEmailUpgrade, setShowEmailUpgrade] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    ageRange: "",
    lifeContext: "",
    emotionalEntry: "",
    onboardingComplete: false,
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [appPhase, setAppPhase] = useState<"splash" | "onboarding" | "conversation">("splash");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useIntusAuth();
  const { loadContext, saveProfile, resetContext } = useIntusContext();

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

      // Detect special moment triggers
      if (content.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (content.includes("Non la leggerà nessuno")) {
        setLetterModeOffered(true);
      }
    }, 800 + Math.random() * 600);
  }, []);

  // After splash, check if user has a profile in DB
  const handleSplashComplete = useCallback(async () => {
    setShowSplash(false);

    if (!user) {
      // Auth still loading, start onboarding from local
      const saved = localStorage.getItem("intus_profile");
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed.onboardingComplete) {
          setProfile(parsed);
          setAppPhase("conversation");
          const welcomeMsg = parsed.name
            ? `Ciao ${parsed.name}. Sono qui. Di cosa hai bisogno oggi?`
            : "Ciao. Sono qui. Di cosa hai bisogno oggi?";
          setTimeout(() => addAIMessage(welcomeMsg), 500);
          return;
        }
      }
      setAppPhase("onboarding");
      setTimeout(() => addAIMessage(ONBOARDING_STEPS[0].aiMessage!), 500);
      return;
    }

    // Try loading from DB
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

        // Contextual re-entry for returning users
        let welcomeMsg: string;
        if (ctx.session_count > 1 && ctx.ongoing_situation) {
          welcomeMsg = `Bentornato/a ${ctx.user_name}. L'ultima volta mi parlavi di ${ctx.ongoing_situation}. Come è andata?`;
        } else {
          welcomeMsg = `Ciao ${ctx.user_name}. Sono qui. Di cosa hai bisogno oggi?`;
        }
        setTimeout(() => addAIMessage(welcomeMsg), 500);
        return;
      }
    } catch {
      // No profile in DB
    }

    setAppPhase("onboarding");
    setTimeout(() => addAIMessage(ONBOARDING_STEPS[0].aiMessage!), 500);
  }, [user, loadContext, addAIMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendToAI = async (allMessages: Message[]) => {
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
        },
      });

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

      // Detect special moments
      if (data.text.includes("fermarci un momento in silenzio")) {
        setSilenceModeOffered(true);
      }
      if (data.text.includes("Non la leggerà nessuno")) {
        setLetterModeOffered(true);
      }
    } catch (err) {
      console.error("AI error:", err);
      const errorMsg = err instanceof Error && err.message.includes("429")
        ? "Ho bisogno di un momento. Riprova tra poco."
        : "Sono qui. Qualcosa non ha funzionato — puoi riprovare?";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: errorMsg, sender: "ai" },
      ]);
      if (err instanceof Error && err.message.includes("402")) {
        toast.error("Crediti AI esauriti. Aggiungi fondi nelle impostazioni del workspace.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), content: text, sender: "user" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Clear offered modes on new message
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
      // Onboarding complete — save to DB
      const finalProfile = { ...newProfile, onboardingComplete: true };
      setProfile(finalProfile);
      localStorage.setItem("intus_profile", JSON.stringify(finalProfile));

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

      // Show email upgrade prompt
      const isAnonymous = user?.is_anonymous;
      if (isAnonymous) {
        addAIMessage("Grazie. Sono qui. Dimmi pure.");
        setTimeout(() => setShowEmailUpgrade(true), 2000);
      } else {
        addAIMessage("Grazie. Sono qui. Dimmi pure.");
      }
    }
  };

  const handleResetMemory = async () => {
    localStorage.removeItem("intus_profile");
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
    setAppPhase("onboarding");
    setTimeout(() => {
      addAIMessage(ONBOARDING_STEPS[0].aiMessage!);
    }, 500);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-parchment max-w-[600px] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 pt-safe">
        <h1 className="font-display text-xl tracking-wide text-foreground">INTUS</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble content={msg.content} sender={msg.sender} />
            {msg.crisis && <CrisisCard />}
          </div>
        ))}
        {isTyping && <TypingIndicator />}

        {/* Email upgrade prompt */}
        {showEmailUpgrade && (
          <EmailUpgrade
            onComplete={() => setShowEmailUpgrade(false)}
            onSkip={() => setShowEmailUpgrade(false)}
          />
        )}

        {/* Silence mode offer */}
        {silenceModeOffered && !silenceMode && (
          <div className="flex justify-center mt-2 mb-4">
            <button
              onClick={() => { setSilenceMode(true); setSilenceModeOffered(false); }}
              className="text-sm text-trust-blue/60 italic underline-offset-2 underline"
            >
              Sì, mi fermo un momento
            </button>
          </div>
        )}

        {/* Unsent letter offer */}
        {letterModeOffered && !letterMode && (
          <div className="flex justify-center mt-2 mb-4">
            <button
              onClick={() => { setLetterMode(true); setLetterModeOffered(false); }}
              className="text-sm text-trust-blue/60 italic underline-offset-2 underline"
            >
              Sì, voglio scrivere
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />

      {/* Settings */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={profile.name}
        onNameChange={(name) => {
          const updated = { ...profile, name };
          setProfile(updated);
          localStorage.setItem("intus_profile", JSON.stringify(updated));
          if (user) {
            supabase.from("intus_profiles").update({ user_name: name }).eq("id", user.id);
          }
        }}
        onResetMemory={handleResetMemory}
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
