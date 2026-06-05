import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";
import "./App.css";

function App() {
  const [conversations, setConversations] = useState([
    { id: "1", title: "Nueva conversación" }
  ]);
  const [activeId, setActiveId] = useState("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = () => {
    const id = crypto.randomUUID();
    setConversations(prev => [{ id, title: "Nueva conversación" }, ...prev]);
    setActiveId(id);
  };

  const renameConversation = (id, title) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title } : c))
    );
  };

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
      />
      <Chat
        key={activeId}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onFirstMessage={(title) => renameConversation(activeId, title)}
      />
    </div>
  );
}

export default App;
