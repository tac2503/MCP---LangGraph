import "./Message.css";

function Message({ role, content, loading }) {
  const isUser = role === "user";

  return (
    <div className={`msg msg--${isUser ? "user" : "assistant"}`}>
      {loading ? (
        <div className="msg__thinking">
          <span className="msg__thinking-dot" />
          <span className="msg__thinking-dot" />
          <span className="msg__thinking-dot" />
          <span className="msg__thinking-label">Pensando</span>
        </div>
      ) : (
        <div className="msg__content">
          <MessageContent content={content} />
        </div>
      )}
    </div>
  );
}

function MessageContent({ content }) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const inner = part.slice(3, -3);
          const nl = inner.indexOf("\n");
          const lang = nl > -1 ? inner.slice(0, nl).trim() : "";
          const code = nl > -1 ? inner.slice(nl + 1) : inner;
          return (
            <pre key={i} className="msg__code">
              {lang && <span className="msg__code-lang">{lang}</span>}
              <code>{code}</code>
            </pre>
          );
        }

        return part.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
          if (chunk.startsWith("**") && chunk.endsWith("**")) {
            return <strong key={`${i}-${j}`}>{chunk.slice(2, -2)}</strong>;
          }
          return chunk.split("\n").map((line, k, arr) => (
            <span key={`${i}-${j}-${k}`}>
              {line}{k < arr.length - 1 && <br />}
            </span>
          ));
        });
      })}
    </>
  );
}

export default Message;
