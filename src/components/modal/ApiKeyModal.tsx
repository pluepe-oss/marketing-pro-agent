import { useState } from 'react'
import { useApiKey } from '@/hooks/useApiKey'

export default function ApiKeyModal() {
  const { setApiKey } = useApiKey()
  const [value, setValue] = useState('')

  const handleSave = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    setApiKey(trimmed)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(26,21,53,0.5)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 space-y-5"
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 60px rgba(108,99,255,0.15)',
        }}
      >
        {/* 아이콘 */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'var(--accent)' + '22' }}
        >
          🔑
        </div>

        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            API 키 설정
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Anthropic API 키를 입력하면 바로 시작할 수 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            API Key
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="sk-ant-..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
          }}
        >
          저장하고 시작하기
        </button>
      </div>
    </div>
  )
}
