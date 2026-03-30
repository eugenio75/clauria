import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  guestMessageCount?: number;
  isAuthenticated?: boolean;
}

const ChatInput = ({ onSend, disabled, placeholder, guestMessageCount = 0, isAuthenticated = false }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

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

  const remaining = 5 - guestMessageCount;

  return (
    <div className="border-t border-border/50 bg-parchment px-4 py-3 pb-safe">
      {!isAuthenticated && guestMessageCount >= 3 && (
        <p className="text-xs text-muted-foreground/60 italic text-center mt-0 mb-2">
          {t("chat_guest_remaining")(remaining)}
        </p>
      )}
      <div className="flex items-end gap-2 max-w-[600px] mx-auto">
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
          placeholder={placeholder || t("chat_placeholder")}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground text-[15px] placeholder:text-muted-foreground/60 focus:outline-none py-2"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-trust-blue flex items-center justify-center transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
