import { useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { useAppStore } from '@/store/appStore'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export default function ChatMessages() {
  const { messages, isLoading } = useChat()
  const resetAll = useAppStore((s) => s.resetAll)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  return (
    /* 채팅 컨테이너: 세로 배치, main의 남은 공간 전부 차지 */
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
      background: '#F8F7FF',
    }}>

      {/* 초기화 버튼 — 스크롤 영역 밖 고정, 높이 축소 없음 */}
      {messages.length > 0 && (
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 4px' }}>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fff5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
          >
            <span>🗑</span>
            <span>초기화</span>
          </button>
        </div>
      )}

      {/* 스크롤 컨테이너: 이 div만 스크롤, 외부로 절대 넘치지 않음 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
      }}>
        {/* 내용 래퍼: 스크롤 내부 콘텐츠, 높이는 내용에 따라 자동 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '12px 16px 20px',
        }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-5 py-20">
              <div style={{ filter: 'drop-shadow(0 8px 24px rgba(108,99,255,0.3))' }}>
                <span
                  style={{
                    fontSize: '64px',
                    backgroundImage: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  ✦
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-base" style={{ color: '#1A1535', fontWeight: 900 }}>
                  마케팅 콘텐츠 생성을 시작하세요
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  좌측에서 템플릿을 선택하거나 직접 입력하세요
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {/* 최신 메시지로 자동 스크롤되는 앵커 */}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
