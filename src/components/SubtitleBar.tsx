interface SubtitleBarProps {
  /** 지금 화면에서 무엇을 하면 되는지 알려주는 한 문장 */
  text: string
}

/**
 * 하단 고정 자막 바.
 * 음성 안내를 듣지 못하는 상황에서도 같은 내용을 글로 읽을 수 있게 한다.
 */
export default function SubtitleBar({ text }: SubtitleBarProps) {
  return (
    <div className="shrink-0 border-t border-line bg-surface px-6 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[18px]">
      <p className="text-center text-body font-medium text-ink">{text}</p>
    </div>
  )
}
