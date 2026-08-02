import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import ScreenLayout from '../components/ScreenLayout'
import { CheckCircleIcon } from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { useScreenSpeech } from '../hooks/useSpeech'
import { saveOrder } from '../lib/history'
import { cartCups } from '../logic/cart'

/** 기계 앞에서 할 일 세 가지 */
const STEPS = ['가게 기계 앞으로 가세요', '이 번호를 누르세요', '카드를 넣으면 끝이에요']

/**
 * 7. 주문 완료
 * ※ 이 앱에서는 절대 결제하지 않는다. 결제는 매장 기계에서 카드로만 한다.
 *    (계좌 연동도, 카드 등록도 없다는 점이 이 서비스의 핵심이다.)
 */
export default function OrderComplete() {
  const navigate = useNavigate()
  const { state, resetAll } = useOrder()
  const waitingNumber = state.waitingNumber
  const cups = cartCups(state.cart)

  // 주문 없이 들어온 경우 시작 화면으로 되돌린다.
  useEffect(() => {
    if (!waitingNumber) navigate('/', { replace: true })
  }, [waitingNumber, navigate])

  // 주문이 끝난 이 시점에 이 기기에만 기록을 남긴다. (한 주문당 한 번만)
  const savedRef = useRef(false)
  useEffect(() => {
    if (!waitingNumber || savedRef.current) return
    savedRef.current = true
    saveOrder(
      state.cart.map((item) => ({
        menuId: item.menu.id,
        menuName: item.menu.name,
        quantity: item.quantity,
        dineOption: state.dine ?? 'store',
        orderedAt: Date.now(),
      })),
    )
  }, [waitingNumber, state.cart, state.dine])

  useScreenSpeech(
    waitingNumber
      ? `주문이 준비됐어요. 대기번호는 ${waitingNumber.split('').join(' ')} 입니다. 음료 ${cups}잔을 준비할게요. 가게 기계 앞으로 가셔서 이 번호를 누르고, 카드를 넣으시면 끝이에요.`
      : '',
  )

  const handleHome = () => {
    resetAll()
    navigate('/')
  }

  if (!waitingNumber) return null

  return (
    <ScreenLayout onBack={handleHome} backLabel="처음으로" subtitle="천천히 하셔도 괜찮아요">
      <div className="flex flex-col items-center">
        <CheckCircleIcon size={58} className="text-brand" />
        <h1 className="mt-4 text-question font-bold text-ink">주문이 준비됐어요</h1>

        <p className="mt-7 text-sub font-semibold text-ink-sub">대기번호</p>
        <p className="text-waiting font-black text-ink">{waitingNumber}</p>
        <p className="mt-1 text-body font-medium text-ink-sub">음료 {cups}잔을 준비할게요</p>
      </div>

      <ol className="mt-7 flex flex-col gap-4">
        {STEPS.map((text, index) => (
          <li key={text} className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-tint text-price font-bold text-brand-deep">
              {index + 1}
            </span>
            <span className="text-body font-medium text-ink">{text}</span>
          </li>
        ))}
      </ol>

      {/* 서명처럼 작고 흐리게 */}
      <div className="mt-auto flex justify-center pb-2 pt-6">
        <Logo className="h-auto w-[30%] opacity-50" />
      </div>
    </ScreenLayout>
  )
}
