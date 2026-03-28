const TypingIndicator = () => (
  <div className="flex items-start max-w-[80%] animate-fade-in-up">
    <div className="bg-ai-bubble rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-dot-pulse-1" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-dot-pulse-2" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-dot-pulse-3" />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
