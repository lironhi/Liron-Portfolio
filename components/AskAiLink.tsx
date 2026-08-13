'use client';

import { Sparkles } from 'lucide-react';
import { useChat } from './ChatProvider';

/**
 * Opens the AI assistant from anywhere. Kept as its own client component so
 * server components (Footer, Nav) don't have to opt into client rendering.
 */
export function AskAiLink({ className }: { className?: string }) {
  const { openChat } = useChat();

  return (
    <button
      type="button"
      onClick={() => openChat()}
      className={
        className ?? 'inline-flex items-center gap-1.5 transition-colors hover:text-foreground'
      }
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      Ask my AI
    </button>
  );
}
