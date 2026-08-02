import type { ReactNode } from 'react'
import { CheckCircleIcon } from './Icons'

interface ChoiceCardProps {
  icon: ReactNode
  title: string
  /** 한 줄 부연 설명 (없으면 제목만 크게) */
  caption?: string
  selected: boolean
  onClick: () => void
  /** large: 부연 설명 없이 라벨만 크게(28px) 보여 주는 질문 화면용 */
  emphasis?: 'default' | 'large'
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
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'relative flex w-full items-center gap-6 rounded-card border-[3px] px-7 text-left',
        'h-[180px] transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        selected
          ? 'border-brand bg-brand-tint shadow-card-selected'
          : 'border-transparent bg-surface shadow-card',
      ].join(' ')}
    >
      <span className={selected ? 'text-brand' : 'text-ink'}>{icon}</span>

      <span className="flex min-w-0 flex-col gap-1">
        <span
          className={[
            'font-semibold text-ink',
            emphasis === 'large' ? 'text-btn' : 'text-card-title',
          ].join(' ')}
        >
          {title}
        </span>
        {caption && <span className="text-sub font-medium text-ink-sub">{caption}</span>}
      </span>

      {selected && (
        <CheckCircleIcon size={34} className="absolute right-5 top-5 text-brand" />
      )}
    </button>
  )
}
