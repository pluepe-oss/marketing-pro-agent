import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, TemplateId, ChannelId, Language } from '@/types'

interface AppStore {
  messages: Message[]
  isLoading: boolean
  apiKey: string
  language: Language
  activeTemplate: TemplateId | null
  activeChannels: ChannelId[]
  sidebarOpen: boolean
  pendingInput: string
  clearCount: number

  addMessage: (msg: Message) => void
  setLoading: (v: boolean) => void
  setApiKey: (key: string) => void
  setLanguage: (lang: Language) => void
  setActiveTemplate: (t: TemplateId | null) => void
  toggleChannel: (ch: ChannelId) => void
  toggleSidebar: () => void
  clearMessages: () => void
  setPendingInput: (text: string) => void
  resetAll: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      apiKey: '',
      language: 'ko',
      activeTemplate: null,
      activeChannels: ['instagram', 'kakao', 'blog', 'sms', 'youtube', 'email'],
      sidebarOpen: true,
      pendingInput: '',
      clearCount: 0,

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),
      setLoading: (v) => set({ isLoading: v }),
      setApiKey: (key) => set({ apiKey: key }),
      setLanguage: (lang) => set({ language: lang }),
      setActiveTemplate: (t) => set({ activeTemplate: t }),
      toggleChannel: (ch) =>
        set((s) => {
          // 최소 1개 채널은 반드시 선택 유지
          if (s.activeChannels.includes(ch) && s.activeChannels.length <= 1) return s
          return {
            activeChannels: s.activeChannels.includes(ch)
              ? s.activeChannels.filter((c) => c !== ch)
              : [...s.activeChannels, ch],
          }
        }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      clearMessages: () => set({ messages: [] }),
      setPendingInput: (text) => set({ pendingInput: text }),
      resetAll: () =>
        set((s) => ({
          messages: [],
          activeTemplate: null,
          activeChannels: ['instagram', 'kakao', 'blog', 'sms', 'youtube', 'email'],
          language: 'ko',
          pendingInput: '',
          clearCount: s.clearCount + 1,
        })),
    }),
    {
      name: 'marketing-pro-v3', // 키 변경 → 이전 캐시 완전 초기화
      partialize: (s) => ({
        // apiKey: 절대 제외 — F-05 보안
        // activeTemplate: 제외 — 항상 null(미선택)로 시작
        language: s.language,
        activeChannels: s.activeChannels,
      }),
    },
  ),
)
