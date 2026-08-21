import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import OfflineNotice from '../components/OfflineNotice'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { useOnline } from '../hooks/useOnline'
import { useScreenSpeech } from '../hooks/useSpeech'
import { menuSpeech, priceToKorean } from '../lib/speech'
import { cartCups, cartTotal, cupsLabel, itemTotal, won } from '../logic/cart'

const TITLE = '이대로 주문할까요?'

/**
 * 7. 주문 확인
 * 담은 것을 통째로 한 번 더 읽어 주고 확인을 받은 뒤에 대기번호를 만든다.
 * ※ 여기서도 결제는 하지 않는다.
 */
export default function OrderConfirm() {
  const navigate = useNavigate()
  const { state, confirmOrder } = useOrder()
  const cart = state.cart
  const online = useOnline()

  // 인터넷이 끊긴 채로 주문을 넣으려 한 상태
  const [blockedOffline, setBlockedOffline] = useState(false)

  const total = cartTotal(cart)
  const cups = cartCups(cart)

  // 담은 것 없이 들어온 경우 장바구니로 되돌린다.
  useEffect(() => {
    if (!cart.length) navigate('/cart', { replace: true })
  }, [cart.length, navigate])

  // 마지막으로 한 번 더 읽어 드리는 자리다. 값은 '만 이천원' 처럼 우리말로 읽는다.
  useScreenSpeech(
    cart.length
      ? `${TITLE} ${cart
          .map((item) => `${menuSpeech(item.menu)} ${cupsLabel(item.quantity)}`)
          .join(', ')}. 모두 ${cups}잔, ${priceToKorean(total)}입니다. 맞으면 아래 이걸로 할게요 단추를 눌러 주세요.`
      : '',
  )

  // 다시 연결되면 안내를 스스로 걷는다. 어르신이 닫는 법을 찾지 않아도 되게.
  useEffect(() => {
    if (online) setBlockedOffline(false)
  }, [online])

  if (!cart.length) return null

  const handleConfirm = () => {
    // 주문을 넣는 이 단계에서만 연결이 필요하다.
    if (!navigator.onLine) {
      setBlockedOffline(true)
      return
    }
    confirmOrder()
    navigate('/done')
  }

  if (blockedOffline) {
    return <OfflineNotice onRetry={handleConfirm} onBack={() => navigate('/cart')} />
  }

  return (
    <ScreenLayout
      onBack={() => navigate('/cart')}
      footer={
        <div className="flex flex-col gap-3">
          <p className="text-total font-bold text-ink">모두 {won(total)}</p>
          <Button onClick={handleConfirm}>이걸로 할게요</Button>
        </div>
      }
    >
      <h1 className="text-screen-title font-bold text-ink">{TITLE}</h1>

      <ul className="mt-[var(--stack-md)] flex flex-col gap-[var(--gap-card-sm)]">
        {cart.map((item) => (
          <li
            key={item.menu.id}
            className="flex items-baseline justify-between gap-3 rounded-card bg-surface px-5 py-4 shadow-card"
          >
            <span className="flex min-w-0 flex-col">
              <span className="break-keep text-card-title font-bold text-ink">
                {item.menu.name}
              </span>
              <span className="mt-1 text-price font-medium text-ink-sub">
                {cupsLabel(item.quantity)}
              </span>
            </span>
            <span className="shrink-0 text-price font-bold text-brand">
              {won(itemTotal(item))}
            </span>
          </li>
        ))}
      </ul>
    </ScreenLayout>
  )
}
