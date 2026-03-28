import { motion } from "framer-motion";

interface MessageBubbleProps {
  content: string;
  sender: "ai" | "user";
}

const MessageBubble = ({ content, sender }: MessageBubbleProps) => {
  const isAI = sender === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] box-border px-5 py-3.5 ${
          isAI
            ? "bg-ai-bubble rounded-2xl rounded-tl-sm shadow-sm text-foreground leading-relaxed"
            : "bg-user-bubble rounded-2xl rounded-tr-sm text-foreground"
        }`}
        style={isAI ? { lineHeight: "1.8" } : undefined}
      >
        <p className="whitespace-pre-wrap text-[15px]">{content}</p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
