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
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path
        d="M10 1.5C10 1.5 11 6.8 14.5 10C11 13.2 10 18.5 10 18.5C10 18.5 9 13.2 5.5 10C9 6.8 10 1.5 10 1.5Z"
        fill="url(#gm1)"
      />
      <path
        d="M1.5 10C1.5 10 6.8 9 10 5.5C13.2 9 18.5 10 18.5 10C18.5 10 13.2 11 10 14.5C6.8 11 1.5 10 1.5 10Z"
        fill="url(#gm2)"
      />
      <defs>
        <linearGradient id="gm1" x1="10" y1="1.5" x2="10" y2="18.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gm2" x1="1.5" y1="10" x2="18.5" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Message;
