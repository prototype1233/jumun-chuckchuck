import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { useScreenSpeech } from '../hooks/useSpeech'
import { cartCups, cartTotal, cupsLabel, itemTotal, won } from '../logic/cart'

const TITLE = '담은 음료예요'

/** 장바구니 카드의 사진 크기 */
const IMAGE_SIZE = 120

/**
 * 6-3. 장바구니
 * 여기서 할 수 있는 일은 세 가지뿐이다 — 빼기 / 더 담기 / 주문하기.
 * 수량 조절 버튼이나 항목 편집은 두지 않는다. 잔 수는 담기 전에 이미 정했다.
 */
export default function Cart() {
  const navigate = useNavigate()
  const { state, removeFromCart, resetAnswers } = useOrder()
  const cart = state.cart

  const total = cartTotal(cart)
  const cups = cartCups(cart)

  useScreenSpeech(
    cart.length
      ? `${TITLE} 모두 ${cups}잔, ${won(total)}입니다. 더 담으시거나, 이대로 주문하실 수 있어요.`
      : '아직 담은 음료가 없어요. 음료 고르러 가기 단추를 눌러 주세요.',
  )

  /** 처음 질문부터 다시 골라 담는다. 담아 둔 것은 그대로 둔다. */
  const goPickMore = () => {
    resetAnswers()
    navigate('/q/1')
  }

  if (!cart.length) {
    return (
      <ScreenLayout
        onBack={() => navigate('/result')}
        subtitle="더 담으시거나 주문하실 수 있어요"
        footer={<Button onClick={goPickMore}>음료 고르러 가기</Button>}
      >
        <h1 className="text-question font-bold text-ink">{TITLE}</h1>
        <p className="mt-8 text-body font-medium text-ink-sub">아직 담은 음료가 없어요</p>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout
      onBack={() => navigate('/result')}
      subtitle="더 담으시거나 주문하실 수 있어요"
      footer={
        <div className="flex flex-col gap-3">
          {/* 총액은 목록이 길어져도 항상 눈에 보이도록 버튼과 함께 아래에 고정한다. */}
          <p className="text-total font-bold text-ink">모두 {won(total)}</p>

          <Button variant="outline" onClick={goPickMore}>
            더 담을래요
          </Button>
          <Button onClick={() => navigate('/confirm')}>이대로 주문할게요</Button>
        </div>
      }
    >
      <h1 className="text-question font-bold text-ink">{TITLE}</h1>

      {/* 390x844 에서 두 줄까지는 스크롤 없이 들어가야 해서 간격을 넉넉함의 하한으로 잡았다. */}
      <ul className="mt-4 flex flex-col gap-3">
        {cart.map((item) => (
          <li
            key={item.menu.id}
            className="flex items-center gap-4 rounded-card bg-surface p-[10px] shadow-card"
          >
            <MenuImage menu={item.menu} size={IMAGE_SIZE} radius={20} eager />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="break-keep text-card-title font-bold leading-[32px] text-ink">
                {item.menu.name}
              </span>
              <span className="mt-1 text-price font-medium text-ink-sub">
                {cupsLabel(item.quantity)}
              </span>
              <span className="mt-1 text-price font-bold text-brand">
                {won(itemTotal(item))}
              </span>
            </div>

            {/* X 아이콘 대신 글씨로 둔다. 아이콘만으로는 뜻이 전해지지 않는 경우가 많다. */}
            <button
              type="button"
              onClick={() => removeFromCart(item.menu.id)}
              aria-label={`${item.menu.name} 빼기`}
              className="mr-1 shrink-0 self-stretch rounded-2xl px-4 text-body font-semibold text-ink-sub active:scale-[0.98]"
            >
              빼기
            </button>
          </li>
        ))}
      </ul>
    </ScreenLayout>
  )
}
