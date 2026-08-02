import type { ReactNode } from 'react'
import { useOrder } from '../context/OrderContext'
import { BackIcon, SoundOffIcon, SoundOnIcon } from './Icons'
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
 * - 우측 상단: 소리 켜기/끄기
 * - 하단: 자막 바 고정
 * - 자동 타임아웃 없음. 화면은 사용자가 누를 때만 넘어간다.
 * 데스크톱에서는 가운데 정렬 + 좌우 여백이 생긴다.
 */
export default function ScreenLayout({
  onBack,
  backLabel = '뒤로가기',
  subtitle,
  children,
  footer,
}: ScreenLayoutProps) {
  const {
    state: { soundOn },
    toggleSound,
  } = useOrder()

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-bg">
      <header className="flex shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-touch items-center gap-2 rounded-2xl px-3 text-ink active:scale-[0.98]"
        >
          <BackIcon size={26} />
          <span className="text-[24px] font-semibold leading-none">{backLabel}</span>
        </button>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="flex h-touch items-center gap-2 rounded-2xl px-3 text-ink-sub active:scale-[0.98]"
        >
          {soundOn ? <SoundOnIcon size={26} /> : <SoundOffIcon size={26} />}
          <span className="text-sub font-semibold leading-none">
            {soundOn ? '소리 켬' : '소리 끔'}
          </span>
        </button>
      </header>

      {/* 390x844 기준으로는 스크롤이 생기지 않게 설계했다.
          더 작은 화면에서 내용이 잘리는 것보다는 낫기 때문에 넘칠 때만 스크롤을 허용한다. */}
      <main className="flex flex-1 animate-enter flex-col overflow-y-auto px-6 pt-4">{children}</main>

      {footer && <div className="shrink-0 px-6 pb-6 pt-4">{footer}</div>}

      <SubtitleBar text={subtitle} />
    </div>
  )
}
