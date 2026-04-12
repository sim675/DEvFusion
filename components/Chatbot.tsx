"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ConversationContext, ChatFilters } from "@/utils/chatTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = "user" | "bot";

interface Message {
  id: number;
  sender: Sender;
  text: string;
}

interface ChatApiSuccess {
  success: true;
  intent: string;
  route: string | null;
  reply: string;
  filters: ChatFilters;
  context: ConversationContext;
}

interface ChatApiError {
  success: false;
  error: string;
}

type ChatApiResponse = ChatApiSuccess | ChatApiError;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const router = useRouter();

  const [isOpen, setIsOpen]   = useState(false);
  const [input, setInput]     = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // useRef for IDs — synchronous, no stale-closure race condition
  const idRef = useRef(1);

  /** Multi-turn conversation context sent to the API on every request */
  const [context, setContext] = useState<ConversationContext>({});

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: "bot",
      text: "Hi! 👋 I'm your VendorHub assistant. Ask me to find products, track orders, or anything else!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);


  function addMessage(sender: Sender, text: string) {
    const id = idRef.current++;
    setMessages((prev) => [...prev, { id, sender, text }]);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    addMessage("user", trimmed);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context }),
      });

      // Minimum visible delay for typing indicator
      await new Promise((r) => setTimeout(r, 500));

      const data: ChatApiResponse = await res.json();

      if (!res.ok || !data.success) {
        addMessage(
          "bot",
          (data as ChatApiError).error ?? "Something went wrong, try again."
        );
        return;
      }

      const success = data as ChatApiSuccess;

      // ── Update conversation context for next turn ─────────────────────
      setContext(success.context);

      addMessage("bot", success.reply);

      // ── Auto-redirect after a short pause ─────────────────────────────
      if (success.route) {
        setTimeout(() => router.push(success.route as string), 1000);
      }
    } catch {
      addMessage("bot", "Something went wrong, try again.");
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="
            flex flex-col w-80 sm:w-96 h-[30rem]
            rounded-2xl overflow-hidden shadow-2xl
            border border-white/10
            bg-white dark:bg-zinc-900
            animate-in fade-in slide-in-from-bottom-4 duration-200
          "
          role="dialog"
          aria-label="VendorHub Chatbot"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white leading-none">VendorHub AI</p>
              <p className="text-xs text-indigo-200 mt-0.5">Smart Assistant</p>
            </div>
            <button
              id="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white/60 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <span className="mr-1.5 mt-1 text-base shrink-0">🤖</span>
                )}
                <p
                  className={`
                    max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm"
                    }
                  `}
                >
                  {msg.text}
                </p>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start items-center gap-1 pl-1">
                <span className="text-base shrink-0">🤖</span>
                <div className="flex gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Context badge — visible when bot remembers something */}
          {context.lastIntent && context.lastIntent !== "unknown" && (
            <div className="px-3 pb-1 flex items-center gap-1.5">
              <div className="flex-1 text-xs text-zinc-400 dark:text-zinc-500 truncate">
                <span className="text-indigo-400">↩</span>{" "}
                Remembering:{" "}
                <span className="italic">
                  {context.lastQuery ?? context.lastIntent}
                  {context.lastFilters?.priceMax
                    ? ` · ₹${context.lastFilters.priceMax}`
                    : ""}
                  {context.lastFilters?.nearby ? " · nearby" : ""}
                </span>
              </div>
              <button
                id="chatbot-clear-context-btn"
                onClick={() => setContext({})}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
                title="Clear conversation memory"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                context.lastIntent && context.lastIntent !== "unknown"
                  ? "Refine your search..."
                  : "Ask me anything..."
              }
              disabled={isTyping}
              className="
                flex-1 text-sm px-3 py-2 rounded-xl outline-none
                bg-zinc-100 dark:bg-zinc-800
                text-zinc-900 dark:text-zinc-100
                placeholder-zinc-400 dark:placeholder-zinc-500
                disabled:opacity-50
                focus:ring-2 focus:ring-indigo-500 transition
              "
            />
            <button
              id="chatbot-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="
                flex items-center justify-center w-9 h-9 rounded-xl
                bg-indigo-600 hover:bg-indigo-700 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Button ───────────────────────────────────────────────── */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        className="
          relative flex items-center justify-center w-14 h-14 rounded-full
          bg-indigo-600 hover:bg-indigo-700 active:scale-95
          shadow-lg shadow-indigo-500/40
          text-white text-2xl
          transition-all duration-200
        "
      >
        {isOpen ? "✕" : "💬"}
        {/* Unread pulse when closed and context is active */}
        {!isOpen && context.lastIntent && context.lastIntent !== "unknown" && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-zinc-900" />
        )}
      </button>
    </div>
  );
}
