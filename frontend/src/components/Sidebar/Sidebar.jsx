import "./Sidebar.css";

function Sidebar({ open, onToggle, conversations, activeId, onSelect, onNewChat }) {
  return (
    <>
      {open && <div className="sb-overlay" onClick={onToggle} />}

      <aside className={`sb ${open ? "sb--open" : "sb--closed"}`}>

        {/* Header */}
        <div className="sb__header">
          <button className="sb__icon-btn" onClick={onToggle} aria-label="Cerrar menú">
            <MenuIcon />
          </button>
          <button className="sb__new-btn" onClick={onNewChat} aria-label="Nueva conversación">
            <PenIcon />
            {open && <span>Nuevo chat</span>}
          </button>
        </div>

        {/* Nav */}
        {open && (
          <nav className="sb__nav">
            <p className="sb__label">Recientes</p>
            {conversations.map(c => (
              <button
                key={c.id}
                className={`sb__item ${c.id === activeId ? "sb__item--active" : ""}`}
                onClick={() => onSelect(c.id)}
              >
                <ChatIcon />
                <span className="sb__item-title">{c.title}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Footer */}
        <div className="sb__footer">
          <div className="sb__user-btn">
            <div className="sb__avatar">U</div>
            {open && <span className="sb__username">Usuario</span>}
          </div>
        </div>

      </aside>
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default Sidebar;
