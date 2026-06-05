import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { sendMessage } from "../../services/chatService";
import "./Chat.css";

const SUGGESTIONS = [
  { icon: "💡", text: "¿Qué puedes hacer por mí?" },
  { icon: "🔍", text: "¿Qué información tienes sobre los usuarios?" },
  { icon: "✍️", text: "Quiero registrar un usuario" },
  { icon: "⚙️", text: "Quiero consultar un usuario" },
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

/* Hexagon / circuit node logo */
function GeminiStar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="gem-svg">
      {/* Outer hexagon */}
      <polygon
        points="24,4 41,13.5 41,34.5 24,44 7,34.5 7,13.5"
        stroke="url(#hex-stroke)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* Inner hexagon */}
      <polygon
        points="24,11 35,17 35,31 24,37 13,31 13,17"
        stroke="url(#hex-stroke)"
        strokeWidth="1"
        fill="url(#hex-fill)"
        opacity="0.9"
      />
      {/* Center dot */}
      <circle cx="24" cy="24" r="3.5" fill="url(#hex-stroke)" />
      {/* Connector lines */}
      <line x1="24" y1="11" x2="24" y2="17" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="31" x2="24" y2="37" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <line x1="13" y1="17" x2="17" y2="19.5" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <line x1="35" y1="17" x2="31" y2="19.5" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <line x1="13" y1="31" x2="17" y2="28.5" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <line x1="35" y1="31" x2="31" y2="28.5" stroke="url(#hex-stroke)" strokeWidth="1" opacity="0.5" />
      <defs>
        <linearGradient id="hex-stroke" x1="7" y1="4" x2="41" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c85f5" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c85f5" />
        </linearGradient>
        <linearGradient id="hex-fill" x1="13" y1="11" x2="35" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1f2e" />
          <stop offset="1" stopColor="#111420" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Chat;
