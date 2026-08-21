import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { pickAgainPath, useOrder } from '../context/OrderContext'
import { useScreenSpeech } from '../hooks/useSpeech'
import { priceToKorean } from '../lib/speech'
import { cartCups, cartTotal, cupsLabel, itemTotal, won } from '../logic/cart'

const TITLE = '담은 음료예요'

/**
 * 장바구니 카드의 사진 크기.
 *
 * 120px 이던 것을 80px 로 줄였다. 사진이 아니라 오른쪽 글자 폭을 넓히기 위해서다.
 * 이름이 쓸 수 있는 폭이 91px 밖에 안 남아 '따뜻한 / 바닐라 / 라떼' 로 세 줄이 되고,
 * 그만큼 카드가 높아져 담은 것 두 개가 한 화면에 들어가지 못했다.
 *   글자 폭 = 312 - 카드 여백 16 - 사진 80 - 사이 16 - [빼기] 64 = 136px  (360px 화면 기준)
 * 글씨를 줄이는 대신 사진을 줄이고 [빼기] 의 좌우 여백도 한 단계 좁혔다.
 *
 * 자막 바를 걷어낼 때도 여기만은 키우지 않았다. 이 사진을 정하는 것은 세로가 아니라
 * 가로이기 때문이다 — 96px 로만 올려도 이름 폭이 120px 로 좁아져 다시 세 줄이 된다.
 * 걷어낸 63px 은 대신 목록이 가져갔다. 스크롤 없이 보이는 줄이 그만큼 늘어난다.
 */
const IMAGE_SIZE = 80

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

  // 값은 화면에는 '12,000원' 으로 적고, 읽어 줄 때만 '만 이천원' 으로 바꾼다.
  useScreenSpeech(
    cart.length
      ? `${TITLE} 모두 ${cups}잔, ${priceToKorean(total)}입니다. 더 담으시거나, 이대로 주문하실 수 있어요.`
      : '아직 담은 음료가 없어요. 음료 고르러 가기 단추를 눌러 주세요.',
  )

  /**
   * 처음부터 다시 골라 담는다. 담아 둔 것은 그대로 둔다.
   * 돌아갈 곳은 추천 화면의 [다시 고를래요] 와 같은 기준으로 정한다.
   * (말로 시작하셨으면 말하는 화면으로)
   */
  const goPickMore = () => {
    resetAnswers()
    navigate(pickAgainPath(state.entryMode))
  }

  if (!cart.length) {
    return (
      <ScreenLayout
        onBack={() => navigate('/result')}
        footer={<Button onClick={goPickMore}>음료 고르러 가기</Button>}
      >
        <h1 className="text-screen-title font-bold text-ink">{TITLE}</h1>
        <p className="mt-8 text-body font-medium text-ink-sub">아직 담은 음료가 없어요</p>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout
      onBack={() => navigate('/result')}
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
      <h1 className="text-screen-title font-bold text-ink">{TITLE}</h1>

      {/* 390x844 에서 두 줄까지는 스크롤 없이 들어가야 해서 간격을 넉넉함의 하한으로 잡았다. */}
      <ul className="mt-[var(--gap-card-sm)] flex flex-col gap-2">
        {cart.map((item) => (
          <li
            key={item.menu.id}
            className="flex items-center gap-4 rounded-card bg-surface p-2 shadow-card"
          >
            <MenuImage menu={item.menu} size={IMAGE_SIZE} radius={20} eager />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="break-keep text-card-title font-bold leading-[32px] text-ink">
                {item.menu.name}
              </span>
              <span className="mt-0.5 text-price font-medium text-ink-sub">
                {cupsLabel(item.quantity)}
              </span>
              <span className="mt-0.5 text-price font-bold text-brand">
                {won(itemTotal(item))}
              </span>
            </div>

            {/* X 아이콘 대신 글씨로 둔다. 아이콘만으로는 뜻이 전해지지 않는 경우가 많다. */}
            <button
              type="button"
              onClick={() => removeFromCart(item.menu.id)}
              aria-label={`${item.menu.name} 빼기`}
              className="mr-1 shrink-0 self-stretch rounded-2xl px-3 text-body font-semibold text-ink-sub active:scale-[0.98]"
            >
              빼기
            </button>
          </li>
        ))}
      </ul>
    </ScreenLayout>
  )
}
