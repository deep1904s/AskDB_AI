import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ChatInput() {
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!input) return;

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
    };

    return (
        <div className="w-full max-w-2xl">

            <div className="flex bg-[#11161c] border border-gray-800 rounded-xl p-2">

                <input
                    className="flex-1 bg-transparent p-3 outline-none text-white"
                    placeholder="Ask anything about your data..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="bg-green-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-300"
                >
                    Ask
                </button>

            </div>

        </div>
    );
}