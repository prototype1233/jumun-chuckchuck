import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { useScreenSpeech } from '../hooks/useSpeech'
import { recommendMenus } from '../logic/recommend'
import type { Menu } from '../types'

const TITLE = '이 세 가지를 추천드려요'

/** 추천 카드 사진 크기 — 세 장이 스크롤 없이 들어가도록 실제 화면에서 맞춘 값 */
const IMAGE_SIZE = 120

/** 6. 추천 결과 — 세 개 중 하나를 누르면 바로 주문이 접수된다. */
export default function Result() {
  const navigate = useNavigate()
  const { state, selectMenu, resetAnswers } = useOrder()

  const menus = useMemo(() => recommendMenus(state.answers, MENUS), [state.answers])

  useScreenSpeech(`${TITLE}. 마음에 드는 것을 하나 눌러 주세요.`)

  // 메뉴를 고르면 잔 수부터 정한다. 담기는 그 다음 화면에서 이뤄진다.
  const handlePick = (menu: Menu) => {
    selectMenu(menu)
    navigate('/quantity')
  }

  // 처음부터 다시 고른다. 답변을 비우고 가야 첫 질문이 아무것도 선택되지 않은 채로 나온다.
  const handleRetry = () => {
    resetAnswers()
    navigate('/q/1')
  }

  return (
    <ScreenLayout
      onBack={() => navigate('/q/3')}
      subtitle="드시고 싶은 것을 하나 눌러 주세요"
      footer={
        <Button variant="outline" onClick={handleRetry}>
          다시 고를래요
        </Button>
      }
    >
      <h1 className="text-question font-bold text-ink">{TITLE}</h1>

      <div className="mt-4 flex flex-col gap-5">
        {menus.map((menu, index) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => handlePick(menu)}
            className="flex w-full items-center gap-4 rounded-card bg-surface p-[10px] text-left shadow-card transition-transform duration-150 active:scale-[0.99]"
          >
            {/* 추천 3장은 바로 보여야 하므로 eager 로 불러온다 */}
            <MenuImage menu={menu} size={IMAGE_SIZE} radius={20} eager />

            <span className="flex min-w-0 flex-1 flex-col">
              {index === 0 && (
                <span className="mb-1 w-fit rounded-full bg-brand px-3 py-[2px] text-sub font-semibold text-white">
                  가장 인기 있어요
                </span>
              )}
              {/* break-keep: 한글이 낱말 중간에서 끊기지 않게 한다 ('아메리카 / 노' 방지) */}
              <span className="break-keep text-card-title font-bold leading-[32px] text-ink">
                {menu.name}
              </span>
              <span className="mt-1 text-price font-bold text-brand">
                {menu.price.toLocaleString('ko-KR')}원
              </span>
              <span className="mt-1 truncate text-sub font-medium text-ink-sub">
                {menu.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </ScreenLayout>
  )
}
