export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 mt-1">
        <svg className="w-4 h-4 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
        </svg>
      </div>

      {/* Typing dots */}
      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-5 py-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-neon/70"
            style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-neon/70"
            style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-neon/70"
            style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '0.4s' }}
          />
        </div>
        <p className="text-text-tertiary text-xs mt-2 animate-pulse">
          Analyzing your data...
        </p>
      </div>
    </div>
  );
}
