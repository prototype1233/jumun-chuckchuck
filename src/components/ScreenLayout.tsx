import type { ReactNode } from 'react'
import { BackIcon } from './Icons'
import ScreenFrame from './ScreenFrame'
import SubtitleBar from './SubtitleBar'

interface ScreenLayoutProps {
  /** 좌측 상단 되돌아가기 동작 */
  onBack: () => void
  /** 되돌아가기 버튼 글씨 (기본 '뒤로가기') */
  backLabel?: string
  /** 하단 자막 바 문구 */
  subtitle: string
  /** 화면 본문 */
  children: ReactNode
  /** 자막 바 위에 놓이는 버튼 영역 (없으면 자리 차지도 하지 않는다) */
  footer?: ReactNode
}

/**
 * 모든 질문 화면의 공통 틀.
 * - 좌측 상단: 항상 큼직한 뒤로가기 (아이콘 + 글씨)
 * - 우측 상단: 비워 둔다. 음성 안내는 끄고 켤 수 없이 항상 켜져 있다.
 * - 하단: 자막 바 고정
 * - 자동 타임아웃 없음. 화면은 사용자가 누를 때만 넘어간다.
 * 데스크톱에서는 가로·세로 모두 가운데 정렬된다. (ScreenFrame 참고)
 *
 * 세로 여백과 글자 크기는 창 높이에 따라 함께 줄어든다. 값은 src/index.css 의 토큰이 정하고,
 * 휴대폰 세로 화면에서는 예전 값 그대로다.
 */
export default function ScreenLayout({
  onBack,
  backLabel = '뒤로가기',
  subtitle,
  children,
  footer,
}: ScreenLayoutProps) {
  return (
    <ScreenFrame>
      <header className="flex shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-touch items-center gap-2 rounded-2xl px-3 text-ink active:scale-[0.98]"
        >
          <BackIcon size={32} />
          {/* 24px -> 30px. 아이콘도 글씨에 맞춰 26 -> 32px 로 함께 키웠다. */}
          <span className="text-back font-semibold leading-none">{backLabel}</span>
        </button>
      </header>

      {/* 390x844(휴대폰) 기준으로도, 세로가 짧은 데스크톱 창에서도 스크롤이 생기지 않게
          여백과 글자가 함께 줄어든다. 그래도 모자랄 만큼 창이 짧을 때만 여기가 스크롤된다. */}
      <main className="flex min-h-0 flex-1 animate-enter flex-col overflow-y-auto px-6 pt-[var(--pad-screen-y)]">
        {children}
      </main>

      {footer && (
        <div className="shrink-0 px-6 pb-[var(--pad-footer-b)] pt-[var(--pad-screen-y)]">
          {footer}
        </div>
      )}

      <SubtitleBar text={subtitle} />
    </ScreenFrame>
  )
}
