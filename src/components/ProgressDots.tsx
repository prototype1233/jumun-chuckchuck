interface ProgressDotsProps {
  /** 전체 질문 수 */
  total: number
  /** 현재 질문 번호 (1부터) */
  current: number
}

/**
 * 질문 화면 상단의 점 인디케이터.
 * - 순수 표시용이다. 누를 수 없고 읽어 주지도 않는다. (몇 번째인지는 자막·음성으로 이미 안내한다)
 * - 화면의 주인공은 질문 글씨라서 눈에 띄지 않게 작고 옅게 둔다.
 * - 지나간 점과 안 지난 점은 같은 모양(10px)이고, 현재 점만 알약(24x10px)으로 늘어난다.
 */
export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div aria-hidden className="flex h-7 items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={[
            'block h-[10px] rounded-full transition-[width,background-color] duration-200 ease-out',
            i + 1 === current ? 'w-[24px] bg-brand' : 'w-[10px] bg-dot',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
