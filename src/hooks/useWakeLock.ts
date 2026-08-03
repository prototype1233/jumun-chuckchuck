import { useEffect } from 'react'

/**
 * 이 화면을 보고 있는 동안 화면이 저절로 꺼지지 않게 붙잡아 둔다. (Screen Wake Lock API)
 *
 * 바코드를 스캐너에 대는 데에는 시간이 걸린다. 그 사이 화면이 꺼지면
 * 어르신은 주문이 날아간 줄 알고 당황하신다. 그래서 바코드가 떠 있는 동안만 화면을 붙잡아 둔다.
 *
 * 반드시 이 화면에서만 걸고, 화면을 벗어나면 놓아 준다. (useEffect 정리 함수)
 * 놓아 주지 않으면 다른 화면에서도, 심지어 앱을 덮어 둔 뒤에도 화면이 켜진 채로 남아
 * 배터리가 빨리 닳는다.
 *
 * ※ 화면 '밝기'를 올리는 표준 웹 API 는 없다. 브라우저로 할 수 있는 것은
 *   화면을 켜 두는 것(wake lock)과, 바코드 둘레를 흰색으로 채워 대비를 최대로 만드는 것까지다.
 *
 * @param active 켜 둘지 여부. false 면 아무것도 하지 않는다.
 */
export function useWakeLock(active: boolean = true): void {
  useEffect(() => {
    if (!active) return

    // 지원하지 않는 브라우저(사파리 구버전 등)에서는 조용히 넘어간다.
    const wakeLock: WakeLock | undefined = navigator.wakeLock
    if (!wakeLock) return

    let sentinel: WakeLockSentinel | null = null
    let done = false

    const acquire = async () => {
      try {
        const next = await wakeLock.request('screen')
        if (done) {
          // 기다리는 사이에 화면을 벗어났다. 받자마자 놓아 준다.
          void next.release().catch(() => {})
          return
        }
        // 화면을 덮거나 다른 앱으로 가면 브라우저가 알아서 풀어 버린다. 그때를 기억해 둔다.
        next.addEventListener('release', () => {
          sentinel = null
        })
        sentinel = next
      } catch {
        // 절전 모드 등으로 거절될 수 있다. 화면이 꺼질 뿐 주문 자체에는 지장이 없다.
      }
    }

    // 다른 앱에 갔다 돌아오면 풀려 있으므로 다시 건다.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      done = true
      document.removeEventListener('visibilitychange', handleVisibility)
      void sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [active])
}
