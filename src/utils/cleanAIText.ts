/**
 * Strips internal system blocks, context updates, and metadata from AI responses
 * before they are rendered in the chat interface.
 */
export function cleanAIText(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // Remove specific known system/internal XML tags (with optional attributes, multiline)
  cleaned = cleaned.replace(/<(system_reminder|system|anthropic_reminder|assistant_note|internal|context|reminder|instruction|metadata)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Catch-all: remove ANY XML tag ending in _reminder (e.g. <foo_reminder>...</foo_reminder>)
  cleaned = cleaned.replace(/<([a-z_]+_reminder)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Remove any self-closing XML system tags
  cleaned = cleaned.replace(/<(system_reminder|system|anthropic_reminder|assistant_note|internal|context|reminder|instruction|metadata)\b[^>]*\/>/gi, "");

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

  // Strip generic clinical acknowledgment openers that must never be shown to the user
  cleaned = cleaned.replace(/^\s*(grazie\s+(?:per|di)\s+avermelo\s+detto|grazie\s+(?:per|di)\s+averlo\s+condiviso|thank you for telling me|thank you for sharing|thanks for sharing)[\s.!,:;\-–—]*/gim, "");

  // Clean up excessive whitespace left behind
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}
