import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InstallGuide from '../components/InstallGuide'
import { MicIcon } from '../components/Icons'
import Logo from '../components/Logo'
import MenuImage from '../components/MenuImage'
import ScreenFrame from '../components/ScreenFrame'
import { useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { primeSpeech } from '../hooks/useSpeech'
import { isVoiceInputSupported } from '../hooks/useVoiceInput'
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

/**
 * 가장 최근에 주문한 메뉴. 기록이 없거나 그 사이 메뉴가 없어졌으면 null.
 *
 * 잔 수는 일부러 가져오지 않는다. 지난번에 두 잔이었다고 오늘도 두 잔은 아니므로
 * 메뉴만 이어받고 잔 수는 잔 수 선택 화면에서 새로 고르게 한다.
 */
function readLastMenu(): Menu | null {
  const [recent] = getRecentOrders()
  if (!recent) return null
  return MENUS.find((m) => m.id === recent.menuId) ?? null
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
  const { setDine, selectMenu } = useOrder()

  // 기록은 화면에 들어올 때 한 번만 읽는다.
  const [lastMenu] = useState<Menu | null>(readLastMenu)

  // 브라우저마다 다르므로 한 번만 확인해 둔다.
  const [voiceSupported] = useState(isVoiceInputSupported)

  const handleStart = () => {
    // 첫 터치에서 음성 잠금을 풀어 두어야 다음 화면부터 안내가 나온다.
    primeSpeech()
    navigate('/dine')
  }

  /** 메뉴를 이미 정하고 오신 분을 위한 지름길. 질문 세 개를 건너뛴다. */
  const handleVoice = () => {
    primeSpeech()
    navigate('/voice')
  }

  /**
   * 질문 세 개를 건너뛰고 지난번 메뉴로 바로 잔 수를 고르러 간다.
   * 담기는 잔 수를 고른 뒤에 이뤄지므로 여기서는 메뉴만 정해 둔다.
   */
  const handleRepeat = () => {
    if (!lastMenu) return
    primeSpeech()
    setDine('store')
    selectMenu(lastMenu)
    // 잔 수 화면의 뒤로가기가 추천 화면이 아니라 여기로 돌아오게 알려 준다.
    navigate('/quantity', { state: { from: '/' } })
  }

  return (
    <ScreenFrame className="animate-enter px-6">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        {/* 지난 주문 카드가 붙으면 로고를 줄여 한 화면에 들어가게 한다. */}
        <Logo className={lastMenu ? 'h-auto w-[63%]' : 'h-auto w-[80%]'} />
        {/*
          '오늘도 편하게 주문하세요' 가 있던 자리.
          글씨가 작아 읽히지 않아 문구만 지우고, 그 자리는 다른 것으로 채우지 않는다.
          로고가 화면 가운데에 그대로 있도록 높이(mt-7 28px + 한 줄 30px)만 남긴다.
        */}
        <div aria-hidden className="h-[58px]" />
      </div>

      <div className="shrink-0 pb-[calc(env(safe-area-inset-bottom)+var(--stack-lg))]">
        {/* 홈 화면에 두는 방법. 이미 홈 화면 앱이거나 한 번 닫았으면 아무것도 그리지 않는다. */}
        <InstallGuide />

        {lastMenu && (
          <div className="mb-5 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-center gap-4">
              <MenuImage menu={lastMenu} size={LAST_IMAGE_SIZE} radius={16} eager />
              <p className="min-w-0 flex-1 break-keep text-price font-semibold text-ink">
                지난번에는 {lastMenu.name}
                {objectParticle(lastMenu.name)} 드셨어요
              </p>
            </div>

            <button
              type="button"
              onClick={handleRepeat}
              className="mt-4 h-touch w-full rounded-cta border-2 border-line bg-surface text-amount font-semibold text-ink transition-transform duration-150 active:scale-[0.99]"
            >
              같은 메뉴로 주문하기
            </button>
          </div>
        )}

        {/*
          안내 문구가 있던 자리. 문구만 지우고 높이(text-sub 한 줄 28px)는 그대로 둔다.
          위 카드와 시작 버튼이 예전과 똑같은 자리에 있도록 여백으로만 남긴다.
        */}
        <div aria-hidden className="mb-5 h-7" />

        {/* 말소리를 알아듣지 못하는 브라우저에서는 아예 보여 주지 않는다.
            눌러 보고 안 되면 더 혼란스럽기 때문이다. */}
        {voiceSupported && (
          <button
            type="button"
            onClick={handleVoice}
            className="mb-4 flex h-touch w-full items-center justify-center gap-3 rounded-cta border-2 border-line bg-surface text-ink transition-transform duration-150 active:scale-[0.99]"
          >
            <MicIcon size={40} />
            {/* 24px -> 버튼 라벨과 같은 34px. 대신 마이크 그림이 44 -> 40px 로 자리를 내준다. */}
            <span className="text-btn font-semibold leading-none">말로 주문하기</span>
          </button>
        )}

        <Button onClick={handleStart}>시작하기</Button>
      </div>
    </ScreenFrame>
  )
}
