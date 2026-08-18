import Button from './Button'

interface OfflineNoticeProps {
  /** 다시 시도 */
  onRetry: () => void
  /** 주문을 그만두고 돌아가기 */
  onBack: () => void
}

/**
 * 인터넷이 끊긴 채로 주문을 넣으려 할 때 보여 주는 화면.
 *
 * 작은 토스트나 배너로는 놓치기 쉬워서, 화면을 통째로 덮고 큰 글씨로 알린다.
 * 어르신이 '내가 뭘 잘못했나' 하고 놀라지 않도록 문장을 짧고 담담하게 썼다.
 */
export default function OfflineNotice({ onRetry, onBack }: OfflineNoticeProps) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] animate-enter flex-col bg-bg px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <NoSignalIcon />

        <h1 className="mt-8 break-keep text-screen-title font-bold text-ink">
          인터넷 연결을 확인해 주세요
        </h1>
        <p className="mt-4 break-keep text-body font-medium text-ink-sub">
          연결이 끊겨 있어 주문을 넣지 못했어요.
          <br />
          담아 두신 음료는 그대로 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <Button variant="outline" onClick={onBack}>
          담은 음료 보기
        </Button>
        <Button onClick={onRetry}>다시 해볼게요</Button>
      </div>
    </div>
  )
}

/** 끊긴 연결 표시 — 안테나에 사선을 그은 모양 */
function NoSignalIcon() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="연결 끊김">
      <g
        fill="none"
        stroke="#5B6B84"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 40a48 48 0 0 1 68 0" />
        <path d="M28 55a28 28 0 0 1 40 0" />
        <circle cx="48" cy="72" r="4" fill="#5B6B84" stroke="none" />
      </g>
      <path
        d="M20 20 76 76"
        stroke="#16233D"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
