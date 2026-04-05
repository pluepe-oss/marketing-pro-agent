import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ApiKeyModal from '@/components/modal/ApiKeyModal'
import { useApiKey, loadApiKeySession, saveApiKeySession } from '@/hooks/useApiKey'
import { useAppStore } from '@/store/appStore'

export default function App() {
  const { hasKey } = useApiKey()
  const storeSetApiKey = useAppStore((s) => s.setApiKey)

  // 앱 로드 시 키 복원 순서: sessionStorage → 환경변수
  useEffect(() => {
    if (hasKey) return
    const saved = loadApiKeySession()
    if (saved) {
      storeSetApiKey(saved)
      return
    }
    const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (envKey) {
      storeSetApiKey(envKey)
      saveApiKeySession(envKey)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Layout />
      {!hasKey && <ApiKeyModal />}
    </>
  )
}
