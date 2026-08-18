import { CheckCircleIcon } from './Icons'

interface ChoiceCardProps {
  title: string
  selected: boolean
  onClick: () => void
  /**
   * 라벨 크기. 화면마다 가장 긴 라벨이 달라서 크기도 갈린다.
   * - large: 52px — 질문 화면. 가장 긴 라벨이 '달콤하게'(네 글자)라 크게 키울 수 있다.
   * - dine:  44px — 드실 곳 화면. '매장에서 마시기'(일곱 글자)가 한 줄에 들어가는 상한이다.
   */
  emphasis: 'large' | 'dine'
  /**
   * 카드 높이. 아래 px 는 휴대폰 세로 화면의 값이고, 창이 짧으면 함께 낮아진다.
   * (실제 값은 src/index.css 의 --h-choice / --h-choice-compact)
   * - default: 180px — 선택지가 둘일 때. 글씨를 키우고도 자리가 남아 낮추지 않았다.
   * - compact: 138px — 선택지가 셋일 때. 세 장이 스크롤 없이 한 화면에 들어가게 한다.
   *
   * 질문이 56px, 라벨이 52px 로 커지면서 선택지가 셋인 질문만 148 -> 138px 로 낮췄다.
   * 여백을 먼저 내주고도 자리가 모자라면 카드 높이로 메운다. 글씨는 건드리지 않는다.
   * 낮춘 쪽도 라벨(64px) 위아래로 37px 씩 남아 최소 터치 높이 88px 을 넉넉히 넘어선다.
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
 * 무엇이 다른지는 음성 안내와 자막 바가 알려 드린다.
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
        'relative flex w-full items-center justify-center rounded-card border-[3px] px-4 text-center',
        size === 'compact' ? 'h-[var(--h-choice-compact)]' : 'h-[var(--h-choice)]',
        'transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        selected
          ? 'border-brand bg-brand-tint shadow-card-selected'
          : 'border-transparent bg-surface shadow-card',
      ].join(' ')}
    >
      {/* break-keep: 만에 하나 줄이 바뀌더라도 '매장에서 / 마시기' 처럼 낱말 단위로만 나뉘게 한다.
          카드 좌우 여백이 20px 이던 시절에는 360px 화면에서 '매장에서 마시기' 가 두 줄로 접혔다.
          글씨를 줄이는 대신 여백을 16px 로 좁혀(안쪽 폭 266 -> 274px) 한 줄을 지켰다.
          (지금 쓰는 라벨은 360px 화면에서도 전부 한 줄에 들어간다) */}
      <span className={['break-keep font-semibold text-ink', TITLE_CLASS[emphasis]].join(' ')}>
        {title}
      </span>

      {/* 체크는 카드 우상단에 절대 배치. 라벨은 세로 가운데라 서로 부딪히지 않는다. */}
      {selected && <CheckCircleIcon size={34} className="absolute right-5 top-5 text-brand" />}
    </button>
  )
}
