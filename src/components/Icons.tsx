/**
 * 아이콘 모음 — 전부 단색(currentColor) 필 아이콘.
 * 어르신이 멀리서도 형태를 알아볼 수 있도록 선을 두껍게, 형태를 단순하게 그렸다.
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

/** 머그컵 — 매장에서 먹기 */
export function MugIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M8 13a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v13c0 6.6-5.4 12-12 12h-2c-6.6 0-12-5.4-12-12V13Z"
        fill="currentColor"
      />
      <path
        d="M36 16h2a7 7 0 0 1 0 14h-2v-5h2a2 2 0 0 0 0-4h-2v-5Z"
        fill="currentColor"
        opacity="0.55"
      />
    </Svg>
  )
}

/** 테이크아웃 컵 — 포장하기 */
export function TakeoutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M8 9h32a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M10 20h28l-2.7 18.6A4 4 0 0 1 31.3 42H16.7a4 4 0 0 1-4-3.4L10 20Z"
        fill="currentColor"
      />
    </Svg>
  )
}

/** 커피 */
export function CoffeeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M9 18h24v9c0 6.6-5.4 12-12 12s-12-5.4-12-12v-9Z"
        fill="currentColor"
      />
      <path
        d="M35 21h2a6 6 0 0 1 0 12h-2v-5h2a1 1 0 0 0 0-2h-2v-5Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M16 12c0-2 2-2 2-4M24 12c0-2 2-2 2-4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Svg>
  )
}

/** 음료 (빨대 꽂은 잔) */
export function DrinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M31 8h6l-4 12"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M12 15h24l-2.6 23.7a4 4 0 0 1-4 3.3H18.6a4 4 0 0 1-4-3.3L12 15Z"
        fill="currentColor"
      />
    </Svg>
  )
}

/** 시원함 */
export function ColdIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g stroke="currentColor" strokeWidth="3.6" strokeLinecap="round">
        <path d="M24 5v38M9 14l30 20M39 14 9 34" />
        <path d="M24 13l-5-4M24 13l5-4M24 35l-5 4M24 35l5 4" />
      </g>
    </Svg>
  )
}

/** 따뜻함 */
export function HotIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="26" r="11" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" opacity="0.55">
        <path d="M17 12c0-3 3-3 3-6M24 12c0-3 3-3 3-6M31 12c0-3 3-3 3-6" />
      </g>
    </Svg>
  )
}

/** 달콤함 (꿀 한 방울) */
export function SweetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 5c8 11 13 16.5 13 22.5C37 35.4 31.2 41 24 41S11 35.4 11 27.5C11 21.5 16 16 24 5Z"
        fill="currentColor"
      />
    </Svg>
  )
}

/** 담백함 (잎사귀) */
export function PlainIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M40 8c0 17-10.6 27-25 27h-5C10 18 20.6 8 35 8h5Z"
        fill="currentColor"
      />
      <path
        d="M8 42C12 30 20 22 32 16"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Svg>
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

/** 소리 켜짐 */
export function SoundOnIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 9h4l5-4v14l-5-4H4V9Z" fill="currentColor" />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19.5 6a9 9 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 소리 꺼짐 */
export function SoundOffIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 9h4l5-4v14l-5-4H4V9Z" fill="currentColor" />
      <path
        d="m16.5 9.5 5 5M21.5 9.5l-5 5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
