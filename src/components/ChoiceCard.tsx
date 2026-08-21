import { CheckCircleIcon } from './Icons'

interface ChoiceCardProps {
  title: string
  selected: boolean
  onClick: () => void
  /**
   * 라벨 크기. 화면마다 가장 긴 라벨이 달라서 크기도 갈린다.
   * - large: 72px — 질문 화면. 가장 긴 라벨이 '달콤하게'(네 글자)라 크게 키울 수 있다.
   * - dine:  44px — 드실 곳 화면. '매장에서 마시기'(일곱 글자)가 한 줄에 들어가는 상한이다.
   */
  emphasis: 'large' | 'dine'
  /**
   * 카드의 '최소' 높이. (실제 값은 src/index.css 의 --h-choice / --h-choice-compact)
   * - default: 226px — 선택지가 둘일 때
   * - compact: 136px — 선택지가 셋일 때
   *
   * 카드는 flex-1 이라 질문 아래 남는 자리를 형제들과 똑같이 나눠 갖고 그만큼 높아진다.
   * 그래서 위 값은 '이보다 낮아지지는 않는다' 는 뜻이고, 390x844 에서 실제로는 더 높다.
   * 남는 자리를 카드가 먹어 치우므로 화면 아래에 빈 자리가 생기지 않는다.
   *
   * 이 값이 걸리는 것은 세로가 가장 짧은 기기(375x667)뿐이다. 거기서도 라벨 한 줄(84px)
   * 위아래로 자리가 남아 최소 터치 높이 88px 을 넉넉히 넘어선다.
   */
  size?: 'default' | 'compact'
}

/** 라벨 크기별 글자 토큰 */
const TITLE_CLASS: Record<ChoiceCardProps['emphasis'], string> = {
  large: 'text-choice-label',
  dine: 'text-choice-title',
}

/**
 * 선택 카드 — 카드 한가운데 라벨 한 줄뿐이다.
 *
 * 예전에는 왼쪽에 64px 아이콘이, 라벨 아래에 22px 보조 설명이 있었다.
 * 둘 다 걷어내고 그 자리를 전부 라벨에 줬다. 그림으로 무엇인지 짐작하시게 하는 것보다
 * 글자를 크게 키워 바로 읽히게 하는 쪽이 낫다는 피드백이다.
 * 무엇이 다른지는 음성 안내가 알려 드린다.
 *
 * - 평소: 흰 배경 + 부드러운 그림자, 테두리 없음
 * - 선택: 3px brand 테두리 + brand-tint 배경 + 우상단 체크
 * 테두리는 항상 3px 자리를 차지하게 두어 선택할 때 화면이 흔들리지 않게 했다.
 */
export default function ChoiceCard({
  title,
  selected,
  onClick,
  emphasis,
  size = 'default',
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        // justify-center + text-center: 아이콘이 빠진 자리를 왼쪽에 남기지 않고 라벨을 한가운데 둔다.
        // px-2: 라벨이 72px 로 커지면서 좌우 여백을 16 -> 8px 로 좁혔다.
        // 가장 긴 라벨 '달콤하게' 가 360px 화면에서도 한 줄에 남으려면 이 8px 이 필요하다.
        'relative flex w-full items-center justify-center rounded-card border-[3px] px-2 text-center',
        // flex-1 + min-h: 남는 자리는 카드들이 똑같이 나눠 갖고, 그 아래로는 줄어들지 않는다.
        'flex-1',
        size === 'compact' ? 'min-h-[var(--h-choice-compact)]' : 'min-h-[var(--h-choice)]',
        'transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        selected
          ? 'border-brand bg-brand-tint shadow-card-selected'
          : 'border-transparent bg-surface shadow-card',
      ].join(' ')}
    >
      {/* break-keep: 만에 하나 줄이 바뀌더라도 '매장에서 / 마시기' 처럼 낱말 단위로만 나뉘게 한다.
          글씨를 줄이는 대신 좌우 여백을 8px 까지 좁혀 한 줄을 지킨다.
          (지금 쓰는 라벨은 360px 화면에서도 전부 한 줄에 들어간다) */}
      <span className={['break-keep font-semibold text-ink', TITLE_CLASS[emphasis]].join(' ')}>
        {title}
      </span>

      {/* 체크는 카드 우상단에 절대 배치. 라벨은 세로 가운데라 서로 부딪히지 않는다. */}
      {selected && <CheckCircleIcon size={34} className="absolute right-5 top-5 text-brand" />}
    </button>
  )
}
