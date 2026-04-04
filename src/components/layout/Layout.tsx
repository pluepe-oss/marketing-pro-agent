import Header from './Header'
import Sidebar from './Sidebar'
import ChatMessages from '@/components/chat/ChatMessages'
import InputArea from '@/components/input/InputArea'

export default function Layout() {
  return (
    /* 최외곽: 100vh 고정, overflow hidden — body 스크롤 완전 차단 */
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      {/* 헤더: 고정 높이, 절대 축소 없음 */}
      <Header />

      {/* 콘텐츠 영역: 헤더 아래 남은 공간 전부 차지, 가로 배치 */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,   /* flex 자식이 내용 높이로 팽창하는 것 차단 */
        overflow: 'hidden',
      }}>
        <Sidebar />

        {/* 채팅 + 입력 영역: 세로 배치, 남은 너비 전부 */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <ChatMessages />
          <InputArea />
        </main>
      </div>
    </div>
  )
}
