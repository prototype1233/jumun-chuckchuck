import type { ReactNode } from 'react'
import { CheckCircleIcon } from './Icons'

interface ChoiceCardProps {
  icon: ReactNode
  title: string
  /** 한 줄 부연 설명 (없으면 제목만 크게) */
  caption?: string
  selected: boolean
  onClick: () => void
  /**
   * 제목 크기.
   * - default: 26px
   * - large:   28px — 부연 설명 없이 라벨만 크게 보여 주는 질문 화면용
   * - dine:    32px — 선택지가 둘뿐인 식사 장소 화면용
   */
  emphasis?: 'default' | 'large' | 'dine'
  /**
   * 카드 높이.
   * - default: 180px — 선택지가 둘일 때
   * - compact: 160px — 선택지가 셋일 때. 세 장이 스크롤 없이 한 화면에 들어가게 한다.
   */
  size?: 'default' | 'compact'
}

/** 제목 크기별 글자 토큰 */
const TITLE_CLASS: Record<NonNullable<ChoiceCardProps['emphasis']>, string> = {
  default: 'text-card-title',
  large: 'text-btn',
  dine: 'text-choice-title',
}

/**
 * 글씨가 커진 만큼 좌우 여백을 줄여, 커진 뒤에도 '매장에서 먹기' 같은 말이
 * 한 줄에 들어가게 한다. (글씨를 줄이는 대신 여백을 줄인다)
 */
const PADDING_CLASS: Record<NonNullable<ChoiceCardProps['emphasis']>, string> = {
  default: 'px-7 gap-6',
  large: 'px-7 gap-6',
  dine: 'px-5 gap-4',
}

/**
 * 선택 카드.
 * - 평소: 흰 배경 + 부드러운 그림자, 테두리 없음
 * - 선택: 3px brand 테두리 + brand-tint 배경 + 우상단 체크
 * 테두리는 항상 3px 자리를 차지하게 두어 선택할 때 화면이 흔들리지 않게 했다.
 */
export default function ChoiceCard({
  icon,
  title,
  caption,
  selected,
  onClick,
  emphasis = 'default',
  size = 'default',
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'relative flex w-full items-center rounded-card border-[3px] text-left',
        PADDING_CLASS[emphasis],
        size === 'compact' ? 'h-[160px]' : 'h-[180px]',
        'transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        selected
          ? 'border-brand bg-brand-tint shadow-card-selected'
          : 'border-transparent bg-surface shadow-card',
      ].join(' ')}
    >
      <span className={selected ? 'shrink-0 text-brand' : 'shrink-0 text-ink'}>{icon}</span>

      <span className="flex min-w-0 flex-col gap-1">
        {/* break-keep: 줄이 바뀌더라도 '매장에서 / 먹기' 처럼 낱말 단위로만 나뉘게 한다 */}
        <span className={['break-keep font-semibold text-ink', TITLE_CLASS[emphasis]].join(' ')}>
          {title}
        </span>
        {caption && (
          <span className="break-keep text-caption font-medium text-ink-sub">{caption}</span>
        )}
      </span>

      {selected && <CheckCircleIcon size={34} className="absolute right-5 top-5 text-brand" />}
    </button>
  )
}
