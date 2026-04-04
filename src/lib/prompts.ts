import type { TemplateId, ChannelId, Language } from '@/types'

const templateInstructions: Record<TemplateId, string> = {
  education:
    '교육 기관(학원·학교) 홍보 전문가입니다. 특강, 입학 설명회, 수강생 모집 등 교육 관련 마케팅 콘텐츠를 작성하세요. 학부모와 학생의 니즈를 동시에 고려하고 신뢰성을 강조하세요.',
  product:
    '신상품 런칭 마케팅 전문가입니다. 제품의 핵심 가치와 차별점을 부각하고, 구매 욕구를 자극하는 멀티채널 카피를 작성하세요.',
  event:
    '이벤트·프로모션 카피라이터입니다. 기간 한정 혜택의 긴급성과 희소성을 강조하여 즉각적인 행동을 유도하는 카피를 작성하세요.',
  brand:
    '브랜드 스토리텔러입니다. 브랜드의 철학, 가치, 신뢰를 감성적으로 전달하는 콘텐츠를 작성하세요. 직접 판매보다 브랜드 호감도 구축에 집중하세요.',
  viral:
    'SNS 바이럴 콘텐츠 전문가입니다. 공유·댓글·저장을 유도하는 참여형 콘텐츠를 작성하세요. 트렌디한 표현과 후킹 요소를 적극 활용하세요.',
}

const channelInstructions: Record<ChannelId, string> = {
  instagram: '인스타그램 형식: 비주얼 중심 캡션, 이모지 적극 활용, 해시태그 15~20개, 줄바꿈으로 가독성 확보.',
  kakao: '카카오채널 형식: 친근하고 간결한 톤, 이모티콘 활용, 링크 CTA 포함, 200자 내외.',
  blog: '블로그 형식: SEO 최적화 제목, ## 소제목 구조, 1000자 이상, 자연스러운 키워드 포함.',
  sms: 'SMS 형식: 90자 이내 핵심 메시지, 링크 포함, 발신자명 명시, 수신 거부 안내 포함.',
  youtube: '유튜브 형식: 후킹 인트로(첫 3초), 영상 설명문, 챕터 타임스탬프, 댓글 유도 문구.',
  email: '이메일 형식: 클릭율 높은 제목줄, 프리헤더, 본문(문제-해결-CTA 구조), 구독 취소 링크.',
}

/**
 * 언어별 출력 언어 지시 — 프롬프트 최상단에 배치하여 AI가 최우선으로 인식하게 함.
 * 지시문 자체를 대상 언어로 작성해 언어 혼용 방지.
 */
const languageDirective: Record<Language, string> = {
  ko: '한국어로 마케팅 콘텐츠를 작성해줘.',
  en: 'Please write all marketing content in English.',
  ja: 'マーケティングコンテンツを日本語で作成してください。',
  zh: '请用中文撰写所有营销内容。',
}

export function buildSystemPrompt(
  template: TemplateId | null,
  channels: ChannelId[],
  language: Language,
): string {
  // template이 null이면 범용 마케팅 지시 사용
  const templateInstruction = template
    ? templateInstructions[template]
    : '범용 마케팅 전문가입니다. 요청된 서비스나 상품에 맞는 효과적인 마케팅 콘텐츠를 작성하세요.'

  const channelGuides = channels.length > 0
    ? channels.map((ch) => `• ${ch.toUpperCase()}: ${channelInstructions[ch]}`).join('\n')
    : '채널 미선택 — 일반 마케팅 카피를 작성하세요.'

  const channelIds = channels.map((ch) => ch.toUpperCase()).join(', ')

  // 언어 지시를 프롬프트 맨 앞과 맨 뒤에 모두 배치 → AI가 확실히 인식
  return `${languageDirective[language]}

당신은 전문 마케팅 카피라이터 AI입니다.

【템플릿】 ${templateInstruction}

【출력 채널별 지침】
${channelGuides}

【출력 형식 — 반드시 준수】
채널이 여러 개인 경우 아래 마커를 사용해 각 채널을 반드시 분리하여 출력하세요.
마커 형식: ===채널ID=== (대문자, 예: ===INSTAGRAM===)
사용 가능한 채널 ID: ${channelIds}

예시:
===INSTAGRAM===
[인스타그램 콘텐츠]

===KAKAO===
[카카오채널 콘텐츠]

마커 외 추가 설명이나 서문은 출력하지 마세요. 콘텐츠만 출력하세요.
${languageDirective[language]}`
}
