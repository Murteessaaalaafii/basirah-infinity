import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white glow"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="assistant-glass fixed bottom-24 right-6 z-50 flex h-[560px] w-[92vw] max-w-[400px] flex-col overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/25 px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold">Nova · AI Strategist</p>
                <p className="text-xs opacity-80">Powered by Basirah Infinity</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="space-y-3 text-sm">
                  <p className="opacity-90">Hey 👋 I'm Nova. Ask me about:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Build my brand", "AI for my business", "Pricing", "Get started"].map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage({ text: q })}
                        className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                const mine = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-white/90 text-deep-night"
                          : "assistant-glass border border-white/30"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-1 px-2 opacity-80">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            <form onSubmit={submit} className="flex gap-2 border-t border-white/25 p-3">
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nova anything…"
                className="flex-1 rounded-xl bg-white/15 px-3 py-2 text-sm text-white placeholder:text-white/60 outline-none ring-1 ring-white/25 focus:ring-white/60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid place-items-center rounded-xl bg-white/90 px-3 text-deep-night disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
