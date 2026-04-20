import { useState, useRef } from "react";

export default function ChatInput({ onSend, loading }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-expand textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="border-t border-border bg-dark/80 backdrop-blur-xl px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={`flex items-end gap-3 bg-surface-2 border rounded-2xl px-4 py-3 transition-all duration-300 ${
            input
              ? "border-neon/40 shadow-neon-sm"
              : "border-border hover:border-border-light"
          }`}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your data..."
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-text-tertiary text-sm leading-relaxed max-h-40 outline-none disabled:opacity-50"
            style={{ height: "auto" }}
          />

          {/* Send Button */}
          <button
            id="send-btn"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-all duration-200 ${
              input.trim() && !loading
                ? "bg-neon text-dark hover:shadow-neon hover:scale-105"
                : "bg-surface-3 text-text-tertiary cursor-not-allowed"
            }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-text-tertiary text-[10px] text-center mt-2.5 select-none">
          Press <kbd className="px-1.5 py-0.5 bg-surface rounded text-text-secondary font-mono text-[9px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-surface rounded text-text-secondary font-mono text-[9px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}