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
 * 달콤함 — 꿀단지와 디퍼.
 *
 * 덩어리 세 개(단지 / 디퍼 / 꿀줄기)만으로 그렸다. 앞선 버전들은 홈과 무늬를
 * 잘게 넣다가 멀리서 형태가 뭉개졌으므로, 여기서는 얇은 선을 아예 쓰지 않고
 * 최소 두께를 2 이상으로 잡았다.
 *
 * 배치의 핵심은 디퍼 머리 아래(y 20.5)와 단지 림 위(y 22) 사이의 1.5 여백이다.
 * 두 물체는 x 로는 겹치지만 이 띠 덕분에 서로 다른 물건으로 읽힌다. 겹친 채로
 * 붙여 놓으면 단색 필이라 한 덩어리가 되어 버린다.
 *
 * 디퍼는 축을 세로로 눕힌 채 그리고 rotate 로 한 번에 기울인다. 홈이 손잡이와
 * 직각으로 붙어야 디퍼로 읽히는데, 회전 전 좌표에서는 홈이 그냥 가로줄이라
 * 계산이 단순해진다.
 *
 * 각도가 38° 인 것은 타협이다. 45° 로 세우면 같은 세로 폭을 손잡이가 더 많이
 * 먹어서 — 세로 소모는 길이 × sin(각도) 다 — 손잡이가 머리에 붙은 혹처럼
 * 짧아진다. 단지를 건드리지 않고(= 머리를 림 아래로 내리지 않고) 손잡이
 * 길이를 지키는 선이 38° 였다.
 *
 * 머리의 홈 세 줄은 fill-rule="evenodd" 로 뚫은 구멍이다. 단색이라 바탕색을
 * 덧칠할 수 없으니 파내는 수밖에 없다. 구멍은 머리 타원 안쪽에 완전히 들어가야
 * 한다. 밖으로 삐져나가면 그 부분은 교차 횟수가 1 이 되어 오히려 칠해지고,
 * 머리 옆에 혹이 붙어 버린다. 손잡이가 파고드는 자리(회전 전 y 7.16 위)도
 * 피해야 손잡이가 홈에 잘려 두 동강 난다.
 *
 * 손잡이는 머리 끝에 살짝 걸치지 말고 2.4 쯤 깊이 박아야 한다. 얕게 붙이면
 * 머리가 좁아지는 지점에서 만나 이음매가 계단처럼 꺾여 보인다.
 *
 * 꿀은 몸통 옆을 나란히 훑고 내려가면 안 된다. 그러면 몸통과 꿀 사이 배경이
 * 손잡이 구멍처럼 닫혀 보여서 단지가 주전자가 되어 버린다. 그래서 아가리에서
 * 바깥으로 크게 벌어지며 떨어지고, 끝은 방울로 뭉쳐 시선을 단지 밖으로 뺀다.
 *
 * 전체가 x 2~43.5, y 1.8~46 안에 들어온다.
 */
export function SweetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* 디퍼 — 축을 세로로 세워 그린 뒤 통째로 38° 로 눕힌다(rotate 52 = 90-38) */}
      <g transform="rotate(52 30.4 12.66)">
        {/* 손잡이 — 폭 5.6 으로 단지 테두리(5.4)와 비슷한 두께.
            아래 끝은 머리 속(y 7.16)까지 밀어 넣어 이음매를 없앤다 */}
        <rect x="27.6" y="-3.23" width="5.6" height="10.39" rx="2.8" fill="currentColor" />
        {/* 머리 — 폭 15.6 짜리 타원(손잡이의 2.8 배)에 굵은 홈 세 줄.
            홈 두께 2.4, 사이 간격 1.6 — 작게 줄여도 뭉개지지 않는 최소치다 */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.4 4.76A7.8 7.9 0 1 0 30.4 20.56A7.8 7.9 0 1 0 30.4 4.76Z
             M26.39 8.16H34.41A1.2 1.2 0 0 1 34.41 10.56H26.39A1.2 1.2 0 0 1 26.39 8.16Z
             M25.23 12.16H35.57A1.2 1.2 0 0 1 35.57 14.56H25.23A1.2 1.2 0 0 1 25.23 12.16Z
             M27.61 16.16H33.19A1.2 1.2 0 0 1 33.19 18.56H27.61A1.2 1.2 0 0 1 27.61 16.16Z"
          fill="currentColor"
        />
      </g>

      {/* 단지 아가리 — 넓적한 테두리 한 줄. 몸통 목(폭 20)보다 넓게 걸친다 */}
      <rect x="2" y="22" width="27.6" height="5.4" rx="2.2" fill="currentColor" />
      {/* 단지 몸통 — 목에서 아래로 벌어졌다가 바닥에서 둥글게 닫힌다. 무늬 없음 */}
      <path
        d="M5.5 26.8C4 30.6 3 34.6 3 37.8C3 42.4 6.6 46 11 46H20C24.4 46 28 42.4 28 37.8C28 34.6 27 30.6 25.5 26.8Z"
        fill="currentColor"
      />
      {/* 꿀 — 아가리 오른쪽에서 흘러내리는 덩어리 하나.
          위쪽 끝은 림 안(y 25)에서 시작해 아가리에서 배어 나온 것처럼 보인다 */}
      <path
        d="M26.1 25C27 29.4 29.2 31.6 31.4 35.8A2.4 2.4 0 0 0 35.6 33.6C33.6 29.6 31.6 27.8 29.9 25Z"
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
