# Marketing Pro AI Agent — 제품 요구사항 정의서 (PRD)

**앱 명칭**: MultiChannel AI Marketer
**버전**: v1.2
**작성일**: 2026-04-04
**이전 버전**: `Marketing-Pro-AI-Agent-PRD-v1.0.docx`

---

## 변경 이력

| 버전 | 날짜 | 주요 변경 내용 |
|------|------|---------------|
| v1.0 | 2026-03-01 | 최초 작성. 핵심 기능 F-01~F-05 정의, 다크 테마, 기본 아키텍처 |
| v1.1 | 2026-04-04 | 라이트 테마 전환, 채널 카드 렌더링, 체크박스 방식 채널 선택, API 키 세션 관리 |
| v1.2 | 2026-04-04 | 다국어 동작 방식 재설계(UI 한국어 고정), 초기화 완전 리셋(6항목), 복사 마크다운 제거, 앱 이름 변경 |

---

## 1. 제품 개요

### 1.1 앱 정보

| 항목 | 내용 |
|------|------|
| 헤더 타이틀 | **MultiChannel AI Marketer** |
| 부제목 | AI가 SNS 채널별 마케팅 콘텐츠를 자동 생성합니다 |
| 이전 이름 | Marketing Pro Agent (v1.0 → v1.1에서 변경) |
| 접속 URL | 로컬: `http://localhost:5173` / 배포: Netlify/Vercel |

### 1.2 제품 비전

교육기관·학원·이러닝 사업자를 위한 **AI 기반 멀티채널 마케팅 콘텐츠 자동 생성** 웹앱.
하나의 입력으로 인스타그램·카카오·블로그·SMS 등 각 채널에 최적화된 카피를 즉시 생성한다.

### 1.3 핵심 가치 제안

- 하나의 입력 → 여러 채널 최적화 콘텐츠 **동시 생성**
- 마케팅 비용·시간 80% 절감
- 사용자 자신의 API 키 직접 입력 방식 → 운영자 API 비용 **0원**

### 1.4 목표 사용자

| 유형 | 상세 |
|------|------|
| 교육기관 마케터 | 학원·교육 스타트업 마케팅 담당자 |
| 1인 교육 사업자 | 과외·강사 개인 브랜딩 |
| 이러닝 플랫폼 | 다국어 글로벌 마케팅 |
| 한국어 교육 기관 | TOPIK·EPS TOPIK 사업자 |

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite |
| 스타일링 | Tailwind CSS |
| 상태 관리 | Zustand (+ persist 미들웨어) |
| AI API | Anthropic Claude API (`claude-sonnet-4-6`) |
| 패키지 매니저 | npm |
| 배포 | Netlify / Vercel |

### Claude API 호출 규칙

```ts
fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    stream: true,
    system: systemPrompt,
    messages: [...],
  }),
})
```

---

## 3. 프로젝트 구조

```
src/
  components/
    layout/     Header.tsx · Sidebar.tsx · Layout.tsx
    chat/       ChatMessages.tsx · MessageBubble.tsx · TypingIndicator.tsx
                ChannelCards.tsx
    input/      InputArea.tsx · ChannelChips.tsx
    modal/      ApiKeyModal.tsx
  hooks/        useChat.ts · useApiKey.ts · useLanguage.ts
  lib/          anthropic.ts · prompts.ts
  store/        appStore.ts
  i18n/         ko.ts · en.ts · ja.ts · zh.ts · index.ts
  types/        index.ts
```

---

## 4. 핵심 기능 명세

### F-01: 멀티채널 콘텐츠 생성

- 지원 채널 6개: 인스타그램 · 카카오채널 · 블로그 · 문자SMS · 유튜브 · 이메일
- 채널 선택: **체크박스 방식** 멀티 선택 (v1.1에서 토글 칩 → 체크박스로 변경)
- 기본 활성 채널: **6개 전부** (v1.1에서 4개 → 6개로 변경)
- 최소 1개 채널 선택 강제 (마지막 1개는 해제 불가)
- 품질 기준: SMS 90자 이내, 인스타그램 해시태그 15~20개, 블로그 1200자 내외

#### 채널 체크박스 UI 규칙

| 상태 | 스타일 |
|------|--------|
| ON (선택됨) | 채널 고유 색상 배경 틴트(`color + '18'`) + 채널 색상 텍스트 + `1.5px solid` 색상 테두리 |
| OFF (미선택) | `var(--surface)` 배경 + `var(--text-faint)` 텍스트 + `1.5px solid var(--border)` + `opacity: 0.6` |
| 체크박스 아이콘 | ON: 채널 색상 배경 + 흰색 SVG 체크마크 (카카오만 `#1a1a1a`) / OFF: 빈 원형 박스 |

#### 채널별 고유 색상

| 채널 | 색상 | 비고 |
|------|------|------|
| 인스타그램 | `#E1306C` | |
| 카카오채널 | `#FFE812` | ON 상태 텍스트 `#1a1a1a` (가독성) |
| 블로그 | `#00D4AA` | |
| 문자SMS | `#FF9500` | |
| 유튜브 | `#FF0000` | |
| 이메일 | `#6C63FF` | |

### F-02: 콘텐츠 생성 언어 선택 (v1.2 재설계)

> **v1.2 중요 변경**: 언어 버튼은 UI 언어가 아니라 "AI가 생성하는 콘텐츠의 언어"를 선택한다.

#### 동작 방식

| 항목 | 규칙 |
|------|------|
| UI/버튼/메뉴/템플릿 | **항상 한국어 고정** — 언어 선택과 무관 |
| 언어 버튼 역할 | AI가 마케팅 콘텐츠를 작성할 언어 선택 |
| 지원 언어 | 한국어 · EN · 日本語 · 中文(简体) |
| 헤더 표시 | 버튼 좌측에 `콘텐츠 생성 언어` 레이블 표시 |
| 언어 전환 시 | 기존 대화 유지, 이후 생성 콘텐츠만 해당 언어로 변경 |

#### UI 항상 한국어 고정 대상 파일

- `InputArea.tsx`: placeholder, 전송 버튼 → 한국어 하드코딩
- `ApiKeyModal.tsx`: 타이틀, 설명, 레이블, 힌트, 저장 버튼 → 한국어 하드코딩
- `TypingIndicator.tsx`: `'AI가 작성 중...'` 하드코딩
- `Sidebar.tsx`: 템플릿 예시 텍스트 → `ko.templatePrompts` 직접 import (useLanguage 사용 금지)

#### languageDirective (prompts.ts)

AI에게 출력 언어를 지정하는 1줄 지시문. 프롬프트 맨 앞·맨 뒤에 모두 삽입.

```ts
ko: '한국어로 마케팅 콘텐츠를 작성해줘.'
en: 'Please write all marketing content in English.'
ja: 'マーケティングコンテンツを日本語で作成してください。'
zh: '请用中文撰写所有营销内容。'
```

### F-03: 마케팅 템플릿 5종 (사이드바)

| ID | 아이콘 | 템플릿명 | 설명 |
|----|--------|---------|------|
| education | 🎓 | 교육 기관 홍보 | 학원·학교 특강·입학 홍보 콘텐츠 |
| product | 🛍️ | 상품 런칭 | 신상품 출시 멀티채널 마케팅 카피 |
| event | 🎉 | 이벤트·프로모션 | 기간 한정 프로모션 긴급성 강조 카피 |
| brand | 💡 | 브랜드 스토리 | 브랜드 가치와 신뢰를 전달하는 콘텐츠 |
| viral | 📱 | SNS 바이럴 | 공유·댓글 유도형 바이럴 콘텐츠 |

#### 템플릿 클릭 동작

1. `activeTemplate` 값 변경
2. `pendingInput`에 해당 템플릿 예시 텍스트 저장
3. `InputArea`가 `pendingInput` 감지 → textarea 자동 채움 + 힌트 배너 표시
4. 힌트 배너: `💡 아래는 예시입니다. 내 서비스 내용으로 바꿔서 입력하세요.`
5. 사용자가 텍스트 수정하는 순간 힌트 배너 자동 숨김

**초기 로드 규칙**: `activeTemplate = null` (어떤 템플릿도 선택되지 않은 상태로 시작)
- `persist partialize`에서 제외 — localStorage 저장 안 함
- 새로고침 시 항상 null로 초기화

### F-04: 대화형 멀티턴 인터페이스

- 생성 결과 수정 요청, 톤 변경, 길이 조절 등 이어지는 대화 지원
- 스트리밍 응답 (SSE) — 실시간 텍스트 출력
- Enter: 전송 / Shift+Enter: 줄바꿈
- textarea `rows={5}` 고정

### F-05: API 키 관리 (v1.1 업데이트)

| 항목 | 규칙 |
|------|------|
| 저장 방식 | `sessionStorage` + 만료 시각(`expiresAt`) |
| 세션 키 | `mpa_api_session` |
| 유효 시간 | **4시간** |
| 포맷 | `{ key: string, expiresAt: number }` |
| 앱 로드 시 | sessionStorage 확인 → 유효하면 자동 복원 → 모달 표시 안 함 |
| 만료/없음 | sessionStorage 항목 삭제 후 모달 표시 |
| 브라우저 종료 | sessionStorage 삭제됨 (탭 닫기는 유지) |
| **localStorage 저장** | **절대 금지** |
| 접두사 검증 | `sk-ant-` 접두사 형식 확인 후 저장 |
| 상태 표시 | 헤더 `● 연결됨` (초록 `#00B894`) / `● 미연결` (회색) |

---

## 5. 채널 카드 렌더링 (F-06, v1.1 신규)

### 5.1 동작 원리

AI 응답에 `===CHANNEL_ID===` 마커가 있으면 채널별 카드로 분리 렌더링.
마커가 없는 일반 AI 응답은 기존 말풍선으로 fallback.

**지원 마커**: `===INSTAGRAM===`, `===KAKAO===`, `===BLOG===`, `===SMS===`, `===YOUTUBE===`, `===EMAIL===`

### 5.2 카드 표시 순서 (항상 고정)

AI 응답 순서와 무관하게 파싱 후 반드시 아래 순서로 정렬:

```
인스타그램 → 카카오채널 → 블로그 → 문자SMS → 유튜브 → 이메일
```

구현: `CHANNEL_ORDER` 배열로 `.sort()` 처리 (`ChannelCards.tsx`)

### 5.3 카드 구조

```
┌─────────────────────────────────────┐  ← border-radius: 12px
│ [아이콘] 채널명          [📋 복사]  │  ← 채널 고유 컬러 헤더 (border-radius: 10px 10px 0 0)
├─────────────────────────────────────┤
│                                     │
│  콘텐츠 본문 (padding: 12px 16px 32px)│  ← 하단 32px 필수 (잘림 방지)
│                                     │
└─────────────────────────────────────┘  ← border-left: 3px solid 채널색상
```

### 5.4 채널별 특수 처리

| 채널 | 특수 처리 |
|------|---------|
| 인스타그램 | 해시태그(`#word`)를 파란색(`#1877F2`) 링크 스타일로 렌더링 |
| 문자SMS | 본문 하단에 글자수 카운터 표시 (90자 초과 시 빨간색 경고) |

### 5.5 복사 버튼 (v1.2 개선)

- 각 카드 우측 상단 `📋 복사` 버튼
- 클릭 시 2초간 `✓ 복사됨` 표시
- **복사 텍스트는 `cleanForCopy()` 통과 후 클립보드에 저장**

#### cleanForCopy 변환 규칙

| 입력 | 출력 |
|------|------|
| `**bold**` | `bold` |
| `*italic*` | `italic` |
| `## heading` | `heading` |
| `` `code` `` | `code` |
| ` ```코드블록``` ` | 순수 텍스트 |

SNS·문자 붙여넣기 시 마크다운 기호 없이 깔끔하게 붙여넣어짐.

### 5.6 레이아웃 규칙 (중요)

- 카드에 `overflow: hidden` **절대 사용 금지** — 내용 잘림 발생
- 카드 wrapper: `height: auto; min-height: fit-content; overflow: visible`
- 채널 응답 말풍선 행: `items-start` 필수 (`items-stretch` 기본값이면 카드 하단 잘림)

---

## 6. 초기화(resetAll) 완전 리셋 (v1.2 신규)

`🗑 초기화` 버튼(ChatMessages.tsx) 및 `대화 초기화` 버튼(Sidebar.tsx) 클릭 시 아래 6가지 동시 리셋.
확인 팝업 없이 즉시 실행.

| 번호 | 항목 | 리셋 값 |
|------|------|--------|
| 1 | 대화 내용 | `[]` (웰컴 화면 복귀) |
| 2 | 템플릿 선택 | `null` (미선택 상태) |
| 3 | 채널 체크박스 | 6개 전부 선택 |
| 4 | 콘텐츠 생성 언어 | `'ko'` (한국어) |
| 5 | 입력창 텍스트 | 빈 문자열 |
| 6 | 힌트 배너 | 숨김 |

#### clearCount 패턴

`appStore`에 `clearCount: number` 유지. `resetAll()` 실행마다 `clearCount++`.
`InputArea.tsx`에서 `useEffect([clearCount])` 감시 → 로컬 state(`text`, `showHint`) 초기화.

---

## 7. 디자인 시스템

### 7.1 테마

**라이트 테마** (v1.1에서 다크 → 라이트로 전환)

### 7.2 CSS 변수 (index.css)

```css
--bg: #F8F9FA;         /* 전체 배경 — 밝은 회색 */
--surface: #FFFFFF;    /* 카드·헤더·모달 — 흰색 */
--surface2: #F1F3F5;   /* 사이드바·입력창·칩 배경 — 연한 회색 */
--border: #DEE2E6;     /* 테두리 — 밝은 회색 */
--accent: #6c63ff;     /* 브랜드 메인 — 인디고 */
--accent2: #FF6B9D;    /* 강조·그라데이션 — 핑크 */
--accent3: #00B894;    /* 연결됨 배지 — 초록 */
--text: #212529;       /* 본문 텍스트 — 진한 검정 */
--text2: #6C757D;      /* 보조 텍스트 — 중간 회색 */
--text-muted: #6C757D;
--text-faint: #ADB5BD;
--user-bg: #E8E4FF;    /* 사용자 말풍선 — 연한 인디고 */
```

### 7.3 폰트

- 기본: `Noto Sans KR` (Google Fonts CDN)
- 대체: `Pretendard`, `sans-serif`

### 7.4 컴포넌트 규칙

| 요소 | 규칙 |
|------|------|
| 카드 모서리 | `rounded-xl` (12px) |
| 모달 모서리 | `rounded-2xl` |
| 채팅 버블 | `rounded-2xl` |
| 색상 | CSS 변수(`var(--*)`) 사용, Tailwind 하드코딩 지양 |
| 스크롤바 | 커스텀 스타일 (6px, `var(--border)`) |

---

## 8. 상태 관리 (Zustand)

### 8.1 스토어 구조

```ts
interface AppStore {
  messages: Message[]
  isLoading: boolean
  apiKey: string           // persist 제외 (보안)
  language: Language       // persist 포함
  activeTemplate: TemplateId | null  // persist 제외 (항상 null 시작)
  activeChannels: ChannelId[]        // persist 포함
  sidebarOpen: boolean
  pendingInput: string
  clearCount: number       // InputArea 로컬 상태 리셋 트리거

  // 액션
  addMessage / setLoading / setApiKey / setLanguage
  setActiveTemplate / toggleChannel / toggleSidebar
  clearMessages / setPendingInput
  resetAll()               // v1.2 신규 — 6가지 완전 리셋
}
```

### 8.2 영속화 규칙

```ts
// persist key: 'marketing-pro-v3'
partialize: (s) => ({
  language: s.language,
  activeChannels: s.activeChannels,
  // apiKey: 절대 제외 — F-05 보안
  // activeTemplate: 제외 — 항상 null로 시작
})
```

**persist key 관리**: 기본값·영속화 항목 변경 시 key 이름 올려서 이전 캐시 무효화 (migrate 방식 사용 안 함)

### 8.3 Zustand 셀렉터 규칙

객체 반환 셀렉터 사용 금지 → 무한 루프 발생:

```ts
// 금지
const { a, b } = useAppStore((s) => ({ a: s.a, b: s.b }))

// 올바른 방법
const a = useAppStore((s) => s.a)
const b = useAppStore((s) => s.b)
```

---

## 9. 레이아웃 스크롤 구조 (중요)

> **핵심 원칙**: Tailwind 클래스는 CSS 생성 순서에 따라 의도한 값이 무시될 수 있다.
> `height` / `overflow` / `flex` 관련 핵심 속성은 **반드시 inline style**로 작성한다.

### 9.1 index.css 필수 설정

```css
html { height: 100%; }
body { height: 100%; overflow: hidden; }   /* body 스크롤 차단 필수 */
#root { height: 100%; overflow: hidden; }
```

`body`에 `overflow: hidden` 없으면 채팅 카드가 많아질 때 body 레벨 스크롤 발생 → 내부 scroll container 미동작.

### 9.2 Layout.tsx inline style 체인

```
최외곽 div:  display:flex; flex-direction:column; height:100vh; overflow:hidden
콘텐츠 div:  display:flex; flex:1; min-height:0; overflow:hidden
main:        display:flex; flex-direction:column; flex:1; min-width:0; min-height:0; overflow:hidden
```

### 9.3 ChatMessages.tsx inline style 체인

```
채팅 컨테이너:  display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden
스크롤 div:     flex:1; overflow-y:auto; min-height:0   ← 이 div만 스크롤
내용 래퍼:      display:flex; flex-direction:column; gap:16px; padding:12px 16px 20px
```

---

## 10. 시스템 프롬프트 설계 (prompts.ts)

```
[언어 지시문]        ← languageDirective (맨 앞)

당신은 전문 마케팅 카피라이터 AI입니다.

【템플릿】           ← templateInstructions[template] 또는 범용 지시
【출력 채널별 지침】  ← channelInstructions[channelId] 목록
【출력 형식】        ← ===CHANNEL_ID=== 마커 형식 명시

[언어 지시문]        ← languageDirective (맨 뒤 반복)
```

- `template: TemplateId | null` — null이면 범용 마케팅 지시 사용
- `languageDirective`는 AI가 인식하도록 프롬프트 맨 앞·뒤 **양쪽에 삽입**

---

## 11. 보안 규칙

| 항목 | 규칙 |
|------|------|
| API 키 저장 | Zustand 메모리 + sessionStorage 전용 (localStorage 절대 금지) |
| API 키 세션 | 4시간 만료, 브라우저 종료 시 삭제 |
| XSS | 사용자 입력 HTML 이스케이프 |
| HTTPS | 배포 시 HTTPS 전용 |
| API 오류 | 상세 스택 트레이스 클라이언트 노출 금지 |
| persist 제외 | `apiKey`, `activeTemplate` — localStorage 저장 금지 |

---

## 12. 성능 목표

| 지표 | 목표 |
|------|------|
| FCP | 2초 이내 |
| API TTFB | 3초 이내 |
| Lighthouse | 85점 이상 |
| 번들 사이즈 | 200KB 이내 (gzip) |

---

## 13. 개발 로드맵

| Phase | 목표 | 상태 |
|-------|------|------|
| Phase 1 MVP | 핵심 F-01~F-05 구현 + 배포 | ✅ 완료 |
| Phase 2 | 스트리밍·복사·채널 카드·세션 관리 | ✅ 완료 (v1.1~v1.2) |
| Phase 3 | 전체 결과 `.txt` 다운로드, 세션 내 이력 사이드바 저장 | 예정 |
| Phase 4 | 인스타그램 카드·SMS 폰 미리보기, 이미지 생성 | 예정 |
| Phase 5 | 회원 인증, SNS 직접 게시 | 예정 |

### 다음 구현 우선순위 (Phase 3)

1. `F-07` 전체 결과 `.txt` 다운로드
2. `F-08` 세션 내 생성 이력 사이드바 저장 및 불러오기
3. `F-09` 인스타그램 카드·SMS 폰 미리보기 모드

---

## 14. UX 수정 이력

### v1.1 수정 항목 (2026-04-04)

| # | 항목 | 수정 전 | 수정 후 |
|---|------|--------|--------|
| 1 | 테마 | 다크 테마 | 라이트 테마 (CSS 변수 전체 교체) |
| 2 | 채널 선택 UI | 토글 칩 (rounded-full) | 체크박스 + 라벨 방식 (rounded-lg) |
| 3 | 기본 채널 | 4개 (인스타·카카오·블로그·SMS) | 6개 전부 |
| 4 | AI 응답 렌더링 | 단순 말풍선 | 채널별 컬러 카드 분리 렌더링 |
| 5 | 초기화 버튼 | 없음 | 스크롤 영역 밖 상단 고정 |
| 6 | API 키 저장 | Zustand 메모리만 (새로고침 시 재입력) | sessionStorage 4시간 세션 유지 |
| 7 | 앱 이름 | Marketing Pro Agent | MultiChannel AI Marketer |
| 8 | 스크롤 버그 | body 레벨 스크롤 발생 | inline style 체인으로 근본 수정 |
| 9 | 채널 카드 순서 | AI 응답 순서 따라감 | CHANNEL_ORDER 배열로 고정 정렬 |
| 10 | 언어 미적용 | systemPrompt 한국어 고정 | languageDirective 앞·뒤 이중 삽입 |
| 11 | 템플릿 자동 선택 | 앱 로드 시 education 선택됨 | null(미선택) 상태로 시작 |
| 12 | 카카오 카드 잘림 | flex stretch로 카드 높이 제한 | items-start + padding-bottom 32px |
| 13 | localStorage 캐시 | 이전 설정값 복원 오류 | persist key 변경으로 무효화 |

### v1.2 수정 항목 (2026-04-04)

| # | 항목 | 수정 전 | 수정 후 |
|---|------|--------|--------|
| 1 | 언어 버튼 동작 | UI 전체 언어 전환 | 콘텐츠 생성 언어만 제어 |
| 2 | UI 문자열 | useLanguage()로 다국어 처리 | 한국어 하드코딩 고정 |
| 3 | 헤더 언어 버튼 | 버튼만 표시 | `콘텐츠 생성 언어` 레이블 추가 |
| 4 | 초기화 버튼 | 대화 내용만 삭제 | 6가지 완전 리셋 (resetAll) |
| 5 | 복사 텍스트 | 마크다운 기호 포함 | cleanForCopy() 적용 순수 텍스트 |
| 6 | languageDirective | 상세한 금지 지시문 (다국어) | 단순 1줄 지시문 |
| 7 | Claude 모델 | claude-sonnet-4-5 | claude-sonnet-4-6 |
| 8 | max_tokens | 2048 | 4000 |
