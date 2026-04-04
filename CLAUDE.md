# CLAUDE.md — Marketing Pro AI Agent

> 이 파일은 Claude Code가 이 프로젝트를 개발할 때 **항상 참고해야 하는 기준 문서**입니다.
> 모든 코드 작성·수정은 아래 규칙을 준수합니다.
> 기반 문서: `docs/Marketing-Pro-AI-Agent-PRD-v1.0.docx`

---

## 0. 반드시 지켜야 할 규칙 (절대 위반 금지)

### 규칙 1: 채널 카드는 항상 고정 순서로 렌더링
- 순서: `instagram → kakao → blog → sms → youtube → email`
- AI 응답에서 채널이 다른 순서로 출력되더라도 **파싱 후 반드시 정렬**
- 구현 위치: `ChannelCards.tsx`의 `CHANNEL_ORDER` 배열로 `.sort()` 처리
- 이 규칙을 어기면 사용자가 매번 다른 순서로 카드를 보게 됨

### 규칙 2: 언어 전환 시 systemPrompt도 반드시 변경
- `prompts.ts`의 `languageDirective`를 프롬프트 **맨 앞**과 **맨 뒤**에 모두 삽입
- `languageDirective`는 대상 언어로 작성 (e.g., EN 선택 시 영어로 된 지시문)
- 지시문이 한국어로만 있으면 AI가 한국어로 응답함 → 반드시 대상 언어 지시문 필요
- `anthropic.ts`의 `streamChat` 및 `prompts.ts`의 `buildSystemPrompt` 시그니처: `template: TemplateId | null`

### 규칙 3: 앱 초기 로드 시 템플릿 선택 없음 (null)
- `appStore.ts`: `activeTemplate` 초기값 = `null`
- `activeTemplate`은 `persist partialize`에서 **제외** — localStorage에 저장하지 않음
- 새로고침 시 항상 null(미선택) 상태로 시작
- `null` 처리가 필요한 파일: `prompts.ts`, `anthropic.ts`, `useChat.ts`, `Sidebar.tsx`
- `Sidebar.tsx`의 활성 체크: `isActive = activeTemplate === tpl.id` → null이면 모두 false ✓

### 규칙 4: localStorage 키 관리
- 현재 키: `'marketing-pro-v3'`
- 기본값 변경이나 persist 항목 변경 시 키 이름을 올려서 이전 캐시 무효화
- persist 저장 항목: `language`, `activeChannels` 만 저장 (apiKey·activeTemplate 절대 제외)

---

## 1. 프로젝트 개요

### 앱 제목
- **헤더 타이틀**: `MultiChannel AI Marketer`
- **부제목**: `AI가 SNS 채널별 마케팅 콘텐츠를 자동 생성합니다`
- (2026-04-04 "Marketing Pro Agent"에서 변경)

### 제품 비전
교육기관·학원·이러닝 사업자를 위한 **AI 기반 멀티채널 마케팅 콘텐츠 자동 생성** 웹앱.
하나의 입력 → 인스타그램·카카오·블로그·SMS 등 각 채널에 최적화된 카피를 즉시 생성.

### 핵심 가치 제안
- 하나의 입력 → 여러 채널 최적화 콘텐츠 **동시 생성**
- 마케팅 비용·시간 80% 절감
- 사용자 자신의 API 키 직접 입력 방식 → 운영자 API 비용 **0원**

### 목표 사용자
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
| 상태 관리 | Zustand |
| AI API | Anthropic Claude API (claude-sonnet-4-6) |
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
    input/      InputArea.tsx · ChannelChips.tsx
    modal/      ApiKeyModal.tsx
  hooks/        useChat.ts · useApiKey.ts · useLanguage.ts
  lib/          anthropic.ts · prompts.ts
  store/        appStore.ts
  i18n/         ko.ts · en.ts · ja.ts · zh.ts · index.ts
  types/        index.ts
```

---

## 4. 핵심 기능 (Must Have — F-01 ~ F-05)

### F-01: 멀티채널 콘텐츠 생성
- 지원 채널 6개: 인스타그램 · 카카오채널 · 블로그 · 문자SMS · 유튜브 · 이메일
- 채널 칩은 **멀티 토글** (복수 선택 가능)
- 기본 활성 채널: 인스타그램·카카오·블로그·SMS
- 품질 기준: SMS 90자 이내, 인스타그램 해시태그 15~20개, 블로그 1200자 내외

### F-02: 4개 국어 UI
- 지원: 한국어 · English · 日本語 · 中文(简体)
- 언어 전환 시 기존 대화 유지, 이후 생성 콘텐츠만 해당 언어로 변경
- 헤더 언어 버튼 4개 (인라인 토글 버튼, select 드롭다운 사용 금지)

### F-03: 마케팅 템플릿 5종 (사이드바)
| ID | 템플릿 | 설명 |
|----|--------|------|
| education | 🎓 교육 기관 홍보 | 학원·학교 특강·입학 홍보 |
| product | 🛍️ 상품 런칭 | 신상품 출시 멀티채널 카피 |
| event | 🎉 이벤트·프로모션 | 기간 한정 긴급성 강조 |
| brand | 💡 브랜드 스토리 | 브랜드 가치·신뢰 전달 |
| viral | 📱 SNS 바이럴 | 공유·댓글 유도형 콘텐츠 |

### F-04: 대화형 멀티턴 인터페이스
- 생성 결과 수정 요청, 톤 변경, 길이 조절 등 이어지는 대화 지원
- 스트리밍 응답 (SSE) — 실시간 텍스트 출력
- Enter: 전송 / Shift+Enter: 줄바꿈

### F-05: API 키 관리
- 앱 최초 진입 시 모달 자동 표시
- `sk-ant-` 접두사 형식 검증 후 허용
- **반드시 브라우저 메모리(Zustand state)에만 저장 — localStorage 저장 절대 금지**
- 페이지 종료 시 자동 삭제
- 헤더에 `● 연결됨` (초록) / `● 미연결` (회색) 배지 표시

---

## 5. 디자인 시스템

> **테마**: 프리미엄 라이트 (2026-04-04. 노션·Linear·Figma 수준의 고급 SaaS 라벤더 인디고 톤)

### CSS 변수 (index.css)
```css
--bg: #F5F4FF          /* 연한 라벤더 크림 배경 */
--surface: #FFFFFF     /* 카드·모달 — 순백 */
--surface2: #EEEEFF    /* 사이드바·입력창 — 연한 인디고 틴트 */
--border: #DDD9FF      /* 구분선 — 연한 인디고 */
--accent: #6C63FF      /* Primary 인디고 */
--accent2: #FF6B9D     /* 핑크 */
--accent3: #00B894     /* 연결됨 초록 */
--text: #1A1535        /* 진한 인디고 계열 텍스트 */
--text2: #6B6B8A       /* 보조 텍스트 — 인디고 그레이 */
--text-muted: #6B6B8A
--text-faint: #9B9BB8
--user-bg: #EEF0FF     /* 사용자 말풍선 */
```

### body 배경 (gradient mesh)
```css
background:
  radial-gradient(ellipse 80% 50% at 0% 0%, rgba(108,99,255,0.05) 0%, transparent 50%),
  radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255,107,157,0.04) 0%, transparent 50%),
  #F5F4FF;
```

### 특수 배경 색상 (CSS 변수 외)
- **헤더 배경**: `#FFFFFF` + `box-shadow: 0 1px 0 #DDD9FF, 0 4px 20px rgba(108,99,255,0.06)` (border 없음)
- **사이드바 배경**: `#F0EEFF`
- **채팅 영역 배경**: `#F8F7FF`
- **입력창 wrapper**: `#FFFFFF` + `box-shadow: 0 -4px 20px rgba(108,99,255,0.04)`
- **textarea 배경**: `#F8F7FF`

### 채널 카드 배경 (라이트 버전)
| 채널 | 카드 배경 | 헤더 배경 |
|------|---------|---------|
| 인스타그램 | `#FFF5F8` | 그라데이션 `#833ab4→#fd1d1d→#fcb045` |
| 카카오채널 | `#FFFEF0` | `#FFE812` (텍스트 `#1a1a1a`) |
| 블로그 | `#F0FFFC` | `#00B894` |
| 문자SMS | `#FFF8F0` | `#FF9500` |
| 유튜브 | `#FFF5F5` | `#FF0000` |
| 이메일 | `#F5F3FF` | `#6C63FF` |

- 카드 `border-radius: 14px`, `box-shadow: 0 4px 20px rgba(0,0,0,0.06)`

### 채널별 고유 색상 (체크박스·칩용)
| 채널 | 색상 | 비고 |
|------|------|------|
| 인스타그램 | `#E1306C` | |
| 카카오채널 | `#FFE812` | ON 상태 텍스트 `#1a1a1a` (가독성) |
| 블로그 | `#00D4AA` | |
| 문자SMS | `#FF9500` | |
| 유튜브 | `#FF0000` | |
| 이메일 | `#6C63FF` | |

- ON 상태: `box-shadow: 0 2px 8px {채널색상}40` 추가

### 헤더 특수 요소
- **앱 타이틀**: `font-weight: 800`, `color: #1A1535`
- **부제목**: `color: var(--accent)`
- **"✦ AI Powered" 뱃지**: 인디고→핑크 그라데이션 텍스트
- **언어 버튼 그룹**: `surface2` 배경 pill 안에 배치, 선택됨: `#6C63FF` 배경 + 그림자

### 사이드바 스타일
- 섹션 타이틀 `템플릿`: `color: var(--accent)`, `font-weight: 700`
- 기본 템플릿 카드: `background: #FFFFFF`, `border: 1px solid #E8E6FF`
- 선택된 카드: 그라데이션 배경 + `border-left: 3px solid #6C63FF` + shadow
- 초기화 버튼 hover: `color: var(--accent)`

### 말풍선 스타일
- **사용자**: `background: linear-gradient(135deg, #EEF0FF, #E8E4FF)`, `border: 1px solid rgba(108,99,255,0.2)`
- **AI**: `background: #FFFFFF`, `border: 1px solid #E8E6FF`, `box-shadow: 0 2px 8px rgba(108,99,255,0.06)`

### 전송 버튼 / 모달 저장 버튼
- `background: linear-gradient(135deg, #6C63FF, #FF6B9D)`
- `box-shadow: 0 4px 16px rgba(108,99,255,0.35)`

### API 키 모달
- overlay: `rgba(26,21,53,0.5)` + `backdrop-filter: blur(12px)`
- 모달: `border: 1px solid var(--border)`, `box-shadow: 0 24px 60px rgba(108,99,255,0.15)`

### 폰트
- 기본: `Noto Sans KR` (Google Fonts CDN)
- 대체: `Pretendard`, `sans-serif`

### 컴포넌트 규칙
- 모서리: 카드 `rounded-xl`, 모달 `rounded-2xl`, 채팅 버블 `rounded-2xl`, 채널카드 `14px`
- 색상은 CSS 변수(`var(--*)`) 사용, Tailwind 하드코딩 지양
- 스크롤바: 커스텀 스타일 (5px, 트랙 투명, thumb `var(--border)`)

---

## 6. 상태 관리 (Zustand)

### 영속화 규칙
```ts
partialize: (s) => ({
  language: s.language,
  activeChannels: s.activeChannels,
  // apiKey: 절대 제외 — F-05 보안
  // activeTemplate: 제외 — 항상 null(미선택)로 시작
})
```

### Zustand 셀렉터 규칙
객체 반환 셀렉터 사용 금지 → 무한 루프 발생:
```ts
// ❌ 금지
const { a, b } = useAppStore((s) => ({ a: s.a, b: s.b }))

// ✅ 올바른 방법 — 개별 셀렉터
const a = useAppStore((s) => s.a)
const b = useAppStore((s) => s.b)
```

---

## 7. 시스템 프롬프트 설계 원칙 (prompts.ts)

- 템플릿 컨텍스트 + 활성 채널별 포맷 지침 + 출력 언어를 **하나의 시스템 프롬프트**로 조합
- 채널이 여러 개 선택된 경우 → 각 채널을 구분 헤더로 분리하여 출력
- 언어 전환 시 시스템 프롬프트의 출력 언어 지시도 함께 변경

---

## 8. 보안 규칙

| 항목 | 규칙 |
|------|------|
| API 키 | Zustand 메모리 전용, persist 제외 필수 |
| XSS | 사용자 입력 HTML 이스케이프 |
| HTTPS | 배포 시 HTTPS 전용 |
| API 오류 | 상세 스택 트레이스 클라이언트 노출 금지 |

---

## 9. 개발 로드맵

| Phase | 목표 | 상태 |
|-------|------|------|
| Phase 1 MVP | 핵심 F-01~F-05 구현 + 배포 | 🚧 진행 중 |
| Phase 2 | 스트리밍·복사·내보내기·미리보기·이력 관리 | 예정 |
| Phase 3 | 회원 인증·이미지 생성·SNS 직접 게시 | 예정 |

### Phase 2 다음 구현 우선순위
1. `F-06` 채널별 원클릭 복사 버튼 (버블 호버 시 표시)
2. `F-06` 전체 결과 `.txt` 다운로드
3. `F-07` 세션 내 생성 이력 사이드바 저장
4. `F-08` 인스타그램 카드·SMS 폰 미리보기 모드

---

## 10. UX 규칙 및 수정 이력

> 아래 규칙은 실제 버그 수정 과정에서 확립된 것으로, 이후 개발 시 반드시 준수한다.

### UX-01: 채널 칩 ON/OFF 시각 규칙 (ChannelChips.tsx)
- **ON (선택됨)**: 채널 고유 색상 배경 + 흰색 텍스트 + 글로우 그림자 (`box-shadow: 0 0 8px {color}66`) + `opacity: 1`
- **OFF (선택 안됨)**: `var(--surface)` 배경 + `var(--text-faint)` 텍스트 + `var(--border)` 테두리 + `opacity: 0.5`
- **카카오 예외**: ON 상태에서 텍스트 색상 `#1a1a1a` (노란 배경에 가독성 확보)
- **최소 1개 선택 강제**: `toggleChannel`에서 `activeChannels.length <= 1` 이면 toggle 차단 (`store/appStore.ts`)
- 마지막 1개 칩 위에 `title` 툴팁으로 안내 메시지 표시

### UX-02: 템플릿 클릭 시 입력창 동작 규칙 (InputArea.tsx)
- 템플릿 카드 클릭 → textarea에 예시 텍스트 자동 채움 + `showHint = true`
- 힌트 배너 (`💡 아래는 예시입니다. 내 서비스 내용으로 바꿔서 입력하세요.`) 를 textarea 위에 표시
- 힌트 배너는 사용자가 텍스트를 **수정하는 순간** 자동으로 사라짐 (`handleChange`에서 `setShowHint(false)`)
- 전송 후에도 힌트 초기화
- `pendingInput` → `setText` → `setPendingInput('')` 순서로 처리 (store 값은 반드시 소비 후 초기화)

### UX-04: 채널 선택 체크박스 규칙 (ChannelChips.tsx)
- 채널 칩 형태를 **체크박스 + 라벨** 방식으로 구현 (`rounded-lg`, 좌측 체크박스 아이콘 포함)
- **ON**: 채널 고유 색상 배경 틴트(`color + '18'`) + 채널 색상 텍스트 + `1.5px solid` 색상 테두리
- **OFF**: `var(--surface)` 배경 + `var(--text-faint)` 텍스트 + `1.5px solid var(--border)` + `opacity: 0.6`
- 체크박스 아이콘: ON 시 채널 색상 배경 + SVG 체크마크(흰색, 카카오만 `#1a1a1a`), OFF 시 빈 원형 박스
- `rounded-full` 대신 `rounded-lg` 사용 (체크박스 스타일과 통일)

### UX-07: API 키 세션 유지 규칙 (useApiKey.ts, App.tsx)
- API 키는 `sessionStorage`에 만료 시각(`expiresAt`)과 함께 저장: `{ key, expiresAt: Date.now() + 4h }`
- 세션 키: `mpa_api_session`, 유효 시간: **4시간**
- `setApiKey()` 호출 시 Zustand + sessionStorage 동시 저장
- 앱 로드(`App.tsx useEffect`) 시 sessionStorage 확인 → 유효하면 Zustand 자동 복원 → 모달 표시 안 함
- 만료됐거나 없으면 sessionStorage 항목 삭제 후 모달 표시
- 브라우저 완전 종료 시 sessionStorage 자체가 삭제됨 (탭 닫기는 유지)
- **`localStorage` 저장 절대 금지** — PRD F-05 보안 요구사항 유지

### UX-05: 채널별 결과 카드 규칙 (ChannelCards.tsx, MessageBubble.tsx)
- AI 응답에 `===CHANNEL_ID===` 마커(`INSTAGRAM`, `KAKAO`, `BLOG`, `SMS`, `YOUTUBE`, `EMAIL`)가 있으면 **채널 카드 렌더링**
- 채널 없는 일반 AI 응답은 기존 말풍선으로 fallback
- 채널 카드 구조: 컬러 헤더(`rounded-t-xl`) + 콘텐츠 본문(`pt-3 pb-6`) + 좌측 3px 보더
- **카드에 `overflow-hidden` 사용 금지** — 내용 잘림 발생함. 헤더는 `rounded-t-xl`로만 처리
- **카드 `height: auto` 명시** — flex 컨텍스트에서 높이 자동 확장 보장
- 카드 간격: `gap-3` (16px), 마지막 카드 하단 잘림 방지를 위해 메시지 컨테이너 `pb-6` 유지
- 인스타그램: 해시태그(`#word`)를 파란색(`#1877F2`) 링크 스타일로 렌더링
- SMS: 본문 하단에 글자수 카운터 표시 (`90자 이내` 초과 시 빨간색 경고)
- 각 카드 우측 상단에 `📋 복사` 버튼 — 클릭 시 `✓ 복사됨`으로 2초간 표시
- 시스템 프롬프트(`prompts.ts`)에 마커 출력 형식 명시 필수 (마커 없으면 카드 렌더링 안 됨)
- SMS 프롬프트 지침: **90자 이내** (45자 아님)

### UX-06: 대화 초기화 버튼 규칙 (ChatMessages.tsx)
- 메시지가 1개 이상 있을 때 스크롤 영역 **바깥** 상단에 `🗑 초기화` 버튼 고정 (`shrink-0`)
- **레이아웃 구조**: `flex flex-col min-h-0` 외부 래퍼 → `shrink-0` 버튼 영역 → `flex-1 overflow-y-auto min-h-0` 스크롤 컨테이너
- 클릭 시 **확인 팝업 없이 즉시** `clearMessages()` 실행 → 웰컴 화면 복귀
- 호버 시 텍스트·테두리 빨간색 전환 (inline `onMouseEnter/Leave` 핸들러 사용)

### UX-03: 레이아웃 고정 규칙 — 스크롤 체인 (index.css, Layout.tsx, ChatMessages.tsx)

> **핵심 원칙**: Tailwind 클래스는 CSS 생성 순서에 따라 의도한 값이 무시될 수 있다.
> height / overflow / flex 관련 레이아웃 핵심 속성은 **반드시 inline style**로 작성한다.

#### index.css 규칙
```css
html { height: 100%; }
body { height: 100%; overflow: hidden; }   /* body 스크롤 차단 필수 */
#root { height: 100%; overflow: hidden; }
```
- `body`에 `overflow: hidden` 없으면 채팅 카드가 많아질 때 body 레벨 스크롤이 발생 → 내부 scroll container가 동작하지 않음

#### Layout.tsx inline style 체인 (Tailwind 사용 금지)
```
최외곽 div:  display:flex; flex-direction:column; height:100vh; overflow:hidden
콘텐츠 div:  display:flex; flex:1; min-height:0; overflow:hidden
main:        display:flex; flex-direction:column; flex:1; min-width:0; min-height:0; overflow:hidden
```

#### ChatMessages.tsx inline style 체인
```
채팅 컨테이너:  display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden
스크롤 div:     flex:1; overflow-y:auto; min-height:0   ← 이 div만 스크롤
내용 래퍼:      display:flex; flex-direction:column; gap:16px; padding:12px 16px 20px
```

#### 채널 카드 (ChannelCards.tsx)
- 카드 wrapper: `height:auto; min-height:fit-content; overflow:visible`
- 콘텐츠 영역: `padding: 12px 16px 32px` (하단 32px 필수 — 잘림 방지)
- `overflow: hidden` 절대 사용 금지
- 헤더 rounded: wrapper에 `border-radius:12px`, 헤더에 `border-radius:10px 10px 0 0` (overflow-hidden 없이 처리)

#### 기타
- **입력창** (`InputArea`): `shrink-0` (Tailwind 가능 — layout 체인 밖)
- **textarea**: `rows={5}` 유지
- **자동 스크롤**: `useEffect` deps `[messages.length, isLoading]`

### UX-08: 채널 카드 flex 레이아웃 규칙 (MessageBubble.tsx)
- 채널 응답 말풍선 행: `flex gap-3 flex-row items-start` — **`items-start` 필수**
- `items-start` 없으면 `align-items: stretch`(기본값)가 적용되어 카드 컨테이너가 아바타 높이로 제한됨 → 카카오 등 긴 카드 하단 잘림
- 채널 카드 컨테이너: `flex-1 min-w-0 max-w-[90%]` (width 제한, height는 content 따라감)

### UX-09: Zustand persist 버전 관리 규칙 (appStore.ts)
- 현재 persist key: `'marketing-pro-v3'`
- `activeChannels` 기본값: **6개 전부** `['instagram', 'kakao', 'blog', 'sms', 'youtube', 'email']`
- localStorage 이전 버전 값 복원 문제 발생 시 → persist key 이름을 올려서 이전 캐시 무효화
- **apiKey, activeTemplate은 persist `partialize`에서 반드시 제외** — 보안 및 초기화 요구사항

### UX-10: UI 언어 고정 + 콘텐츠 생성 언어 분리 규칙

> **2026-04-04 다국어 재설계**: UI는 항상 한국어, 언어 버튼은 "AI 생성 콘텐츠 언어"만 제어

- **UI 문자열은 항상 한국어 고정** — `useLanguage()` / `tr.*` 사용 금지
  - `InputArea.tsx`: placeholder/전송 버튼 한국어 하드코딩
  - `ApiKeyModal.tsx`: 모든 문자열 한국어 하드코딩
  - `TypingIndicator.tsx`: `'AI가 작성 중...'` 하드코딩
  - `Sidebar.tsx`: 템플릿 예시 텍스트는 `ko.templatePrompts` 직접 import 사용
- **헤더 언어 버튼** (`한국어 / EN / 日本語 / 中文`): AI가 마케팅 콘텐츠를 작성할 언어를 선택
  - 버튼 왼쪽에 `콘텐츠 생성 언어` 레이블 표시 (`Header.tsx`)
- **`languageDirective` (prompts.ts)**: 단순한 1줄 지시문 — AI에게 출력 언어만 지정
  ```ts
  ko: '한국어로 마케팅 콘텐츠를 작성해줘.'
  en: 'Please write all marketing content in English.'
  ja: 'マーケティングコンテンツを日本語で作成してください。'
  zh: '请用中文撰写所有营销内容。'
  ```

### UX-11: 초기화(resetAll) 완전 리셋 규칙 (appStore.ts)

> `clearMessages()` 대신 `resetAll()`을 사용해야 할 모든 버튼

- **`resetAll()` 실행 시 리셋 항목 6가지**:
  1. `messages → []` (대화 내용 전부 삭제, 웰컴 화면 복귀)
  2. `activeTemplate → null` (템플릿 미선택 상태)
  3. `activeChannels → 6개 전부` (인스타·카카오·블로그·SMS·유튜브·이메일)
  4. `language → 'ko'` (콘텐츠 생성 언어 한국어로 리셋)
  5. `pendingInput → ''`
  6. `clearCount++` (InputArea가 감지해 text/showHint 로컬 상태 리셋)
- **`clearCount` 패턴**: store에 `clearCount: number` 필드 유지. `InputArea.tsx`에서 `useEffect([clearCount])`로 감시 → `setText('')`, `setShowHint(false)` 실행
- **초기화 버튼 위치**: ChatMessages.tsx의 `🗑 초기화` 버튼 + Sidebar.tsx의 `대화 초기화` 버튼 — 둘 다 `resetAll()` 호출

### UX-12: 복사 텍스트 마크다운 제거 규칙 (ChannelCards.tsx)

- `CopyButton`의 복사 텍스트는 `cleanForCopy(text)` 통과 후 클립보드에 저장
- `cleanForCopy` 변환 규칙: `**bold**→bold`, `*italic*→italic`, `## heading→heading`, `` `code`→code ``, 코드블록 plain text화
- 마크다운 없는 순수 텍스트로 복사되어야 SNS·문자 붙여넣기 시 깔끔함

---

## 11. 성능 목표

| 지표 | 목표 |
|------|------|
| FCP | 2초 이내 |
| API TTFB | 3초 이내 |
| Lighthouse | 85점 이상 |
| 번들 사이즈 | 200KB 이내 (gzip) |
