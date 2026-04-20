import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatInput from "./components/ChatInput";
import Message from "./components/Message";
import WelcomeScreen from "./components/WelcomeScreen";
import TypingIndicator from "./components/TypingIndicator";
import API from "./services/api";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const chatEndRef = useRef(null);
  // Use ref to always have latest activeConversation in callbacks
  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleNewChat = useCallback(() => {
    // Save current chat before starting new one
    setMessages([]);
    setActiveConversation(null);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setMessages([...conv.messages]);
      setActiveConversation(id);
    }
  }, [conversations]);

  const saveConversation = useCallback((allMessages, firstUserInput) => {
    const convId = activeConvRef.current || Date.now().toString();

    setConversations((prevConvs) => {
      const existing = prevConvs.findIndex((c) => c.id === convId);

      if (existing >= 0) {
        // Update existing conversation
        const newConvs = [...prevConvs];
        newConvs[existing] = { ...newConvs[existing], messages: allMessages };
        return newConvs;
      } else {
        // Create new conversation
        const title = firstUserInput.length > 35
          ? firstUserInput.slice(0, 35) + "..."
          : firstUserInput;
        setActiveConversation(convId);
        return [{ id: convId, title, messages: allMessages }, ...prevConvs];
      }
    });
  }, []);

  const handleSend = useCallback(async (input) => {
    const userMsg = {
      role: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", input);
      const res = await API.post("/ask", formData);

      const aiMsg = {
        role: "bot",
        text: res.data.response || "Here are the results for your query:",
        sql: res.data.sql_query || null,
        results: res.data.results || null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        // Save to conversation history
        saveConversation(updated, input);
        return updated;
      });
    } catch (err) {
      const errorMsg = {
        role: "bot",
        text: "Sorry, something went wrong. Please ensure your dataset is uploaded and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        saveConversation(updated, input);
        return updated;
      });
    }

    setLoading(false);
  }, [saveConversation]);

  const handleSuggestionClick = useCallback((suggestion) => {
    handleSend(suggestion);
  }, [handleSend]);

  const handleUploadSuccess = useCallback(() => {
    const sysMsg = {
      role: "bot",
      text: "Dataset uploaded successfully! You can now ask questions about your data. Try: \"Show me all records\" or \"What columns are available?\"",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, sysMsg]);
  }, []);

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        conversations={conversations}
        activeConversation={activeConversation}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-dark/80 backdrop-blur-xl flex-shrink-0">
          {/* Sidebar Toggle */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-neon hover:bg-surface transition-all duration-200"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-white text-sm font-semibold">
              Ask<span className="text-neon">DB</span>
            </h1>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Connected" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-text-tertiary text-[11px]">
            <span className="hidden sm:inline">AI-Powered Database Assistant</span>
          </div>
        </header>

        {/* Chat Messages / Welcome */}
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <Message key={i} {...msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput onSend={handleSend} loading={loading} />
      </main>
    </div>
  );
}

export default App;