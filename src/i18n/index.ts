import { ko } from './ko'
import { en } from './en'
import { ja } from './ja'
import { zh } from './zh'
import type { Language } from '@/types'

export const translations = { ko, en, ja, zh } as const

export type TranslationKey = typeof ko

export function t(lang: Language): TranslationKey {
  return translations[lang] ?? translations.ko
}
