import { useEffect, useState } from 'react'

/**
 * 인터넷이 연결되어 있는지.
 *
 * 앱을 둘러보는 데는 인터넷이 필요 없다(서비스 워커가 미리 받아 둔다).
 * 주문을 넣는 마지막 단계에서만 이 값을 본다.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return online
}
