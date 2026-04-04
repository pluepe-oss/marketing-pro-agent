import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import ApiKeyModal from '@/components/modal/ApiKeyModal'
import { useApiKey, loadApiKeySession } from '@/hooks/useApiKey'
import { useAppStore } from '@/store/appStore'

export default function App() {
  const { hasKey } = useApiKey()
  const storeSetApiKey = useAppStore((s) => s.setApiKey)

  // 앱 로드 시 sessionStorage에서 유효한 키 복원 (4시간 이내)
  useEffect(() => {
    if (hasKey) return
    const saved = loadApiKeySession()
    if (saved) {
      storeSetApiKey(saved)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Layout />
      {!hasKey && <ApiKeyModal />}
    </>
  )
}
