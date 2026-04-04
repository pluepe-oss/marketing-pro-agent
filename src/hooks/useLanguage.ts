import { useAppStore } from '@/store/appStore'
import { t } from '@/i18n'

export function useLanguage() {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  return {
    language,
    setLanguage,
    tr: t(language),
  }
}
