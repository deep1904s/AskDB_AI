import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex">

            {/* Sidebar */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main */}
            <div className="flex-1 flex flex-col items-center justify-center h-screen">

                {/* Toggle button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute left-4 top-4 text-green-400"
                >
                    ☰
                </button>

                {/* Center Chat */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-400">
                        AskDB ⚡
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Query your database using AI
                    </p>
                </div>

                <ChatInput />

            </div>
        </div>
    );
}