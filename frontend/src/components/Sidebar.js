import UploadPanel from "./UploadPanel";

export default function Sidebar({ open, setOpen, conversations, activeConversation, onNewChat, onSelectConversation, onUploadSuccess }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out ${
          open ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-sm font-semibold tracking-tight">AskDB</h2>
                <p className="text-text-tertiary text-[10px]">AI Database Assistant</p>
              </div>
            </div>
            <button
              id="sidebar-close-btn"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-white hover:bg-surface-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-3 py-3">
            <button
              id="new-chat-btn"
              onClick={onNewChat}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border hover:border-neon/30 hover:bg-surface-2 text-text-secondary hover:text-neon transition-all duration-200 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className="text-text-tertiary text-[10px] font-medium uppercase tracking-widest px-1 mb-2">
              Recent Chats
            </p>
            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                <p className="text-text-tertiary text-xs px-3 py-4 text-center">
                  No conversations yet.
                  <br />
                  <span className="text-[10px]">Start by asking a question!</span>
                </p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 truncate ${
                      activeConversation === conv.id
                        ? "bg-neon/10 text-neon border border-neon/20"
                        : "text-text-secondary hover:text-white hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span className="truncate">{conv.title}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-3" />

          {/* Upload Section */}
          <div className="px-3 py-3">
            <p className="text-text-tertiary text-[10px] font-medium uppercase tracking-widest px-1 mb-2">
              Dataset
            </p>
            <UploadPanel onUploadSuccess={onUploadSuccess} />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border">
            <p className="text-text-tertiary text-[10px] text-center">
              Powered by AI · v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}