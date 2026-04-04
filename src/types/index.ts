export type Role = 'user' | 'assistant'

export type TemplateId =
  | 'education'
  | 'product'
  | 'event'
  | 'brand'
  | 'viral'

export type ChannelId =
  | 'instagram'
  | 'kakao'
  | 'blog'
  | 'sms'
  | 'youtube'
  | 'email'

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: number
  templateId?: TemplateId
}

export type Language = 'ko' | 'en' | 'ja' | 'zh'

export interface AppState {
  messages: Message[]
  isLoading: boolean
  apiKey: string
  language: Language
  activeTemplate: TemplateId | null
  activeChannels: ChannelId[]
  sidebarOpen: boolean
}
