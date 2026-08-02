import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { clearHistory } from './lib/history'
import './index.css'

declare global {
  interface Window {
    /** 시연 리허설용 — 콘솔에서 주문 기록을 지우고 처음 방문 상태로 되돌린다. */
    __clearJumunHistory: () => void
  }
}

// 화면에는 어디에도 노출하지 않는다. 개발자 도구 콘솔에서만 쓰는 손잡이다.
window.__clearJumunHistory = () => {
  clearHistory()
  console.info('주문 기록을 지웠습니다. 새로고침하면 처음 방문 화면이 나옵니다.')
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('root 요소를 찾을 수 없습니다.')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
