export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        AI
      </div>
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
        style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
      >
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: 'var(--accent)',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>
        <span>AI가 작성 중...</span>
      </div>
    </div>
  )
}
