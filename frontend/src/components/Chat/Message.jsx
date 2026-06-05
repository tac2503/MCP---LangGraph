import "./Message.css";

function Message({ role, content, loading }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="msg msg--user">
        <div className="msg__bubble">
          <MessageContent content={content} />
        </div>
      </div>
    );
  }

  return (
    <div className="msg msg--assistant">
      <div className="msg__gem-avatar">
        <GemMiniIcon />
      </div>
      <div className="msg__body">
        {loading ? (
          <div className="msg__shimmer">
            <span className="msg__shimmer-bar" style={{ width: "60%" }} />
            <span className="msg__shimmer-bar" style={{ width: "80%" }} />
            <span className="msg__shimmer-bar" style={{ width: "45%" }} />
          </div>
        ) : (
          <div className="msg__text">
            <MessageContent content={content} />
          </div>
        )}
      </div>
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
          const newline = inner.indexOf("\n");
          const lang = newline > -1 ? inner.slice(0, newline).trim() : "";
          const code = newline > -1 ? inner.slice(newline + 1) : inner;
          return (
            <pre key={i} className="msg__code">
              {lang && <span className="msg__code-lang">{lang}</span>}
              <code>{code}</code>
            </pre>
          );
        }

        const inlineParts = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {inlineParts.map((ip, j) => {
              if (ip.startsWith("**") && ip.endsWith("**")) {
                return <strong key={j}>{ip.slice(2, -2)}</strong>;
              }
              return ip.split("\n").map((line, k, arr) => (
                <span key={k}>
                  {line}
                  {k < arr.length - 1 && <br />}
                </span>
              ));
            })}
          </span>
        );
      })}
    </>
  );
}

function GemMiniIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
      {/* Mini hexagon circuit */}
      <polygon
        points="10,2 17,5.5 17,14.5 10,18 3,14.5 3,5.5"
        stroke="url(#mini-grad)"
        strokeWidth="1.5"
        fill="#111420"
      />
      <circle cx="10" cy="10" r="2.2" fill="url(#mini-grad)" />
      <line x1="10" y1="2"  x2="10" y2="7.8"  stroke="url(#mini-grad)" strokeWidth="1" opacity="0.5" />
      <line x1="10" y1="12.2" x2="10" y2="18" stroke="url(#mini-grad)" strokeWidth="1" opacity="0.5" />
      <defs>
        <linearGradient id="mini-grad" x1="3" y1="2" x2="17" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c85f5" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Message;
