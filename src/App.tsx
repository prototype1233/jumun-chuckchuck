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
