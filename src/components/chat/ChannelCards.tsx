import { useState } from 'react'
import type { ChannelId } from '@/types'

interface ChannelSection {
  channelId: ChannelId
  content: string
}

interface ChannelConfig {
  label: string
  icon: string
  headerBg: string
  headerText: string
  cardBg: string
  borderColor: string
}

const CHANNEL_CONFIG: Record<ChannelId, ChannelConfig> = {
  instagram: {
    label: '인스타그램',
    icon: '📷',
    headerBg: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    headerText: '#fff',
    cardBg: '#FFF5F8',
    borderColor: '#E1306C',
  },
  kakao: {
    label: '카카오채널',
    icon: '💬',
    headerBg: '#FFE812',
    headerText: '#1a1a1a',
    cardBg: '#FFFEF0',
    borderColor: '#F5C800',
  },
  blog: {
    label: '블로그',
    icon: '✍️',
    headerBg: '#00B894',
    headerText: '#fff',
    cardBg: '#F0FFFC',
    borderColor: '#00B894',
  },
  sms: {
    label: '문자 SMS',
    icon: '📱',
    headerBg: '#FF9500',
    headerText: '#fff',
    cardBg: '#FFF8F0',
    borderColor: '#FF9500',
  },
  youtube: {
    label: '유튜브',
    icon: '▶️',
    headerBg: '#FF0000',
    headerText: '#fff',
    cardBg: '#FFF5F5',
    borderColor: '#FF0000',
  },
  email: {
    label: '이메일',
    icon: '📧',
    headerBg: '#6C63FF',
    headerText: '#fff',
    cardBg: '#F5F3FF',
    borderColor: '#6C63FF',
  },
}

const MARKER_TO_CHANNEL: Record<string, ChannelId> = {
  INSTAGRAM: 'instagram',
  KAKAO: 'kakao',
  BLOG: 'blog',
  SMS: 'sms',
  YOUTUBE: 'youtube',
  EMAIL: 'email',
}

// 항상 이 순서로 카드를 렌더링 (AI 응답 순서 무시)
const CHANNEL_ORDER: ChannelId[] = ['instagram', 'kakao', 'blog', 'sms', 'youtube', 'email']

export function hasChannelMarkers(content: string): boolean {
  return /===([A-Z]+)===/.test(content)
}

function parseChannelSections(content: string): ChannelSection[] {
  const regex = /===([A-Z]+)===/g
  const matches = [...content.matchAll(regex)]
  if (matches.length === 0) return []

  const sections: ChannelSection[] = []
  for (let i = 0; i < matches.length; i++) {
    const channelId = MARKER_TO_CHANNEL[matches[i][1]]
    if (!channelId) continue
    const start = matches[i].index! + matches[i][0].length
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length
    sections.push({ channelId, content: content.slice(start, end).trim() })
  }

  // AI 응답 순서와 관계없이 항상 고정 순서로 정렬
  sections.sort(
    (a, b) => CHANNEL_ORDER.indexOf(a.channelId) - CHANNEL_ORDER.indexOf(b.channelId),
  )

  return sections
}

function cleanForCopy(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')        // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')        // ## heading → heading
    .replace(/`([^`]+)`/g, '$1')        // `code` → code
    .replace(/```[\s\S]*?```/g, (m) =>  // ```block``` → plain text
      m.replace(/```\w*\n?/g, '').replace(/```/g, ''),
    )
    .trim()
}

function InstagramContent({ text }: { text: string }) {
  const parts = text.split(/(#\S+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <span key={i} style={{ color: '#1877F2', fontWeight: 500 }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function CopyButton({ text, headerText }: { text: string; headerText: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanForCopy(text))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2.5 py-1 rounded-md transition-all font-medium"
      style={{
        background: copied ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
        color: copied ? '#16a34a' : headerText,
        border: '1px solid rgba(255,255,255,0.35)',
      }}
    >
      {copied ? '✓ 복사됨' : '📋 복사'}
    </button>
  )
}

function ChannelCard({ section }: { section: ChannelSection }) {
  const cfg = CHANNEL_CONFIG[section.channelId]
  const isSms = section.channelId === 'sms'
  const charCount = section.content.length

  return (
    <div style={{
      height: 'auto',
      minHeight: 'fit-content',
      overflow: 'visible',
      background: cfg.cardBg,
      border: `1px solid ${cfg.borderColor}30`,
      borderLeft: `3px solid ${cfg.borderColor}`,
      borderRadius: '14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    }}>
      {/* 채널 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: cfg.headerBg,
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{cfg.icon}</span>
          <span className="text-sm font-bold" style={{ color: cfg.headerText }}>
            {cfg.label}
          </span>
        </div>
        <CopyButton text={section.content} headerText={cfg.headerText} />
      </div>

      {/* 콘텐츠 본문 — padding-bottom 32px로 하단 잘림 방지 */}
      <div style={{ padding: '12px 16px 32px' }}>
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text)', marginBottom: '8px' }}
        >
          {section.channelId === 'instagram' ? (
            <InstagramContent text={section.content} />
          ) : (
            section.content
          )}
        </p>

        {/* SMS 글자수 카운터 */}
        {isSms && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                background: charCount > 90 ? '#fee2e2' : '#dcfce7',
                color: charCount > 90 ? '#dc2626' : '#16a34a',
                border: `1px solid ${charCount > 90 ? '#fca5a5' : '#bbf7d0'}`,
              }}
            >
              {charCount}자 {charCount > 90 ? '⚠ 90자 초과' : '/ 90자 이내'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChannelCards({ content }: { content: string }) {
  const sections = parseChannelSections(content)

  if (sections.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
        {content}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {sections.map((section) => (
        <ChannelCard key={section.channelId} section={section} />
      ))}
    </div>
  )
}
