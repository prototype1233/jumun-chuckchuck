import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InstallGuide from '../components/InstallGuide'
import Logo from '../components/Logo'
import MenuImage from '../components/MenuImage'
import { useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { primeSpeech } from '../hooks/useSpeech'
import { getRecentOrders } from '../lib/history'
import type { Menu } from '../types'

/** 지난 주문 카드의 사진 크기 */
const LAST_IMAGE_SIZE = 80

/**
 * '을' 과 '를' 중에 맞는 것을 고른다.
 * 한글 음절에 받침이 있으면 '을', 없으면 '를'.
 * ('바닐라 라떼을' 처럼 어색해지는 것을 막는다)
 */
function objectParticle(word: string): string {
  const last = word.trim().charCodeAt(word.trim().length - 1)
  const isHangul = last >= 0xac00 && last <= 0xd7a3
  if (!isHangul) return '를'
  return (last - 0xac00) % 28 === 0 ? '를' : '을'
}

interface LastOrder {
  menu: Menu
  quantity: number
}

/** 가장 최근 주문 한 건. 기록이 없거나 메뉴가 사라졌으면 null. */
function readLastOrder(): LastOrder | null {
  const [recent] = getRecentOrders()
  if (!recent) return null
  const menu = MENUS.find((m) => m.id === recent.menuId)
  if (!menu) return null
  return { menu, quantity: recent.quantity }
}

/**
 * 1. 시작 화면
 * 로고가 주인공인 화면. 로고 · 한 줄 문구 · 시작 버튼 외에는 아무것도 두지 않는다.
 *
 * 이 기기에 주문 기록이 있을 때만 '지난 주문' 카드 하나가 더 붙는다.
 * 기록이 없는 첫 방문에는 예전과 완전히 똑같은 화면이 나온다.
 */
export default function Welcome() {
  const navigate = useNavigate()
  const { setDine, addToCart } = useOrder()

  // 기록은 화면에 들어올 때 한 번만 읽는다.
  const [lastOrder] = useState<LastOrder | null>(readLastOrder)

  const handleStart = () => {
    // 첫 터치에서 음성 잠금을 풀어 두어야 다음 화면부터 안내가 나온다.
    primeSpeech()
    navigate('/dine')
  }

  /** 질문과 잔 수 선택을 건너뛰고 지난번 그대로 담는다. */
  const handleRepeat = () => {
    if (!lastOrder) return
    primeSpeech()
    setDine('store')
    addToCart(lastOrder.menu, lastOrder.quantity)
    navigate('/cart')
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] animate-enter flex-col bg-bg px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* 지난 주문 카드가 붙으면 로고를 줄여 한 화면에 들어가게 한다. */}
        <Logo className={lastOrder ? 'h-auto w-[55%]' : 'h-auto w-[70%]'} />
        <p className="mt-7 text-body font-medium text-ink-sub">오늘도 편하게 주문하세요</p>
      </div>

      <div className="pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {/* 홈 화면에 두는 방법. 이미 홈 화면 앱이거나 한 번 닫았으면 아무것도 그리지 않는다. */}
        <InstallGuide />

        {lastOrder && (
          <div className="mb-5 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-center gap-4">
              <MenuImage menu={lastOrder.menu} size={LAST_IMAGE_SIZE} radius={16} eager />
              <p className="min-w-0 flex-1 break-keep text-price font-semibold text-ink">
                지난번에는 {lastOrder.menu.name}
                {objectParticle(lastOrder.menu.name)} 드셨어요
              </p>
            </div>

            <button
              type="button"
              onClick={handleRepeat}
              className="mt-4 h-touch w-full rounded-cta border-2 border-line bg-surface text-amount font-semibold text-ink transition-transform duration-150 active:scale-[0.99]"
            >
              지난번과 똑같이 주문할래요
            </button>
          </div>
        )}

        <p className="mb-5 text-center text-sub font-medium text-ink-sub">
          가입 없이 바로 쓸 수 있어요
        </p>
        <Button onClick={handleStart}>시작하기</Button>
      </div>
    </div>
  )
}
