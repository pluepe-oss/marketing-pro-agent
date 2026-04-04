import type { Message } from '@/types'
import ChannelCards, { hasChannelMarkers } from './ChannelCards'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const isChannelResponse = !isUser && hasChannelMarkers(message.content)

  if (isChannelResponse) {
    return (
      // items-start: 아바타와 카드 영역이 각자 고유 높이 유지 (stretch 금지 — 카드 하단 잘림 원인)
      <div className="flex gap-3 flex-row items-start">
        {/* AI 아바타 */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          AI
        </div>
        {/* 채널 카드 영역 */}
        <div className="flex-1 min-w-0 max-w-[90%]">
          <ChannelCards content={message.content} />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 아바타 */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
        style={{
          background: isUser ? 'var(--accent2)' : 'var(--accent)',
          color: '#fff',
        }}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* 말풍선 */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #EEF0FF, #E8E4FF)'
            : '#FFFFFF',
          color: 'var(--text)',
          border: isUser
            ? '1px solid rgba(108,99,255,0.2)'
            : '1px solid #E8E6FF',
          boxShadow: isUser ? 'none' : '0 2px 8px rgba(108,99,255,0.06)',
        }}
      >
        {message.content || <span style={{ color: 'var(--text-faint)' }}>…</span>}
      </div>
    </div>
  )
}
