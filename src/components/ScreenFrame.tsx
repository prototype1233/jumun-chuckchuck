import type { ReactNode } from 'react'

interface ScreenFrameProps {
  /** 틀 안쪽에 덧붙일 클래스 (좌우 여백 · 등장 애니메이션 등) */
  className?: string
  children: ReactNode
}

/**
 * 모든 화면이 놓이는 틀.
 *
 * 이 앱은 휴대폰 세로 화면(최대 430px 폭) 하나로 만들어졌다.
 * 데스크톱 브라우저에서는 그 틀을 화면 한가운데 놓고, 남는 자리는 배경으로 둔다.
 *  - 가로: 예전부터 mx-auto 로 가운데였다.
 *  - 세로: 창이 아주 길면 틀이 세로로 늘어나 버려서 상한(--frame-h)을 두고 가운데 정렬한다.
 *    휴대폰에서는 --frame-h 가 100dvh 그대로라 지금과 똑같이 화면을 꽉 채운다.
 *
 * 틀 높이는 어떤 경우에도 창을 넘지 않는다(max-h-[100vh]). 안쪽에서 넘치는 것은
 * 각 화면이 알아서 줄이고, 그래도 모자랄 때만 본문 영역이 스크롤된다.
 */
export default function ScreenFrame({ className = '', children }: ScreenFrameProps) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-bg">
      <div
        className={`flex h-[var(--frame-h)] max-h-[100vh] w-full max-w-[430px] flex-col bg-bg ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
