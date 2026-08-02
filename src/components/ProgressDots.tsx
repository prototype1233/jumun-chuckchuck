interface ProgressDotsProps {
  /** 전체 질문 수 */
  total: number
  /** 현재 질문 번호 (1부터) */
  current: number
}

/** '3개 중 1번째' 안내 문구 + 점 인디케이터 */
export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sub font-semibold text-ink-sub">
        {total}개 중 {current}번째
      </span>
      <span className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[
              'block h-[10px] rounded-full transition-all duration-200',
              i + 1 === current ? 'w-[28px] bg-brand' : 'w-[10px] bg-line',
            ].join(' ')}
          />
        ))}
      </span>
    </div>
  )
}
