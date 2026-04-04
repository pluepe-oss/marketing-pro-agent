import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useChat } from '@/hooks/useChat'
import { useAppStore } from '@/store/appStore'
import ChannelChips from './ChannelChips'

export default function InputArea() {
  const [text, setText] = useState('')
  const [showHint, setShowHint] = useState(false)
  const { sendMessage, isLoading } = useChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const pendingInput = useAppStore((s) => s.pendingInput)
  const setPendingInput = useAppStore((s) => s.setPendingInput)
  const clearCount = useAppStore((s) => s.clearCount)

  // 템플릿 클릭 시 텍스트 채우기 + 힌트 표시
  useEffect(() => {
    if (!pendingInput) return
    setText(pendingInput)
    setShowHint(true)
    setPendingInput('')
    textareaRef.current?.focus()
  }, [pendingInput, setPendingInput])

  // resetAll() 호출 시 입력창·힌트 초기화
  useEffect(() => {
    if (clearCount === 0) return
    setText('')
    setShowHint(false)
  }, [clearCount])

  const handleChange = (value: string) => {
    setText(value)
    // 사용자가 직접 수정하면 힌트 숨김
    if (showHint) setShowHint(false)
  }

  const handleSend = () => {
    if (!text.trim() || isLoading) return
    sendMessage(text)
    setText('')
    setShowHint(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="shrink-0"
      style={{
        borderTop: '1px solid var(--border)',
        background: '#FFFFFF',
        boxShadow: '0 -4px 20px rgba(108,99,255,0.04)',
      }}
    >
      <ChannelChips />

      {/* 템플릿 예시 힌트 배너 */}
      {showHint && (
        <div
          className="mx-4 mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
          style={{
            background: 'var(--accent)' + '18',
            border: '1px solid ' + 'var(--accent)' + '44',
            color: 'var(--text-muted)',
          }}
        >
          <span>💡</span>
          <span>아래는 예시입니다. 내 서비스 내용으로 바꿔서 입력하세요.</span>
        </div>
      )}

      <div className="flex gap-3 px-4 pb-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)' }}
          onBlur={(e) => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
          placeholder="마케팅 콘텐츠를 요청하세요..."
          rows={5}
          className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none leading-relaxed"
          style={{
            background: '#F8F7FF',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          disabled={isLoading}
        />
        <div className="flex flex-col justify-end">
          <button
            onClick={handleSend}
            disabled={isLoading || !text.trim()}
            className="px-5 rounded-xl text-sm font-semibold transition-all py-3 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
