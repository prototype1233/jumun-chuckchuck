import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import ScreenLayout from '../components/ScreenLayout'
import { pickAgainPath, useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { useScreenSpeech } from '../hooks/useSpeech'
import { getFrequentMenuIds } from '../lib/history'
import { menuSpeech, priceToKorean, speechOf } from '../lib/speech'
import { RECOMMEND_COUNT, recommendMenus } from '../logic/recommend'
import type { Menu } from '../types'

/**
 * 화면 제목은 지금 보고 계신 것이 '처음 추천' 인지 '넘겨 본 다음 것' 인지에 따라 달라진다.
 * 제목이 그대로면 눌렀는데 아무 일도 없었나 싶어진다.
 */
/*
 * 반드시 한 줄에 들어가야 한다. 두 줄이 되면 71px 을 더 먹어
 * 카드 세 장과 아래 버튼이 한 화면에 들어가지 못한다.
 * ('이 세 가지를 추천드려요' 는 64px 에서 570px 이라 어느 휴대폰에서도 두 줄이 된다)
 * 화면에서 덜어낸 말은 아래 TITLE_*_SPEECH 가 그대로 읽어 드린다.
 */
const TITLE_FIRST = '이 세 가지예요'
const TITLE_MORE = '다른 메뉴예요'

/** 화면에는 제목만 두고, 소리로는 무엇을 하시면 되는지까지 알려 드린다. */
const TITLE_FIRST_SPEECH = '이 세 가지를 추천드려요. 마음에 드시는 것을 눌러주세요.'
const TITLE_MORE_SPEECH = '다른 메뉴예요. 마음에 드시는 것을 눌러주세요.'

/**
 * 추천 카드 사진 한 변 — 그대로 카드 높이가 된다. (실제 값은 src/index.css 의 --img-recommend)
 *
 * 카드 안쪽 여백을 0 으로 두어 사진이 카드 왼쪽을 위아래로 꽉 채운다.
 * 시연 기기(390x844)에서 152px 이고, 좁은 기기에서는 한 단계씩 내려간다.
 *
 * 사진을 더 키우지 못하는 까닭은 세로가 아니라 가로다.
 *   이름이 쓸 폭 = 화면 폭 - 좌우 24 - 사진 - 사이 4 - 오른쪽 여백 6
 * 390px 화면에서 사진이 152px 이면 204px 가 남는데, 가장 긴 덩어리가
 * '카라멜 라떼'(197px) 라 여기서 조금만 더 좁아지면 이름이 세 줄로 접힌다.
 * 세 줄이 되면 카드가 사진보다 높아져 사진 위아래에 빈 자리가 생긴다.
 * 그래서 사진을 키울 때는 반드시 이름이 몇 줄이 되는지까지 함께 봐야 한다.
 */
const IMAGE_SIZE = 'var(--img-recommend)'

/**
 * 사진 자체는 각지게 두고, 카드가 overflow-hidden 으로 왼쪽 두 모서리만 잘라 준다.
 * 그래야 사진의 둥글기가 카드 모서리(28px)와 정확히 맞물린다.
 */
const IMAGE_RADIUS = 0

/**
 * 카드 높이 — 사진 크기 그대로다. (카드 안쪽 여백 0)
 *
 * min-h 로 두는 것은 이름이 여러 줄이 되면 카드가 알아서 늘어나야 하기 때문이다.
 * 배지가 붙는 카드만 배지 한 줄(24px)과 이름과의 사이(2px)만큼 높다.
 * (src/index.css 의 --h-recommend-*)
 */
const CARD_HEIGHT = {
  withBadge: 'min-h-[var(--h-recommend-badge)]',
  plain: 'min-h-[var(--h-recommend-plain)]',
} as const

/**
 * 사진 높이 — 카드 높이와 같은 값을 그대로 넣는다.
 *
 * 폭은 언제나 --img-recommend(정사각)이지만, 배지가 붙은 카드만 카드가 26px 더 높다.
 * 그 한 장까지 정사각으로 두면 사진 위아래에 흰 띠가 생겨 혼자만 여백이 있는 카드로 보인다.
 * 그래서 배지 카드의 사진만 세로로 조금 더 길게 잘라 카드 왼쪽을 끝까지 채운다.
 */
const IMAGE_HEIGHT = {
  withBadge: 'var(--h-recommend-badge)',
  plain: 'var(--h-recommend-plain)',
} as const

/**
 * offset 부터 세 개를 잘라 온다. 끝에 닿으면 앞에서 이어 받아 언제나 세 장을 채운다.
 *
 * 후보가 네 개일 때 두 번째 화면이 [4번, 1번, 2번] 처럼 겹치는데, 그렇더라도
 * 카드가 두 장만 나오는 것보다 낫다. 화면 모양이 들쭉날쭉하면 그것부터 당황스럽다.
 */
function pageOf(candidates: Menu[], offset: number): Menu[] {
  if (candidates.length <= RECOMMEND_COUNT) return candidates
  return Array.from(
    { length: RECOMMEND_COUNT },
    (_, i) => candidates[(offset + i) % candidates.length],
  )
}

/** 6. 추천 결과 — 세 개 중 하나를 누르면 바로 주문이 접수된다. */
export default function Result() {
  const navigate = useNavigate()
  const { state, selectMenu, resetAnswers } = useOrder()

  // 조건에 맞는 후보 '전부' 를 인기순으로 받아 둔다. 세 개씩 끊는 것은 여기서 한다.
  const candidates = useMemo(() => recommendMenus(state.answers, MENUS), [state.answers])

  // 지금 몇 번째 메뉴부터 보고 있는지. [다른 메뉴 보기] 를 누를 때마다 세 칸씩 밀린다.
  const [offset, setOffset] = useState(0)

  const menus = useMemo(() => pageOf(candidates, offset), [candidates, offset])

  // 후보가 한 화면(세 개)을 넘지 않으면 [다른 메뉴 보기] 를 아예 만들지 않는다.
  // 눌러도 같은 메뉴가 다시 나오는 버튼은 없는 것만 못하다.
  const hasMore = candidates.length > RECOMMEND_COUNT

  // 처음 보시는 화면인지 — 제목과 '가장 인기 있어요' 배지가 여기에 달려 있다.
  const isFirstPage = offset === 0

  // 이 기기에서 여러 번 시킨 메뉴. 기록이 없으면 빈 값이라 배지도 나오지 않는다.
  const frequentIds = useMemo(() => new Set(getFrequentMenuIds()), [])

  // 안내에 이어 추천 세 가지를 이름과 값으로 읽어 드린다.
  // 화면 글씨가 잘 안 보이셔도 무엇을 얼마에 추천했는지는 귀로 아실 수 있어야 한다.
  // 값은 '3,600원' 이 아니라 '삼천 육백원' 으로 읽는다. (lib/speech.ts 참고)
  //
  // 메뉴를 넘기면 이 문장이 통째로 바뀌므로 useScreenSpeech 가 새 세 가지를 다시 읽어 준다.
  // 눈으로 못 보신 분도 화면이 바뀐 것을 아셔야 한다.
  const speech = useMemo(() => {
    const intro = isFirstPage
      ? speechOf(TITLE_FIRST, TITLE_FIRST_SPEECH)
      : speechOf(TITLE_MORE, TITLE_MORE_SPEECH)
    if (!menus.length) return intro
    const list = menus.map((menu) => `${menuSpeech(menu)}, ${priceToKorean(menu.price)}`).join('. ')
    return `${intro} ${list}.`
  }, [menus, isFirstPage])

  useScreenSpeech(speech)

  // 메뉴를 고르면 잔 수부터 정한다. 담기는 그 다음 화면에서 이뤄진다.
  const handlePick = (menu: Menu) => {
    selectMenu(menu)
    navigate('/quantity')
  }

  /**
   * 같은 답변 그대로, 다음 순위 세 개를 보여 드린다.
   *
   * 끝까지 보시면 아무 말 없이 처음 세 개로 돌아간다.
   * '더 이상 없어요' 를 띄우면 막다른 곳에 몰린 느낌이 든다. 계속 넘겨 보실 수 있어야 한다.
   */
  const handleShowMore = () => {
    setOffset((prev) => {
      const next = prev + RECOMMEND_COUNT
      return next >= candidates.length ? 0 : next
    })
  }

  // 처음부터 다시 고른다. 답변을 비우고 가야 첫 질문이 아무것도 선택되지 않은 채로 나온다.
  // 몇 번째 메뉴를 보고 있었는지도 함께 되돌린다. 새로 고르신 답의 결과는 1등부터 보여야 한다.
  //
  // 돌아갈 곳은 '어떻게 시작하셨는지' 에 달려 있다.
  // 말로 주문하시던 분을 버튼 질문 화면으로 보내면 하시던 방식이 통째로 바뀌어 버린다.
  const handleRetry = () => {
    setOffset(0)
    resetAnswers()
    navigate(pickAgainPath(state.entryMode))
  }

  return (
    <ScreenLayout
      onBack={() => navigate('/q/3')}
      subtitle="드시고 싶은 것을 눌러 주세요"
      // 카드가 화면 폭을 최대한 쓰도록 좌우 여백을 24 -> 12px 로 좁힌다.
      tightPadX
      // 자막을 22px 로 낮춰 바 높이 16px 을 카드에 넘겨준다.
      compactSubtitle
      footer={
        // 버튼 사이는 8px. 두 개가 들어가도 390x844 에서 카드가 밀려나지 않는 간격이다.
        <div className="flex flex-col gap-1.5">
          {hasMore && (
            <Button variant="outline" onClick={handleShowMore}>
              다른 메뉴 보기
            </Button>
          )}
          <Button variant="outline" onClick={handleRetry}>
            다시 고를래요
          </Button>
        </div>
      }
    >
      {/* 제목은 반드시 한 줄이어야 한다. 두 줄이 되면 그 한 번에 71px 을 잃어
          카드 셋이 스크롤 없이 들어가지 못한다. 크기(64px)와 줄간격(71px)은
          화면 폭에 따라 갈린다. (src/index.css 의 --fs-result-title)
          줄간격을 80 -> 71px 로 좁힌 것이 곧 제목과 카드 사이를 좁힌 것이다. */}
      <h1 className="break-keep text-result-title font-bold text-ink">
        {isFirstPage ? TITLE_FIRST : TITLE_MORE}
      </h1>

      {/* 세 장이 스크롤 없이 들어가야 하는 자리다.
          390x844 에서 카드 178 + 8 + 152 + 8 + 152 = 498px 이 여기에 들어간다.

          key={offset}: 메뉴가 바뀔 때마다 이 자리를 새로 그려 200ms 페이드를 다시 재생한다.
          움직임 없이 색만 스며들게 한다 — 화면이 툭 바뀌면 잘못 눌렀나 싶어 놀라신다. */}
      <div key={offset} className="flex animate-fade flex-col gap-2">
        {menus.map((menu, index) => {
          // 배지는 카드당 하나만. 둘 다 해당하면 '자주 드시던 것' 을 먼저 보여 준다.
          //
          // '가장 인기 있어요' 는 첫 화면의 1등에만 붙인다.
          // 넘겨 본 화면의 맨 위는 4등·7등이라 같은 배지를 또 붙이면 거짓말이 된다.
          const badge = frequentIds.has(menu.id)
            ? { text: '자주 드시던 것', color: 'bg-brand-deep' }
            : isFirstPage && index === 0
              ? { text: '가장 인기 있어요', color: 'bg-brand' }
              : null

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => handlePick(menu)}
              // p 없음 · overflow-hidden — 사진이 카드 왼쪽을 여백 없이 채우고,
              // 사진의 왼쪽 두 모서리는 카드 모서리(28px)에 맞춰 잘린다.
              className={`flex w-full items-center gap-1 overflow-hidden rounded-card bg-surface text-left shadow-card transition-transform duration-150 active:scale-[0.99] ${
                badge ? CARD_HEIGHT.withBadge : CARD_HEIGHT.plain
              }`}
            >
              {/* 추천 3장은 바로 보여야 하므로 eager 로 불러온다 */}
              <MenuImage
                menu={menu}
                size={IMAGE_SIZE}
                height={badge ? IMAGE_HEIGHT.withBadge : IMAGE_HEIGHT.plain}
                radius={IMAGE_RADIUS}
                eager
              />

              {/* 사진 · 이름 · 값, 이 셋뿐이다. 한 줄 설명은 걷어냈다.
                  이름과 값 사이는 벌리지 않는다 — 줄간격(52 / 48px)이 이미 자리를 잡아 준다.
                  이름 두 줄 + 값이 정확히 사진 높이(152px)와 같아 카드에 빈 자리가 없다.
                  pr-1.5: 값이 카드 오른쪽 끝에 붙지 않을 만큼만 남긴 6px. */}
              <span className="flex min-w-0 flex-1 flex-col justify-center pr-1.5">
                {badge && (
                  <span
                    className={`mb-0.5 w-fit rounded-full ${badge.color} px-3 text-sub font-semibold leading-[24px] text-white`}
                  >
                    {badge.text}
                  </span>
                )}
                {/* break-keep: 한글이 낱말 중간에서 끊기지 않게 한다 ('아메리카 / 노' 방지) */}
                <span className="break-keep text-recommend-name font-bold text-ink">
                  {menu.name}
                </span>
                <span className="text-card-price font-bold text-brand">
                  {menu.price.toLocaleString('ko-KR')}원
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </ScreenLayout>
  )
}
