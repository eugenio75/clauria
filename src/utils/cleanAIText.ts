/**
 * Strips internal system blocks, context updates, and metadata from AI responses
 * before they are rendered in the chat interface.
 */
export function cleanAIText(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // Remove [CONTEXT_UPDATE] JSON blocks (multi-line)
  cleaned = cleaned.replace(/\[CONTEXT_UPDATE\][\s\S]*?\[\/CONTEXT_UPDATE\]/gi, "");

  // Remove any block wrapped in square brackets that looks like system instructions
  cleaned = cleaned.replace(/\[(CONTEXT|UPDATE|PHASE|MODE|SYSTEM|REMINDER|INSTRUCTION|SESSION_DATA|INTERNAL)[^\]]*\][\s\S]*?\[\/\1[^\]]*\]/gi, "");

  // Remove single-line metadata markers
  cleaned = cleaned.replace(/^\s*\[(CONTEXT_UPDATE|PHASE \d|MODE \d|SYSTEM|REMINDER|INTERNAL|SESSION_DATA)\].*$/gm, "");

  // Remove lines that look like raw JSON objects (session data leaks)
  cleaned = cleaned.replace(/^\s*\{[\s\S]*?"(session_count|emotional_theme|recurring_theme|tone_history|session_history|step_proposed|next_session_hook)"[\s\S]*?\}\s*$/gm, "");

  // Remove <details> blocks (HTML metadata blocks)
  cleaned = cleaned.replace(/<details[\s\S]*?<\/details>/gi, "");

  // Remove lines starting with system-like prefixes
  cleaned = cleaned.replace(/^\s*(ABSOLUTE RULE|IMPORTANT|NOTE TO SELF|SYSTEM INSTRUCTION|INTERNAL NOTE):.*$/gm, "");

  // Clean up excessive whitespace left behind
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}
