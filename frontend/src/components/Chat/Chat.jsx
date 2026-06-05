import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { sendMessage } from "../../services/chatService";
import "./Chat.css";

const SUGGESTIONS = [
  { icon: "💡", text: "¿Qué puedes hacer por mí?" },
  { icon: "🔍", text: "¿Qué información tienes sobre los usuarios?" },
  { icon: "✍️", text: "Ayúdame a redactar un mensaje" },
  { icon: "⚙️", text: "Explícame cómo funciona este sistema" },
];

function Chat({ sidebarOpen, onToggleSidebar, onFirstMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const firstMessageSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const createMessage = (role, content) => ({
    id: crypto.randomUUID(),
    role,
    content,
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!firstMessageSent.current) {
      firstMessageSent.current = true;
      onFirstMessage?.(text.slice(0, 40) + (text.length > 40 ? "…" : ""));
    }

    setMessages(prev => [...prev, createMessage("user", text)]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(text);
      setMessages(prev => [
        ...prev,
        createMessage("assistant", response.response ?? "Sin respuesta del servidor."),
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        createMessage("assistant", "Error al conectar con el servidor."),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <main className="chat-main">

      {/* Top bar */}
      <header className="chat-topbar">
        <div className="chat-topbar__left">
          {!sidebarOpen && (
            <button className="chat-topbar__btn" onClick={onToggleSidebar} aria-label="Abrir menú">
              <MenuIcon />
            </button>
          )}
        </div>
        <div className="chat-topbar__center">
          <span className="chat-topbar__name">MCP Assistant</span>
          <ChevronIcon />
        </div>
        <div className="chat-topbar__right" />
      </header>

      {/* Body */}
      <div className="chat-body">
        {isEmpty ? (
          <div className="chat-welcome">
            {/* Gemini-style shimmer logo */}
            <div className="chat-welcome__gem">
              <GeminiStar />
            </div>
            <h1 className="chat-welcome__greeting">
              <span className="chat-welcome__gradient">Hola,</span> ¿en qué te ayudo?
            </h1>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s.text}
                  className="chat-suggestion"
                  style={{ "--delay": `${i * 0.06}s` }}
                  onClick={() => {
                    setInput(s.text);
                    textareaRef.current?.focus();
                  }}
                >
                  <span className="chat-suggestion__icon">{s.icon}</span>
                  <span className="chat-suggestion__text">{s.text}</span>
                  <span className="chat-suggestion__arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map(msg => (
              <Message key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {loading && <Message role="assistant" content={null} loading />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-wrapper">
        <div className="chat-input-pill">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            value={input}
            placeholder="Pregúntale algo a MCP Assistant"
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Escribe un mensaje"
          />
          <div className="chat-input-actions">
            <button
              className={`chat-send-btn ${input.trim() && !loading ? "chat-send-btn--on" : ""}`}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </div>
        </div>
        <p className="chat-disclaimer">
          MCP Assistant puede cometer errores. Considera verificar la información.
        </p>
      </div>

    </main>
  );
}

/* ── Icons ── */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

/* Gemini star / sparkle logo */
function GeminiStar() {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="gem-svg">
      <path
        d="M14 2C14 2 15.5 9.5 20 14C15.5 18.5 14 26 14 26C14 26 12.5 18.5 8 14C12.5 9.5 14 2 14 2Z"
        fill="url(#gem-grad)"
      />
      <path
        d="M2 14C2 14 9.5 12.5 14 8C18.5 12.5 26 14 26 14C26 14 18.5 15.5 14 20C9.5 15.5 2 14 2 14Z"
        fill="url(#gem-grad2)"
      />
      <defs>
        <linearGradient id="gem-grad" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gem-grad2" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Chat;
