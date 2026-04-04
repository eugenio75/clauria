import { motion } from "framer-motion";

interface MessageBubbleProps {
  content: string;
  sender: "ai" | "user";
  companionEmoji?: string;
}

const MessageBubble = ({ content, sender, companionEmoji = "✦" }: MessageBubbleProps) => {
  const isAI = sender === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      {isAI && (
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-trust-blue/10 flex items-center justify-center text-sm mr-2 mt-1 select-none">
          {companionEmoji}
        </span>
      )}
      <div
        className={`max-w-[80%] box-border px-5 py-3.5 ${
          isAI
            ? "bg-white rounded-[20px] rounded-tl-sm shadow-sm text-foreground leading-relaxed"
            : "bg-user-bubble rounded-[20px] rounded-tr-sm text-foreground"
        }`}
        style={isAI ? { lineHeight: "1.8" } : undefined}
      >
        <p className="whitespace-pre-wrap text-[15px]">{content}</p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
