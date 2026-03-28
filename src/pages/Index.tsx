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

// Onboarding steps
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

// Mock AI responses for demo (will be replaced by Claude API)
const MOCK_RESPONSES = [
  "Capisco. Quello che senti è importante, e non devi avere fretta di risolverlo. Cosa ti viene in mente quando ci pensi?",
  "Grazie per aver condiviso questo. A volte le cose più pesanti sono quelle che non troviamo le parole per dire. Vuoi provare a dirlo in un altro modo?",
  "Mi sembra che stai portando molto. C'è qualcuno nella tua vita con cui potresti condividere anche solo una parte di questo?",
  "Quello che dici ha molto senso. Non sempre le risposte arrivano subito — a volte basta stare con la domanda un po' più a lungo.",
  "Ti sento. E il fatto che tu sia qui a parlarne dice qualcosa di importante su di te.",
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState(false);
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
  const mockResponseIndex = useRef(0);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // After splash, check if onboarding is complete
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    const saved = localStorage.getItem("intus_profile");
    if (saved) {
      const parsed = JSON.parse(saved) as UserProfile;
      if (parsed.onboardingComplete) {
        setProfile(parsed);
        setAppPhase("conversation");
        // Welcome back message
        const welcomeMsg = parsed.name
          ? `Ciao ${parsed.name}. Sono qui. Di cosa hai bisogno oggi?`
          : "Ciao. Sono qui. Di cosa hai bisogno oggi?";
        setTimeout(() => {
          addAIMessage(welcomeMsg);
        }, 500);
        return;
      }
    }
    setAppPhase("onboarding");
    // Start onboarding
    setTimeout(() => {
      addAIMessage(ONBOARDING_STEPS[0].aiMessage!);
    }, 500);
  }, []);

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content, sender: "ai" },
      ]);
    }, 800 + Math.random() * 600);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), content: text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    if (appPhase === "onboarding") {
      handleOnboardingResponse(text);
    } else {
      // Mock conversation response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response = MOCK_RESPONSES[mockResponseIndex.current % MOCK_RESPONSES.length];
        mockResponseIndex.current++;
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), content: response, sender: "ai" },
        ]);
      }, 1000 + Math.random() * 1000);
    }
  };

  const handleOnboardingResponse = (text: string) => {
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
      // Onboarding complete
      const finalProfile = { ...newProfile, onboardingComplete: true };
      setProfile(finalProfile);
      localStorage.setItem("intus_profile", JSON.stringify(finalProfile));
      setAppPhase("conversation");
      addAIMessage("Grazie. Sono qui. Dimmi pure.");
    }
  };

  const handleResetMemory = () => {
    localStorage.removeItem("intus_profile");
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
        }}
        onResetMemory={handleResetMemory}
      />

      {/* Silence Mode */}
      <AnimatePresence>
        {silenceMode && <SilenceMode onReturn={() => setSilenceMode(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
