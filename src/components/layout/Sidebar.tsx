import { useAppStore } from '@/store/appStore'
import { ko } from '@/i18n/ko'
import type { TemplateId } from '@/types'

interface Template {
  id: TemplateId
  icon: string
  label: string
  desc: string
  color: string
}

const TEMPLATES: Template[] = [
  {
    id: 'education',
    icon: '🎓',
    label: '교육 기관 홍보',
    desc: '학원·학교 특강·입학 홍보 콘텐츠',
    color: '#6c63ff',
  },
  {
    id: 'product',
    icon: '🛍️',
    label: '상품 런칭',
    desc: '신상품 출시 멀티채널 마케팅 카피',
    color: '#ff6b9d',
  },
  {
    id: 'event',
    icon: '🎉',
    label: '이벤트·프로모션',
    desc: '기간 한정 프로모션 긴급성 강조 카피',
    color: '#ffb347',
  },
  {
    id: 'brand',
    icon: '💡',
    label: '브랜드 스토리',
    desc: '브랜드 가치와 신뢰를 전달하는 콘텐츠',
    color: '#43e3b6',
  },
  {
    id: 'viral',
    icon: '📱',
    label: 'SNS 바이럴',
    desc: '공유·댓글 유도형 바이럴 콘텐츠',
    color: '#60a5fa',
  },
]

export default function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const activeTemplate = useAppStore((s) => s.activeTemplate)
  const setActiveTemplate = useAppStore((s) => s.setActiveTemplate)
  const setPendingInput = useAppStore((s) => s.setPendingInput)
  const resetAll = useAppStore((s) => s.resetAll)

  if (!sidebarOpen) return null

  return (
    <aside
      className="w-60 flex flex-col shrink-0"
      style={{ background: '#F0EEFF', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-4 pt-5 pb-3">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: 'var(--accent)', fontWeight: 700 }}
        >
          템플릿
        </p>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {TEMPLATES.map((tpl) => {
          const isActive = activeTemplate === tpl.id
          return (
            <button
              key={tpl.id}
              onClick={() => {
                setActiveTemplate(tpl.id)
                setPendingInput(ko.templatePrompts[tpl.id])
              }}
              className="w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #EEF0FF, #E8E4FF)',
                      border: '1px solid rgba(108,99,255,0.25)',
                      borderLeft: '3px solid #6C63FF',
                      boxShadow: '0 2px 12px rgba(108,99,255,0.12)',
                    }
                  : {
                      background: '#FFFFFF',
                      border: '1px solid #E8E6FF',
                    }
              }
            >
              <span className="text-xl mt-0.5 shrink-0">{tpl.icon}</span>
              <div className="min-w-0">
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: isActive ? tpl.color : 'var(--text)' }}
                >
                  {tpl.label}
                </p>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {tpl.desc}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={resetAll}
          className="w-full text-xs px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          대화 초기화
        </button>
      </div>
    </aside>
  )
}
