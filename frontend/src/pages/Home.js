import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);

    return (
        <div className="flex">

            {/* Sidebar */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main */}
            <div className="flex-1 flex flex-col items-center justify-center h-screen relative">

                {/* Toggle button */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute left-4 top-4 text-green-400 text-2xl hover:scale-110"
                >
                    ☰
                </button>

                {/* Title */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-green-400">
                        AskDB ⚡
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Query your database using AI
                    </p>
                </div>

                {/* 🔥 CHAT HISTORY */}
                <div className="w-full max-w-2xl mb-4 space-y-2 overflow-y-auto max-h-60 px-2">
                    {history.map((msg, i) => (
                        <div key={i} className="bg-[#11161c] p-3 rounded-lg text-left shadow shadow-green-400/10">
                            {msg}
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <ChatInput setHistory={setHistory} history={history} />

            </div>
        </div>
    );
}