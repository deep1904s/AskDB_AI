import { useState } from "react";

export default function Message({ role, text, sql, results, timestamp }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    if (!results || results.length === 0) return;
    const keys = Object.keys(results[0]);
    const csv = [
      keys.join(","),
      ...results.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "askdb_results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 animate-fade-in-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
      style={{ opacity: 0 }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
          isUser
            ? "bg-neon/15 border border-neon/30"
            : "bg-surface-2 border border-border"
        }`}
      >
        {isUser ? (
          <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Label */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : ""}`}>
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
            {isUser ? "You" : "AskDB"}
          </span>
          {timestamp && (
            <span className="text-[10px] text-text-tertiary">
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-neon text-dark rounded-tr-sm"
              : "bg-surface border border-border rounded-tl-sm"
          }`}
        >
          <p className={`text-sm leading-relaxed ${isUser ? "text-dark font-medium" : "text-white"}`}>
            {text}
          </p>
        </div>

        {/* SQL Block */}
        {sql && (
          <div className="mt-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neon/70 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                Generated SQL
              </span>
              <button
                onClick={handleCopySQL}
                className="text-[10px] px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary hover:text-neon hover:bg-surface-3 border border-border transition-all"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="code-block p-3.5 text-neon/90 text-xs overflow-x-auto">
              <code>{sql}</code>
            </pre>
          </div>
        )}

        {/* Results Table */}
        {results && results.length > 0 && (
          <div className="mt-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neon/70 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125" />
                </svg>
                Results
                <span className="ml-1 px-1.5 py-0.5 bg-neon/10 text-neon rounded text-[9px] font-semibold">
                  {results.length} rows
                </span>
              </span>
              <button
                onClick={downloadCSV}
                className="text-[10px] px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary hover:text-neon hover:bg-surface-3 border border-border transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                CSV
              </button>
            </div>
            <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(results[0]).map((key, j) => (
                        <td key={j}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error display */}
        {results && results.length === 0 && (
          <div className="mt-3 px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary text-sm animate-fade-in">
            <span className="text-neon/60 mr-2">ℹ</span>
            No results found for this query.
          </div>
        )}
      </div>
    </div>
  );
}