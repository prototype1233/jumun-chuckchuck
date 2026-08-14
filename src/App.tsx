import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import { useClickSound } from './hooks/useClickSound'
import Welcome from './screens/Welcome'
import VoiceOrder from './screens/VoiceOrder'
import DineOption from './screens/DineOption'
import Question from './screens/Question'
import Result from './screens/Result'
import Quantity from './screens/Quantity'
import Cart from './screens/Cart'
import OrderConfirm from './screens/OrderConfirm'
import OrderComplete from './screens/OrderComplete'

/**
 * 키오스크 시연 화면만 따로 떼어 나중에 받는다.
 *
 * 이 화면은 바코드를 읽는 라이브러리(@zxing) 를 쓰는데, 그것만으로 앱이 1.5배 무거워진다.
 * 어르신이 쓰시는 주문 화면들은 이 무게를 나눠 질 이유가 없다.
 * /kiosk 로 들어갈 때만 받아 오게 두면 앱 첫 화면은 예전 그대로 가볍게 뜬다.
 */
const Kiosk = lazy(() => import('./screens/Kiosk'))

/**
 * 주소가 바뀔 때마다 화면을 새로 그려서 200ms 페이드+슬라이드가 다시 재생되게 한다.
 * (질문 1→2→3 처럼 같은 컴포넌트를 쓰는 경우에도 전환이 보이도록)
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Welcome />} />
      <Route path="/voice" element={<VoiceOrder />} />
      <Route path="/dine" element={<DineOption />} />
      <Route path="/q/:step" element={<Question />} />
      <Route path="/result" element={<Result />} />
      <Route path="/quantity" element={<Quantity />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/confirm" element={<OrderConfirm />} />
      <Route path="/done" element={<OrderComplete />} />
      {/* 심사 시연용 매장 키오스크 흉내 화면. 앱 안 어디에서도 이리로 가는 길은 두지 않는다.
          (어르신이 잘못 들어오시면 안 되는 화면이라 주소를 아는 사람만 연다) */}
      <Route
        path="/kiosk"
        element={
          // 받아 오는 동안 잠깐 빈 화면이 스치는데, 시연 전에 미리 열어 두면 보이지 않는다.
          <Suspense
            fallback={
              <div className="flex h-[100dvh] w-full items-center justify-center bg-bg text-[24px] font-semibold text-ink-sub">
                매장 기계 화면을 준비하는 중이에요…
              </div>
            }
          >
            <Kiosk />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  // 앱 안의 모든 선택 카드·버튼에서 짧은 터치음이 나게 한다. (화면마다 따로 붙이지 않는다)
  useClickSound()

  return (
    <OrderProvider>
      {/* GitHub Pages 는 저장소 이름이 주소 앞에 붙는다.
          vite 의 base 를 그대로 쓰므로 저장소 이름이 바뀌어도 여기는 고칠 것이 없다. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AnimatedRoutes />
      </BrowserRouter>
    </OrderProvider>
  )
}
