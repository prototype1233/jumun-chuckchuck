/**
 * 아이콘 모음 — 전부 단색(currentColor) 필 아이콘.
 * 어르신이 멀리서도 형태를 알아볼 수 있도록 선을 두껍게, 형태를 단순하게 그렸다.
 *
 * 남아 있는 셋은 모두 '글자를 대신하는' 자리가 아니라 '글자에 곁들이는' 자리에 쓴다.
 *   BackIcon        — '뒤로가기' 글씨 옆
 *   CheckCircleIcon — 고르신 카드의 우상단 표시
 *   MicIcon         — 말로 주문하기 화면의 마이크
 *
 * 선택 카드(질문·드실 곳)에 쓰던 메뉴 아이콘 열 개는 걷어냈다.
 * 그림으로 짐작하시게 하는 것보다 라벨을 크게 키워 바로 읽히게 하는 쪽이 낫다는 피드백이다.
 * (지운 SVG 가 다시 필요하면 이 파일의 지난 커밋에서 그대로 꺼내 쓸 수 있다)
 */
interface IconProps {
  /** 아이콘 한 변의 크기(px) */
  size?: number
  className?: string
}

function Svg({ size = 64, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}

/** 선택 완료 체크 (원 안의 체크) */
export function CheckCircleIcon({ size = 32, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="currentColor" />
      <path
        d="M9.5 16.5 14 21l8.5-9"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 뒤로가기 화살표 */
export function BackIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M15 4 7 12l8 8"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 마이크 — 말로 주문하기 */
export function MicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 마이크 몸통 */}
      <rect x="18" y="5" width="12" height="23" rx="6" fill="currentColor" />
      {/* 받침 — 몸통보다 연하게 두어 마이크 모양이 먼저 보이게 한다 */}
      <path
        d="M14 22a10 10 0 0 0 20 0"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M24 32v7M17 41h14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Svg>
  )
}
