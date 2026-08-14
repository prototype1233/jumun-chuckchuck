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

/** 머그컵 — 매장에서 마시기 */
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
 * 달콤함 — 꿀단지와 꿀을 뜨는 디퍼.
 *
 * 위는 가로로 누운 디퍼(왼쪽에 홈 파인 머리, 오른쪽으로 뻗은 손잡이),
 * 아래는 디퍼 머리 바로 밑에 놓인 단지다. 둘 사이는 띄워 두어야 한 덩어리로
 * 뭉쳐 보이지 않는다. 머리와 단지의 세로 중심선을 15.5 로 맞춰 두었고,
 * 왼쪽 아래(단지)로 쏠리는 무게는 오른쪽 위로 길게 뻗는 손잡이가 받아 준다.
 * 전체가 x 3.5~45.5, y 2~46 안에 들어와 사방 여백이 2~3.5 로 비슷하다.
 *
 * 머리의 홈과 단지의 무늬는 따로 그린 도형이 아니라 fill-rule="evenodd" 로
 * 뚫은 구멍이다. 단색 아이콘이라 바탕색을 덧칠할 수 없으니, 같은 색 위에
 * 무늬를 보이게 하려면 파내는 수밖에 없다.
 */
export function SweetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 디퍼 머리 — 원통 하나에 세로 홈 네 개를 파서 다섯 갈래로 만든다.
          홈은 폭 1.5, 갈래는 1.6 으로 비슷하게 두어야 줄무늬로 읽힌다. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3 2H20.7A1.8 1.8 0 0 1 22.5 3.8V9.2A1.8 1.8 0 0 1 20.7 11H10.3A1.8 1.8 0 0 1 8.5 9.2V3.8A1.8 1.8 0 0 1 10.3 2Z
           M10.1 4.05A0.75 0.75 0 0 1 11.6 4.05V8.95A0.75 0.75 0 0 1 10.1 8.95Z
           M13.2 4.05A0.75 0.75 0 0 1 14.7 4.05V8.95A0.75 0.75 0 0 1 13.2 8.95Z
           M16.3 4.05A0.75 0.75 0 0 1 17.8 4.05V8.95A0.75 0.75 0 0 1 16.3 8.95Z
           M19.4 4.05A0.75 0.75 0 0 1 20.9 4.05V8.95A0.75 0.75 0 0 1 19.4 8.95Z"
        fill="currentColor"
      />
      {/* 머리 아래 — 물결로 마감해 꿀이 묻어 있는 끝단이 된다 */}
      <path
        d="M9.8 14.2Q11.75 12.2 13.7 14.2Q15.65 12.2 17.6 14.2Q19.55 12.2 21.5 14.2L21.5 16.9L9.8 16.9Z"
        fill="currentColor"
      />
      {/* 손잡이 — 머리와 같은 높이(중심 6.5)로 오른쪽 끝까지 뻗는다 */}
      <rect x="24.5" y="4.4" width="21" height="4.2" rx="2.1" fill="currentColor" />

      {/* 단지 아가리의 림 — 몸통보다 넓게 튀어나온 가로 테두리 */}
      <rect x="4.5" y="18.4" width="22" height="3" rx="1.4" fill="currentColor" />
      {/* 단지 몸통 — 아래로 갈수록 벌어졌다가 바닥에서 둥글게 닫힌다.
          안쪽의 두 부분경로는 흘러내리는 꿀줄기와 점 무늬로, evenodd 라 구멍이 된다. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 21.4C4.6 25.5 3.5 29.8 3.5 33.5C3.5 40.4 8.9 46 15.5 46C22.1 46 27.5 40.4 27.5 33.5C27.5 29.8 26.4 25.5 24.5 21.4Z
           M12.95 22.6C12.95 25.2 15.45 25.6 15.45 27.6C15.45 29.6 12.95 30 12.95 32.6A1.15 1.15 0 0 1 10.65 32.6C10.65 30 13.15 29.6 13.15 27.6C13.15 25.6 10.65 25.2 10.65 22.6A1.15 1.15 0 0 1 12.95 22.6Z
           M7.7 37A1.8 1.8 0 1 0 11.3 37A1.8 1.8 0 1 0 7.7 37Z"
        fill="currentColor"
      />
    </Svg>
  )
}

/**
 * 연하게 — 물방울.
 * '물을 넉넉히 넣어 순하다' 를 글 없이 알린다.
 * 진하게(원두)와 실루엣이 겹치지 않게 위가 뾰족하고 아래가 둥근 형태로 그렸다.
 */
export function DropIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M24 5c9 11 14 17 14 23a14 14 0 0 1-28 0c0-6 5-12 14-23Z" fill="currentColor" />
    </Svg>
  )
}

/**
 * 진하게 — 커피 원두 한 알.
 * 가운데 골이 보여야 '원두' 로 읽히는데, 속을 채우면 골이 묻힌다.
 * 그래서 이 아이콘만 굵은 선으로 그린다. (선 굵기 4 — 멀리서도 보이게)
 */
export function BeanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(-40 24 24)"
      >
        <ellipse cx="24" cy="24" rx="12.5" ry="18" />
        <path d="M24 7c-5 5-5 10 0 15s5 12 0 17" />
      </g>
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
