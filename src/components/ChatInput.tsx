import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Mic, MicOff } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { Companion } from "../types/companion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  guestMessageCount?: number;
  isAuthenticated?: boolean;
  companionColor?: string;
  companionId?: Companion["id"];
}

const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

const COMPANION_PLACEHOLDERS: Record<Companion["id"], { it: string; en: string }> = {
  clauria: { it: "Scrivi qui...", en: "Write here..." },
  luce: { it: "Cosa ti rende felice oggi?", en: "What makes you happy today?" },
  marco: { it: "Qual è la decisione?", en: "What's the decision?" },
  sofia: { it: "Come ti senti dentro?", en: "How do you feel inside?" },
  leo: { it: "Raccontami qualcosa!", en: "Tell me something!" },
};

const ChatInput = ({
  onSend,
  disabled,
  placeholder,
  guestMessageCount = 0,
  isAuthenticated = false,
  companionColor,
  companionId = "clauria",
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t, lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "it" ? "it-IT" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setValue((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, lang]);

  const remaining = 5 - guestMessageCount;
  const hasSpeechSupport = !!SpeechRecognition;
  const dynamicPlaceholder = placeholder || COMPANION_PLACEHOLDERS[companionId]?.[lang] || t("chat_placeholder");

  return (
    <div className="border-t border-border/30 bg-parchment px-4 py-3 pb-safe">
      {!isAuthenticated && guestMessageCount >= 3 && (
        <p className="text-xs text-muted-foreground/60 italic text-center mt-0 mb-2">
          {t("chat_guest_remaining")(remaining)}
        </p>
      )}
      <div className="flex items-end gap-2 max-w-[600px] mx-auto">
        {hasSpeechSupport && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 ${
              isListening
                ? "bg-crisis-red text-white animate-pulse"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            }`}
            aria-label={isListening ? t("mic_stop") : t("mic_start")}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={dynamicPlaceholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground text-[15px] placeholder:text-muted-foreground/50 focus:outline-none py-2"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 shadow-sm"
          style={{ backgroundColor: companionColor || "hsl(215,55%,45%)" }}
        >
          <ArrowUp className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
