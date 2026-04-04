import { useAppStore } from '@/store/appStore'
import { useApiKey } from '@/hooks/useApiKey'
import type { Language } from '@/types'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'EN' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
]

export default function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const { hasKey } = useApiKey()

  return (
    <header
      className="flex items-center justify-between px-4 h-16 shrink-0"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #DDD9FF, 0 4px 20px rgba(108,99,255,0.06)',
      }}
    >
      {/* 좌측: 햄버거 + 앱명 */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          aria-label="사이드바 토글"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="3" width="18" height="2" rx="1" fill="currentColor" />
            <rect y="8" width="18" height="2" rx="1" fill="currentColor" />
            <rect y="13" width="18" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-sm leading-tight" style={{ fontWeight: 800, color: '#1A1535' }}>
              MultiChannel AI Marketer
            </span>
            <span className="text-xs leading-tight" style={{ color: 'var(--accent)' }}>
              AI가 SNS 채널별 마케팅 콘텐츠를 자동 생성합니다
            </span>
          </div>
          {/* AI Powered 뱃지 */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(108,99,255,0.15), rgba(255,107,157,0.15))',
              border: '1px solid rgba(108,99,255,0.3)',
            }}
          >
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #6C63FF, #FF6B9D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ✦ AI Powered
            </span>
          </span>
        </div>
      </div>

      {/* 우측: 언어 버튼 + 연결 상태 */}
      <div className="flex items-center gap-3">
        {/* 콘텐츠 생성 언어 선택 레이블 */}
        <span className="text-xs" style={{ color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
          콘텐츠 생성 언어
        </span>

        {/* 언어 버튼 4개 */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface2)' }}>
          {LANGUAGES.map((l) => {
            const isActive = language === l.value
            return (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className="px-3 py-1.5 text-xs font-medium transition-all rounded-lg"
                style={{
                  background: isActive ? '#6C63FF' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 2px 8px rgba(108,99,255,0.3)' : 'none',
                }}
              >
                {l.label}
              </button>
            )
          })}
        </div>

        {/* 연결 상태 배지 */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: hasKey ? '#00B89418' : 'var(--surface2)',
            color: hasKey ? '#00B894' : 'var(--text-faint)',
            border: `1px solid ${hasKey ? '#00B89455' : 'var(--border)'}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: hasKey ? '#00B894' : 'var(--text-faint)' }}
          />
          {hasKey ? '연결됨' : '미연결'}
        </div>
      </div>
    </header>
  )
}
