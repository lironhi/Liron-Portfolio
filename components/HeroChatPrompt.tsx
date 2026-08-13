'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { heroSuggestions } from '@/lib/chatbot/suggested-questions';
import { useChat } from './ChatProvider';

export function HeroChatPrompt() {
  const { openChat, setHeroPromptVisible } = useChat();
  const [value, setValue] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  // Tell the launcher to step aside while this bar is on screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroPromptVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      setHeroPromptVisible(false);
    };
  }, [setHeroPromptVisible]);

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    openChat(trimmed);
    setValue('');
  };

  return (
    <div ref={rootRef} className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="group relative"
      >
        {/* Glow behind the bar, so it reads as the primary action of the page */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-2xl bg-linear-to-r from-primary/40 via-primary/10 to-primary/40 opacity-60 blur-sm transition-opacity duration-500 group-focus-within:opacity-100"
        />

        <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
          <Sparkles className="ml-2 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask my AI anything about my work..."
            aria-label="Ask my AI assistant a question about Liron's work"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground outline-hidden placeholder:text-muted-foreground sm:text-base"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
          >
            <span className="hidden sm:inline">Ask</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {heroSuggestions.map((question) => (
          <button
            type="button"
            key={question}
            onClick={() => submit(question)}
            className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
          >
            {question}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Answers are generated from my real project files and CV data — not a scripted FAQ.
      </p>
    </div>
  );
}
