interface SubtitleBarProps {
  /** 지금 화면에서 무엇을 하면 되는지 알려주는 한 문장 */
  text: string
}

/**
 * 하단 고정 자막 바.
 * 음성 안내를 듣지 못하는 상황에서도 같은 내용을 글로 읽을 수 있게 한다.
 */
export default function SubtitleBar({ text }: SubtitleBarProps) {
  // 20px 로는 자막이 눈에 들어오지 않는다고 하셔서 26px 로 올렸다.
  // 위아래 여백은 창 높이에 따라 줄어들지만 글씨는 20px 아래로 내려가지 않는다.
  return (
    <div className="shrink-0 border-t border-line bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+var(--pad-bar-y))] pt-[var(--pad-bar-y)]">
      <p className="text-center text-subtitle font-medium text-ink">{text}</p>
    </div>
  )
}
