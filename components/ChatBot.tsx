'use client';

import { Bot, Loader2, Send, Sparkles, User, Wrench, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { quickReplies } from '@/lib/chatbot/suggested-questions';
import { Button } from './Button';
import { type ChatProject, ChatProjectCard } from './ChatProjectCard';
import { useChat } from './ChatProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Portfolio tools the assistant consulted to build this answer. */
  tools?: string[];
  /** Projects the tools surfaced, rendered as real cards under the answer. */
  projects?: ChatProject[];
  /** Suggested next questions, offered once the answer is complete. */
  followups?: string[];
  /**
   * An error notice rather than an answer. Shown to the visitor but never sent
   * back as history - the model would otherwise read it as something it said.
   */
  failed?: boolean;
  /** Set when the answer was cut short; shown under the partial text. */
  notice?: string;
}

const FALLBACK_ERROR =
  "I can't reach my brain right now. Try again in a moment, or email Liron directly at lironbenharrouch@gmail.com.";

/** Turn `get_project_details` into `project details` for the UI. */
function prettyToolName(name: string) {
  return name.replace(/^get_/, '').replace(/_/g, ' ');
}

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi — I'm Liron's AI assistant. I read his actual project files, skills and experience, so ask me anything specific: a technology, a project, his availability.",
  timestamp: new Date(0),
};

export function ChatBot() {
  const { isOpen, openChat, closeChat, pendingQuestion, clearPendingQuestion, heroPromptVisible } =
    useChat();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Still true while the answer streams in, after the spinner has gone. A second
  // question sent then used to vanish without a trace.
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  // Mirrors `messages` so sendMessage can read the history without a stale closure
  // and without doing side effects inside a state updater.
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is the trigger, not a value read inside the effect - we scroll whenever one is added.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlight.current) return;

    inFlight.current = true;
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const history = messagesRef.current;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    const replyId = `a-${Date.now()}`;
    let replyText = '';
    let replyFailed = false;
    const updateReply = (patch: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === replyId ? patch(m) : m)));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, userMessage]
            .filter((m) => m.id !== 'greeting' && !m.failed)
            .map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      // The answer streams in as newline-delimited JSON events.
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'assistant', content: '', timestamp: new Date() },
      ]);
      setIsLoading(false);

      const decoder = new TextDecoder();
      let buffer = '';

      const applyEvent = (event: {
        type: string;
        value?: string;
        names?: string[];
        items?: unknown;
      }) => {
        if (event.type === 'text') {
          replyText += event.value ?? '';
          updateReply((m) => ({ ...m, content: m.content + (event.value ?? '') }));
        } else if (event.type === 'tools') {
          updateReply((m) => ({ ...m, tools: event.names }));
        } else if (event.type === 'projects') {
          updateReply((m) => ({ ...m, projects: event.items as ChatProject[] }));
        } else if (event.type === 'followups') {
          updateReply((m) => ({ ...m, followups: event.items as string[] }));
        } else if (event.type === 'error') {
          // Nothing written yet: the notice becomes the message. Otherwise keep
          // the partial answer and flag it as cut short.
          const value = event.value || FALLBACK_ERROR;
          replyFailed = !replyText;
          updateReply((m) =>
            replyText ? { ...m, notice: value } : { ...m, content: value, failed: true }
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            applyEvent(JSON.parse(line));
          } catch {
            // Partial frame; the remainder stays in `buffer`.
          }
        }
      }

      // A stream that closed without a word would leave a cursor blinking forever.
      if (!replyText && !replyFailed) {
        updateReply((m) => ({ ...m, content: FALLBACK_ERROR, failed: true }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      // The API explains quota and rate-limit situations in plain language;
      // prefer its wording over a generic failure message.
      const fromServer = error instanceof Error ? error.message : '';
      const isUseful =
        fromServer && !/^(failed to fetch|load failed|networkerror)/i.test(fromServer);
      const content = isUseful ? fromServer : FALLBACK_ERROR;

      setMessages((prev) => {
        const reply = prev.find((m) => m.id === replyId);
        // The connection dropped mid-answer: keep what arrived, flag the rest.
        if (reply?.content) {
          return prev.map((m) => (m.id === replyId ? { ...m, notice: FALLBACK_ERROR } : m));
        }
        const error: Message = {
          id: replyId,
          role: 'assistant',
          content,
          timestamp: new Date(),
          failed: true,
        };
        return reply ? prev.map((m) => (m.id === replyId ? error : m)) : [...prev, error];
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      inFlight.current = false;
    }
  }, []);

  // A question handed over from the hero bar: send it as soon as the panel opens.
  useEffect(() => {
    if (isOpen && pendingQuestion) {
      const question = pendingQuestion;
      clearPendingQuestion();
      void sendMessage(question);
    }
  }, [isOpen, pendingQuestion, clearPendingQuestion, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  if (!isOpen) {
    // The hero already offers the same action right there; showing the launcher
    // on top of it overlapped the suggestion chips on a phone.
    if (heroPromptVisible) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!hasBeenOpened && (
          <span className="hidden sm:block rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm">
            Ask my AI about my work
          </span>
        )}
        <button
          type="button"
          onClick={() => openChat()}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-e3 transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
          aria-label="Open AI assistant"
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:blur-md" />
          <Sparkles className="relative z-10 h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-150 max-h-[calc(100vh-3rem)] w-100 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-e3">
      <div className="flex items-center justify-between border-b border-border bg-linear-to-r from-primary/10 via-primary/5 to-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ask about Liron</h3>
            <p className="text-xs text-muted-foreground">Answers from his real portfolio data</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeChat}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted/60"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`flex-1 rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'rounded-tr-none bg-primary text-primary-foreground'
                  : 'rounded-tl-none bg-muted/60 text-foreground'
              }`}
            >
              {message.tools && message.tools.length > 0 && (
                <p className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                  <Wrench className="h-3 w-3" aria-hidden="true" />
                  <span>Looked up: {message.tools.map(prettyToolName).join(', ')}</span>
                </p>
              )}
              {message.role === 'assistant' ? (
                <>
                  {message.content === '' ? (
                    <span className="inline-block h-4 w-1.5 animate-pulse rounded-xs bg-muted-foreground align-middle" />
                  ) : (
                    // No rehype-raw here: the text comes from an LLM, so raw HTML
                    // must never be rendered.
                    <div className="chat-markdown text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline underline-offset-2"
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {message.notice && (
                    <p className="mt-2 text-xs italic text-muted-foreground">{message.notice}</p>
                  )}

                  {message.projects && message.projects.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.projects.map((project) => (
                        <ChatProjectCard
                          key={project.slug}
                          project={project}
                          onNavigate={closeChat}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Follow-up suggestions attached to the most recent answer */}
        {(() => {
          const latest = messages[messages.length - 1];
          if (!latest?.followups?.length || isStreaming) return null;
          return (
            <div className="flex flex-wrap gap-2 pl-11">
              {latest.followups.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => void sendMessage(question)}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/15"
                >
                  {question}
                </button>
              ))}
            </div>
          );
        })()}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-none bg-muted/60 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && !isLoading && (
        <div className="border-t border-border bg-background/95 px-4 pb-2 pt-3">
          <p className="mb-2 text-xs text-muted-foreground">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => void sendMessage(question)}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border bg-background/95 p-4 backdrop-blur-xs">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about a project, a stack, availability..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-muted/40 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <Button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI-generated · may occasionally be wrong
        </p>
      </div>
    </div>
  );
}
