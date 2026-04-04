import { useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { streamChat } from '@/lib/anthropic'
import type { Message } from '@/types'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useChat() {
  const messages = useAppStore((s) => s.messages)
  const isLoading = useAppStore((s) => s.isLoading)
  const activeTemplate = useAppStore((s) => s.activeTemplate)
  const activeChannels = useAppStore((s) => s.activeChannels)
  const apiKey = useAppStore((s) => s.apiKey)
  const language = useAppStore((s) => s.language)
  const addMessage = useAppStore((s) => s.addMessage)
  const setLoading = useAppStore((s) => s.setLoading)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
        templateId: activeTemplate ?? undefined,
      }
      addMessage(userMsg)

      const assistantId = uid()
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        templateId: activeTemplate ?? undefined,
      }
      addMessage(assistantMsg)
      setLoading(true)

      const allMessages = [...messages, userMsg]

      await streamChat(
        allMessages,
        apiKey,
        activeTemplate,
        activeChannels,
        language,
        (chunk) => {
          useAppStore.setState((s) => ({
            messages: s.messages.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m,
            ),
          }))
        },
        () => setLoading(false),
        (err) => {
          useAppStore.setState((s) => ({
            messages: s.messages.map((m) =>
              m.id === assistantId
                ? { ...m, content: `오류: ${err.message}` }
                : m,
            ),
          }))
          setLoading(false)
        },
      )
    },
    [messages, isLoading, activeTemplate, activeChannels, apiKey, language, addMessage, setLoading],
  )

  return { messages, isLoading, sendMessage }
}
