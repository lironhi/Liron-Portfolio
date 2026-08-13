'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ChatContextValue {
  isOpen: boolean;
  /** Question handed over by another component (hero bar, quick reply link...). */
  pendingQuestion: string | null;
  openChat: (question?: string) => void;
  closeChat: () => void;
  /** Called by the ChatBot once it has consumed the pending question. */
  clearPendingQuestion: () => void;
  /**
   * True while the hero's own question bar is on screen. The floating launcher
   * hides then - on a phone it sat on top of the hero's suggestion chips, and
   * offering the same action twice within one screen is noise anyway.
   */
  heroPromptVisible: boolean;
  setHeroPromptVisible: (visible: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [heroPromptVisible, setHeroPromptVisible] = useState(false);

  const openChat = useCallback((question?: string) => {
    if (question?.trim()) {
      setPendingQuestion(question.trim());
    }
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);
  const clearPendingQuestion = useCallback(() => setPendingQuestion(null), []);

  const value = useMemo(
    () => ({
      isOpen,
      pendingQuestion,
      openChat,
      closeChat,
      clearPendingQuestion,
      heroPromptVisible,
      setHeroPromptVisible,
    }),
    [isOpen, pendingQuestion, openChat, closeChat, clearPendingQuestion, heroPromptVisible]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used inside <ChatProvider>');
  }
  return ctx;
}
