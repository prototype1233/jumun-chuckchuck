import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { useScreenSpeech } from '../hooks/useSpeech'
import { getFrequentMenuIds } from '../lib/history'
import { recommendMenus } from '../logic/recommend'
import type { Menu } from '../types'

const TITLE = '이 세 가지를 추천드려요'

/** 추천 카드 사진 크기 — 세 장이 스크롤 없이 들어가도록 실제 화면에서 맞춘 값 */
const IMAGE_SIZE = 112

/** 6. 추천 결과 — 세 개 중 하나를 누르면 바로 주문이 접수된다. */
export default function Result() {
  const navigate = useNavigate()
  const { state, selectMenu, resetAnswers } = useOrder()

  const menus = useMemo(() => recommendMenus(state.answers, MENUS), [state.answers])

  // 이 기기에서 여러 번 시킨 메뉴. 기록이 없으면 빈 값이라 배지도 나오지 않는다.
  const frequentIds = useMemo(() => new Set(getFrequentMenuIds()), [])

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

      {/* 배지가 붙고 메뉴 이름까지 두 줄로 감싸지면 카드가 높아진다.
          그 경우에도 390x844 에서 세 장이 스크롤 없이 들어가도록 간격을 잡았다. */}
      <div className="mt-3 flex flex-col gap-3">
        {menus.map((menu, index) => {
          // 배지는 카드당 하나만. 둘 다 해당하면 '자주 드시던 것' 을 먼저 보여 준다.
          const badge = frequentIds.has(menu.id)
            ? { text: '자주 드시던 것', color: 'bg-brand-deep' }
            : index === 0
              ? { text: '가장 인기 있어요', color: 'bg-brand' }
              : null

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => handlePick(menu)}
              className="flex w-full items-center gap-4 rounded-card bg-surface p-2 text-left shadow-card transition-transform duration-150 active:scale-[0.99]"
            >
              {/* 추천 3장은 바로 보여야 하므로 eager 로 불러온다 */}
              <MenuImage menu={menu} size={IMAGE_SIZE} radius={20} eager />

              <span className="flex min-w-0 flex-1 flex-col">
                {badge && (
                  <span
                    className={`mb-1 w-fit rounded-full ${badge.color} px-3 py-[2px] text-sub font-semibold text-white`}
                  >
                    {badge.text}
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
          )
        })}
      </div>
    </ScreenLayout>
  )
}
