interface SubtitleBarProps {
  /** 지금 화면에서 무엇을 하면 되는지 알려주는 한 문장 */
  text: string
  /**
   * 자막을 한 단계 작게 두고 바 높이도 함께 낮춘다. (26px -> 22px, 바 63px -> 47px)
   *
   * 카드에 자리를 더 내줘야 하는 두 화면에서만 켠다.
   *   - 선택지가 셋인 질문(커피 맛) — 카드가 한 장 더 들어간다
   *   - 추천 결과 — 사진을 카드 높이만큼 키우느라 16px 이 아쉽다
   * 다른 화면의 자막은 26px 그대로다.
   */
  compact?: boolean
}

/**
 * 하단 고정 자막 바.
 * 음성 안내를 듣지 못하는 상황에서도 같은 내용을 글로 읽을 수 있게 한다.
 */
export default function SubtitleBar({ text, compact = false }: SubtitleBarProps) {
  // 20px 로는 자막이 눈에 들어오지 않는다고 하셔서 26px 로 올렸다.
  // 위아래 여백은 창 높이에 따라 줄어들지만 글씨는 20px 아래로 내려가지 않는다.
  const padY = compact ? 'var(--pad-bar-y-sm)' : 'var(--pad-bar-y)'

  return (
    <div
      className="shrink-0 border-t border-line bg-surface px-6"
      style={{ paddingTop: padY, paddingBottom: `calc(env(safe-area-inset-bottom) + ${padY})` }}
    >
      <p
        className={[
          'text-center font-medium text-ink',
          compact ? 'text-subtitle-sm' : 'text-subtitle',
        ].join(' ')}
      >
        {text}
      </p>
    </div>
  )
}
