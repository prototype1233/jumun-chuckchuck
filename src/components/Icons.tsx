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

/**
 * 시원함 — 육각 눈결정.
 * 따뜻함(김 나는 컵)과 실루엣이 겹치지 않게 컵을 쓰지 않고 사방으로 뻗는 별 모양으로 그렸다.
 * 가지 하나를 그려 60도씩 여섯 번 돌려 쓴다.
 */
export function ColdIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 24 24)`}>
            <path d="M24 24V6" />
            {/* 가지는 끝이 아니라 중간에 달아야 옆 가지와 붙어 보이지 않는다 */}
            <path d="M19.5 10 24 14.5 28.5 10" />
          </g>
        ))}
      </g>
    </Svg>
  )
}

/** 따뜻함 — 김이 모락모락 나는 머그컵 */
export function HotIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 컵 */}
      <path
        d="M6 20h26v10c0 6-5 11-11 11h-4c-6 0-11-5-11-11V20Z"
        fill="currentColor"
      />
      {/* 손잡이 */}
      <path
        d="M34 23h2.5a7 7 0 0 1 0 14H34v-5.5h2.5a1.5 1.5 0 0 0 0-3H34V23Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* 수증기 — 컵 위로 완만하게 올라가는 곡선 세 줄 */}
      <g stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" opacity="0.55">
        <path d="M12 16c2.6-3-2.6-6 0-9" />
        <path d="M19 16c2.6-3-2.6-6 0-9" />
        <path d="M26 16c2.6-3-2.6-6 0-9" />
      </g>
    </Svg>
  )
}

/**
 * 달콤함 — 꿀단지.
 * 아래로 갈수록 불룩한 단지 + 넓적한 뚜껑.
 * 담백함(비스듬한 잎사귀)과 실루엣이 겹치지 않게 좌우 대칭에 밑이 무거운 형태로 그렸다.
 */
export function SweetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 뚜껑 꼭지 */}
      <rect x="21" y="4" width="6" height="5" rx="2" fill="currentColor" opacity="0.55" />
      {/* 뚜껑 */}
      <rect x="10" y="9" width="28" height="7" rx="3" fill="currentColor" opacity="0.55" />
      {/* 단지 */}
      <path
        d="M12 18h24c1.8 3.6 4 7 4 11.5C40 36.5 33 42 24 42S8 36.5 8 29.5C8 25 10.2 21.6 12 18Z"
        fill="currentColor"
      />
    </Svg>
  )
}

/** 담백함 — 잎사귀 한 장 (양 끝이 뾰족한 비스듬한 잎 + 짧은 줄기) */
export function PlainIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 얇으면 멀리서 안 보여서 폭을 넉넉하게 잡았다 */}
      <path d="M37 11C42 28 28 42 11 37 6 20 20 6 37 11Z" fill="currentColor" />
      <path
        d="M11 37 5 43"
        stroke="currentColor"
        strokeWidth="3.6"
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
