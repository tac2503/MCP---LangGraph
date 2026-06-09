import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import { sendMessage } from "../../services/chatService";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(text);
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.response ?? "Sin respuesta." },
      ]);
    } catch (error) {
      const mensajeError = error.response?.data?.error ?? "Error al conectar con el servidor.";
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: mensajeError },
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

  return (
    <div className="chat">

      {/* Header */}
      <header className="chat__header">
        <div className="chat__logo">
          <HexIcon />
        </div>
        <span className="chat__title">MCP Assistant</span>
      </header>

      {/* Messages */}
      <div className="chat__body">
        {messages.length === 0 ? (
          <div className="chat__empty">
            <p>Escribí algo para comenzar.</p>
          </div>
        ) : (
          messages.map(msg => (
            <Message key={msg.id} role={msg.role} content={msg.content} />
          ))
        )}
        {loading && <Message role="assistant" loading />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat__footer">
        <div className="chat__input-box">
          <textarea
            ref={textareaRef}
            className="chat__textarea"
            rows={1}
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className={`chat__send ${input.trim() && !loading ? "chat__send--active" : ""}`}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Enviar"
          >
            <SendIcon />
          </button>
        </div>
      </div>

    </div>
  );
}

function HexIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 41,13.5 41,34.5 24,44 7,34.5 7,13.5"
        stroke="url(#h1)" strokeWidth="2" fill="none" />
      <polygon points="24,12 35,18 35,30 24,36 13,30 13,18"
        stroke="url(#h1)" strokeWidth="1.5" fill="#111420" />
      <circle cx="24" cy="24" r="3.5" fill="url(#h1)" />
      <defs>
        <linearGradient id="h1" x1="7" y1="4" x2="41" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c85f5" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default Chat;
