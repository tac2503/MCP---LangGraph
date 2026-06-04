import { useState } from "react";
import Message from "./Message";
import { sendMessage } from "../../services/chatService";


import "./Chat.css";
import "./Message.css";

function Chat() {

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    

    const handleSend = async () => {

        if (!input.trim()) return;

        const userMessage = input;

        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);

        setInput("");

        setLoading(true);

        try {

            const response = await sendMessage(
                
                userMessage
            );

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: response.response
                }
            ]);

        } catch (error) {

            console.error(error);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Error conectando con el servidor."
                }
            ]);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="chat-container">

            <div className="messages-container">

                {messages.map((msg, index) => (
                    <Message
                        key={index}
                        role={msg.role}
                        content={msg.content}
                    />
                ))}

                {loading && (
                    <Message
                        role="assistant"
                        content="Pensando..."
                    />
                )}

            </div>

            <div className="input-container">

                <input
                    type="text"
                    value={input}
                    placeholder="Escribe un mensaje..."
                    onChange={(e) =>
                        setInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                />

                <button onClick={handleSend}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default Chat;