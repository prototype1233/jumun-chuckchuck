import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircleIcon } from '../components/Icons'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'
import { cupsLabel, won } from '../logic/cart'

const QUESTION = '몇 잔 드릴까요?'

/** 고른 메뉴를 크게 확인시켜 주는 사진 크기 */
const IMAGE_SIZE = 200

/**
 * 네 잔 이상은 장바구니에서 같은 메뉴를 다시 담으면 된다.
 * 선택지를 늘리는 대신 세 개로 묶어 두는 편이 고르기 쉽다.
 */
const COUNTS = [1, 2, 3]

/**
 * 6-2. 잔 수 선택
 * 추천 결과에서 메뉴를 누르면 여기로 온다. 누르면 바로 장바구니에 담긴다.
 * 진행 인디케이터는 넣지 않는다. (질문 3개와는 별개의 단계다)
 *
 * 시작 화면의 '지난번과 같은 메뉴로 할래요' 로도 들어온다. 그때는 추천 화면을
 * 거치지 않았으므로 뒤로가기가 시작 화면으로 돌아가야 한다.
 */
export default function Quantity() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, addToCart } = useOrder()
  const { advance, cancel } = useAutoAdvance()
  const menu = state.selectedMenu

  // 어디서 들어왔는지 알려 준 화면이 있으면 그리로, 없으면 추천 화면으로 되돌아간다.
  const backTo = (location.state as { from?: string } | null)?.from ?? '/result'

  // 넘어가기 전 400ms 동안 무엇을 눌렀는지 보여 주기 위한 값이다.
  // 잔 수는 누르는 즉시 장바구니에 담기므로 화면에 남겨 둘 이유가 없어 지역 상태로 둔다.
  const [pressed, setPressed] = useState<number | null>(null)

  // 고른 메뉴 없이 들어온 경우 왔던 화면으로 되돌린다.
  useEffect(() => {
    if (!menu) navigate(backTo, { replace: true })
  }, [menu, navigate, backTo])

  useScreenSpeech(
    menu ? `${menu.name} ${QUESTION} 한 잔, 두 잔, 세 잔 중에서 골라 주세요.` : '',
  )

  if (!menu) return null

  const handleBack = () => {
    cancel()
    navigate(backTo)
  }

  return (
    <ScreenLayout onBack={handleBack} subtitle="몇 잔 드릴지 골라 주세요">
      <div className="flex flex-col items-center">
        <MenuImage menu={menu} size={IMAGE_SIZE} radius={28} eager />

        <p className="mt-5 break-keep text-center text-menu font-bold text-ink">{menu.name}</p>
        <p className="mt-1 text-amount font-semibold text-brand">{won(menu.price)}</p>
      </div>

      <h1 className="mt-8 text-question font-bold text-ink">{QUESTION}</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {COUNTS.map((count) => (
          <CountCard
            key={count}
            count={count}
            selected={pressed === count}
            onClick={() =>
              advance('/cart', () => {
                setPressed(count)
                addToCart(menu, count)
              })
            }
          />
        ))}
      </div>
    </ScreenLayout>
  )
}

interface CountCardProps {
  count: number
  selected: boolean
  onClick: () => void
}

/**
 * 잔 수 카드.
 * 생김새는 ChoiceCard 와 맞추되(테두리 3px + brand-tint + 체크),
 * 셋을 가로로 놓아야 해서 숫자를 위, 라벨을 아래로 쌓았다.
 */
function CountCard({ count, selected, onClick }: CountCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'relative flex h-[150px] flex-col items-center justify-center gap-1 rounded-card border-[3px]',
        'transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        selected
          ? 'border-brand bg-brand-tint shadow-card-selected'
          : 'border-transparent bg-surface shadow-card',
      ].join(' ')}
    >
      <span className={`text-count font-black ${selected ? 'text-brand' : 'text-ink'}`}>
        {count}
      </span>
      <span className="text-amount font-semibold text-ink">{cupsLabel(count)}</span>

      {selected && (
        <CheckCircleIcon size={28} className="absolute right-3 top-3 text-brand" />
      )}
    </button>
  )
}
