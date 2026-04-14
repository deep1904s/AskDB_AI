import React, { useState } from "react";
import API from "../services/api";
import Message from "./Message";

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        const formData = new FormData();
        formData.append("question", input);

        const res = await API.post("/ask", formData);

        const botMessage = {
            role: "bot",
            text: "Here is your result:",
            sql: res.data.sql_query,
            results: res.data.results
        };

        setMessages((prev) => [...prev, botMessage]);
        setInput("");
    };

    return (
        <div>
            <h2>Ask your data 💬</h2>

            <div style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "400px",
                overflowY: "scroll"
            }}>
                {messages.map((msg, index) => (
                    <Message key={index} {...msg} />
                ))}
            </div>

            <div style={{ marginTop: "10px" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    style={{ width: "80%", padding: "10px" }}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}