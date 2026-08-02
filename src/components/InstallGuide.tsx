import { useEffect, useState } from 'react'
import Button from './Button'

/** 한 번 닫으면 다시 띄우지 않기 위한 표시 */
const CLOSED_KEY = 'jcc.installGuideClosed'

/** 안드로이드 크롬이 설치 가능 시점에 보내 주는 이벤트 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** 이미 홈 화면 앱으로 실행 중인지 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone
}

function readClosed(): boolean {
  try {
    return window.localStorage.getItem(CLOSED_KEY) === 'yes'
  } catch {
    return false
  }
}

function writeClosed(): void {
  try {
    window.localStorage.setItem(CLOSED_KEY, 'yes')
  } catch {
    // 저장 실패는 무시 — 안내가 다시 보일 뿐 기능에는 영향이 없다.
  }
}

/** 아이폰·아이패드인지 (아이패드는 맥으로 위장하므로 터치 지원 여부까지 본다) */
function isIos(): boolean {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return true
  return /macintosh/i.test(ua) && navigator.maxTouchPoints > 1
}

/**
 * 아이폰에서 사파리로 열었는지.
 * 아이폰의 다른 브라우저(크롬·카카오톡 인앱 등)는 '홈 화면에 추가'를 지원하지 않는다.
 */
function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const otherBrowser =
    /crios|fxios|edgios|opios|whale|naver|kakaotalk|line|fban|fbav|instagram|daumapps/i
  return /safari/i.test(ua) && !otherBrowser.test(ua)
}

type Mode = 'none' | 'android' | 'ios-safari' | 'ios-other'

/**
 * 홈 화면에 앱을 두는 방법 안내.
 *
 * 배너나 팝업으로 띄우지 않는다. 시작 화면 안에 그냥 놓여 있고,
 * [괜찮아요] 로 한 번 닫으면 다시 나타나지 않는다.
 * 이미 홈 화면 앱으로 실행 중이면 아무것도 보여 주지 않는다.
 */
export default function InstallGuide() {
  const [mode, setMode] = useState<Mode>('none')
  const [closed, setClosed] = useState(true)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone() || readClosed()) return

    setClosed(false)

    if (isIos()) {
      setMode(isIosSafari() ? 'ios-safari' : 'ios-other')
      return
    }

    // 안드로이드 크롬은 설치가 가능해질 때 이 이벤트를 보낸다.
    const onPrompt = (event: Event) => {
      event.preventDefault() // 브라우저 기본 배너를 막고 우리 버튼으로 대신한다
      setPrompt(event as BeforeInstallPromptEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // 설치가 끝나면 안내를 걷는다.
    const onInstalled = () => setMode('none')
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const close = () => {
    writeClosed()
    setClosed(true)
  }

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setMode('none')
    setPrompt(null)
  }

  if (closed || mode === 'none') return null

  return (
    <div className="mb-5 rounded-card bg-surface p-5 shadow-card">
      {mode === 'android' && (
        <>
          <p className="mb-4 break-keep text-amount font-semibold text-ink">
            홈 화면에 두면 다음부터 바로 열 수 있어요
          </p>
          <Button variant="outline" onClick={install}>
            홈 화면에 두기
          </Button>
        </>
      )}

      {mode === 'ios-safari' && (
        <>
          <p className="mb-4 break-keep text-amount font-semibold text-ink">
            홈 화면에 두는 방법이에요
          </p>

          <ol className="flex flex-col gap-4">
            <li className="flex items-center gap-3">
              <ShareIcon />
              <span className="break-keep text-amount font-medium text-ink">
                ① 아래 공유 버튼을 누르세요
              </span>
            </li>
            <li className="flex items-center gap-3">
              <PlusBoxIcon />
              <span className="break-keep text-amount font-medium text-ink">
                ② 홈 화면에 추가를 누르세요
              </span>
            </li>
          </ol>
        </>
      )}

      {mode === 'ios-other' && (
        <p className="break-keep text-amount font-semibold text-ink">
          사파리로 열어야 홈 화면에 추가할 수 있어요
        </p>
      )}

      <button
        type="button"
        onClick={close}
        className="mt-4 h-touch w-full rounded-2xl text-body font-semibold text-ink-sub active:scale-[0.99]"
      >
        괜찮아요
      </button>
    </div>
  )
}

/** 아이폰 공유 버튼 모양 — 상자 위로 화살표가 나가는 그림 */
function ShareIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      role="img"
      aria-label="공유 버튼"
      className="shrink-0"
    >
      <rect width="44" height="44" rx="12" fill="#EFF4FF" />
      <g fill="none" stroke="#2563EB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {/* 아래 상자 */}
        <path d="M14 21v11h16V21" />
        {/* 위로 나가는 화살표 */}
        <path d="M22 25V11" />
        <path d="M17 16l5-5 5 5" />
      </g>
    </svg>
  )
}

/** '홈 화면에 추가' 항목 모양 — 네모 안의 더하기 */
function PlusBoxIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      role="img"
      aria-label="홈 화면에 추가"
      className="shrink-0"
    >
      <rect width="44" height="44" rx="12" fill="#EFF4FF" />
      <g fill="none" stroke="#2563EB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="12" width="20" height="20" rx="5" />
        <path d="M22 17v10M17 22h10" />
      </g>
    </svg>
  )
}
