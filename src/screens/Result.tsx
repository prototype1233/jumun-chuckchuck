import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { pickAgainPath, useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { useScreenSpeech } from '../hooks/useSpeech'
import { getFrequentMenuIds } from '../lib/history'
import { menuSpeech, priceToKorean, speechOf } from '../lib/speech'
import { recommendMenus } from '../logic/recommend'
import type { Menu } from '../types'

const TITLE = '이 세 가지를 추천드려요'

/** 화면에는 제목만 두고, 소리로는 무엇을 하시면 되는지까지 알려 드린다. */
const TITLE_SPEECH = '이 세 가지를 추천드려요. 마음에 드시는 것을 눌러주세요.'

/**
 * 추천 카드 사진 크기.
 *
 * 세 장이 스크롤 없이 들어가야 한다. (390x844 기준)
 * 카드 높이를 정하는 것은 사진이 아니라 오른쪽 글이다.
 *   배지 28 + 이름 32 + 가격 32 + 설명 30 = 122, 여기에 위아래 여백 12 = 134
 *   세 장 + 사이 간격 = 134 x 3 + 8 x 2 = 418
 *
 * 그래서 사진을 줄이는 것은 높이를 줄이려는 것이 아니라, 오른쪽 글자 폭을 넓혀
 * 이름과 설명이 두 줄로 넘어가지 않게(=카드가 높아지지 않게) 하려는 것이다.
 *   글자 폭 = 342 - 여백 12 - 사진 84 - 사이 12 = 234px
 *   가장 긴 이름 '시원한 바닐라 라떼'(26px) 가 216px 이라 한 줄에 들어간다.
 */
const IMAGE_SIZE = 84

/** 6. 추천 결과 — 세 개 중 하나를 누르면 바로 주문이 접수된다. */
export default function Result() {
  const navigate = useNavigate()
  const { state, selectMenu, resetAnswers } = useOrder()

  const menus = useMemo(() => recommendMenus(state.answers, MENUS), [state.answers])

  // 이 기기에서 여러 번 시킨 메뉴. 기록이 없으면 빈 값이라 배지도 나오지 않는다.
  const frequentIds = useMemo(() => new Set(getFrequentMenuIds()), [])

  // 안내에 이어 추천 세 가지를 이름과 값으로 읽어 드린다.
  // 화면 글씨가 잘 안 보이셔도 무엇을 얼마에 추천했는지는 귀로 아실 수 있어야 한다.
  // 값은 '3,600원' 이 아니라 '삼천 육백원' 으로 읽는다. (lib/speech.ts 참고)
  const speech = useMemo(() => {
    const intro = speechOf(TITLE, TITLE_SPEECH)
    if (!menus.length) return intro
    const list = menus.map((menu) => `${menuSpeech(menu)}, ${priceToKorean(menu.price)}`).join('. ')
    return `${intro} ${list}.`
  }, [menus])

  useScreenSpeech(speech)

  // 메뉴를 고르면 잔 수부터 정한다. 담기는 그 다음 화면에서 이뤄진다.
  const handlePick = (menu: Menu) => {
    selectMenu(menu)
    navigate('/quantity')
  }

  // 처음부터 다시 고른다. 답변을 비우고 가야 첫 질문이 아무것도 선택되지 않은 채로 나온다.
  //
  // 돌아갈 곳은 '어떻게 시작하셨는지' 에 달려 있다.
  // 말로 주문하시던 분을 버튼 질문 화면으로 보내면 하시던 방식이 통째로 바뀌어 버린다.
  const handleRetry = () => {
    resetAnswers()
    navigate(pickAgainPath(state.entryMode))
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
      <h1 className="break-keep text-question font-bold text-ink">{TITLE}</h1>

      {/* 세 장이 스크롤 없이 들어가야 하는 자리다.
          글씨 크기는 노안 대응 기준이라 줄이지 않고, 사진 크기와 여백으로만 맞춘다. */}
      <div className="mt-2 flex flex-col gap-2">
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
              className="flex w-full items-center gap-3 rounded-card bg-surface p-1.5 text-left shadow-card transition-transform duration-150 active:scale-[0.99]"
            >
              {/* 추천 3장은 바로 보여야 하므로 eager 로 불러온다 */}
              <MenuImage menu={menu} size={IMAGE_SIZE} radius={20} eager />

              <span className="flex min-w-0 flex-1 flex-col">
                {badge && (
                  <span
                    className={`mb-1 w-fit rounded-full ${badge.color} px-3 text-sub font-semibold leading-[24px] text-white`}
                  >
                    {badge.text}
                  </span>
                )}
                {/* break-keep: 한글이 낱말 중간에서 끊기지 않게 한다 ('아메리카 / 노' 방지) */}
                <span className="break-keep text-card-title font-bold leading-[32px] text-ink">
                  {menu.name}
                </span>
                <span className="mt-0.5 text-price font-bold leading-[30px] text-brand">
                  {menu.price.toLocaleString('ko-KR')}원
                </span>
                {/* 설명 22px — 18px 는 작아서 안 읽힌다고 하셔서 키웠다.
                    이 크기에서 한 줄에 들어가도록 메뉴 설명은 아홉 글자 안팎으로 쓴다. */}
                <span className="mt-0.5 truncate text-caption font-medium text-ink-sub">
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
