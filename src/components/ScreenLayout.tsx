import type { ReactNode } from 'react'
import { BackIcon } from './Icons'
import ScreenFrame from './ScreenFrame'

interface ScreenLayoutProps {
  /** 좌측 상단 되돌아가기 동작 */
  onBack: () => void
  /** 되돌아가기 버튼 글씨 (기본 '뒤로가기') */
  backLabel?: string
  /**
   * 본문·버튼의 좌우 여백을 24px 에서 12px 로 좁힌다.
   * 추천 결과 화면에서만 켠다 — 카드가 화면 폭을 최대한 쓰게 하려는 것이다.
   * 12px 이 있어야 카드 그림자가 잘리지 않는다. (그림자가 좌우로 16px 번진다)
   */
  tightPadX?: boolean
  /** 화면 본문 */
  children: ReactNode
  /** 화면 맨 아래 버튼 영역 (없으면 자리 차지도 하지 않는다) */
  footer?: ReactNode
}

/**
 * 모든 질문 화면의 공통 틀.
 * - 좌측 상단: 항상 큼직한 뒤로가기 (아이콘 + 글씨)
 * - 우측 상단: 비워 둔다. 음성 안내는 끄고 켤 수 없이 항상 켜져 있다.
 * - 하단: 버튼이 있으면 버튼, 없으면 본문이 화면 아래까지 그대로 쓴다.
 *   예전에는 여기에 자막 바가 고정으로 붙어 있었다. 걷어내고 그 63px 을 카드 크기로 돌렸다.
 *   (음성 안내 자체는 그대로다 — hooks/useSpeech.ts)
 * - 자동 타임아웃 없음. 화면은 사용자가 누를 때만 넘어간다.
 * 데스크톱에서는 가로·세로 모두 가운데 정렬된다. (ScreenFrame 참고)
 *
 * 세로 여백과 글자 크기는 창 높이에 따라 함께 줄어든다. 값은 src/index.css 의 토큰이 정하고,
 * 휴대폰 세로 화면에서는 예전 값 그대로다.
 */
export default function ScreenLayout({
  onBack,
  backLabel = '뒤로가기',
  children,
  footer,
  tightPadX = false,
}: ScreenLayoutProps) {
  const padX = tightPadX ? 'px-3' : 'px-6'
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
      {/* 버튼이 없는 화면은 본문이 화면 맨 아래까지 간다. 그래서 아래 여백을 여기서 챙긴다.
          (버튼이 있으면 그 아래 칸이 대신 챙기므로 여기는 붙이지 않는다) */}
      <main
        className={[
          'flex min-h-0 flex-1 animate-enter flex-col overflow-y-auto',
          padX,
          'pt-[var(--pad-screen-y)]',
          footer ? '' : 'pb-[calc(env(safe-area-inset-bottom)+var(--pad-screen-y))]',
        ].join(' ')}
      >
        {children}
      </main>

      {footer && (
        <div
          className={`shrink-0 ${padX} pb-[calc(env(safe-area-inset-bottom)+var(--pad-footer-b))] pt-[var(--pad-screen-y)]`}
        >
          {footer}
        </div>
      )}
    </ScreenFrame>
  )
}
