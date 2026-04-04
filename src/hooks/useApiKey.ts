import { useAppStore } from '@/store/appStore'

const SESSION_KEY = 'mpa_api_session'
const SESSION_DURATION = 4 * 60 * 60 * 1000 // 4시간 (ms)

interface StoredSession {
  key: string
  expiresAt: number
}

/** sessionStorage에서 유효한 API 키를 반환. 만료 시 null */
export function loadApiKeySession(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: StoredSession = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session.key
  } catch {
    return null
  }
}

function saveApiKeySession(key: string) {
  const session: StoredSession = {
    key,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function useApiKey() {
  const apiKey = useAppStore((s) => s.apiKey)
  const storeSetApiKey = useAppStore((s) => s.setApiKey)

  const setApiKey = (key: string) => {
    storeSetApiKey(key)
    saveApiKeySession(key)
  }

  return {
    apiKey,
    hasKey: apiKey.trim().length > 0,
    setApiKey,
  }
}
