import { useAppStore } from '@/store/appStore'
import type { ChannelId } from '@/types'

interface Chip {
  id: ChannelId
  icon: string
  label: string
  color: string
}

const CHIPS: Chip[] = [
  { id: 'instagram', icon: '📷', label: '인스타그램', color: '#E1306C' },
  { id: 'kakao',     icon: '💬', label: '카카오채널', color: '#FFE812' },
  { id: 'blog',      icon: '✍️', label: '블로그',     color: '#00D4AA' },
  { id: 'sms',       icon: '📱', label: '문자 SMS',   color: '#FF9500' },
  { id: 'youtube',   icon: '▶️', label: '유튜브',     color: '#FF0000' },
  { id: 'email',     icon: '📧', label: '이메일',     color: '#6C63FF' },
]

export default function ChannelChips() {
  const activeChannels = useAppStore((s) => s.activeChannels)
  const toggleChannel = useAppStore((s) => s.toggleChannel)

  return (
    <div className="flex gap-2 px-4 pt-3 pb-2 flex-wrap">
      {CHIPS.map((chip) => {
        const isActive = activeChannels.includes(chip.id)
        const isOnlyOne = activeChannels.length === 1 && isActive

        return (
          <button
            key={chip.id}
            onClick={() => toggleChannel(chip.id)}
            title={isOnlyOne ? '최소 1개 채널은 선택해야 합니다' : undefined}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              isActive
                ? {
                    background: chip.color + '18',
                    color: chip.id === 'kakao' ? '#1a1a1a' : chip.color,
                    border: `1.5px solid ${chip.color}`,
                    boxShadow: `0 2px 8px ${chip.color}40`,
                  }
                : {
                    background: '#F5F4FF',
                    color: 'var(--text-faint)',
                    border: '1.5px solid var(--border)',
                    opacity: 0.6,
                  }
            }
          >
            {/* 체크박스 */}
            <span
              className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
              style={{
                background: isActive ? chip.color : 'transparent',
                border: isActive ? `2px solid ${chip.color}` : '2px solid var(--border)',
              }}
            >
              {isActive && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path
                    d="M1 3.5L3.5 6L8 1"
                    stroke={chip.id === 'kakao' ? '#1a1a1a' : '#fff'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}
