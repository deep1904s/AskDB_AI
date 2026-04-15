import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ChatInput({ history, setHistory }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!input.trim() || loading) return;

        setLoading(true);

        // 🔥 Add to chat history
        setHistory([...history, input]);

        try {
            const formData = new FormData();
            formData.append("question", input);

            const res = await API.post("/ask", formData);

            navigate("/result", {
                state: {
                    question: input,
                    sql: res.data.sql_query,
                    results: res.data.results,
                },
            });

        } catch (err) {
            alert("❌ Something went wrong. Try again.");
        }

        setLoading(false);
        setInput("");
    };

    // ENTER support
    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        <div className="w-full max-w-2xl">

            {/* INPUT BOX */}
            <div className="flex bg-[#11161c] border border-gray-800 rounded-xl p-2 shadow-lg shadow-green-400/10">

                <input
                    className="flex-1 bg-transparent p-3 outline-none text-white placeholder-gray-500"
                    placeholder="Ask anything about your data..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${loading
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-green-400 text-black hover:bg-green-300 neon-btn"
                        }`}
                >
                    {loading ? "..." : "Ask"}
                </button>

            </div>

            {/* 🔥 PREMIUM LOADING OVERLAY */}
            {loading && (
                <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">

                    <div className="flex gap-2 mb-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-300"></div>
                    </div>

                    <h2 className="text-green-400 text-xl">
                        AI is analyzing your data...
                    </h2>

                    <p className="text-gray-400 mt-2 animate-pulse">
                        Generating SQL & insights...
                    </p>

                </div>
            )}

        </div>
    );
}