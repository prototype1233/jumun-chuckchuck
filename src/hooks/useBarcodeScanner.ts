import { useEffect, useRef, useState } from 'react'
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  type Result,
} from '@zxing/library'

/**
 * 웹캠으로 CODE128 바코드를 읽는다. (키오스크 시연 화면 전용)
 *
 * ── 여기서 가장 중요한 것 ──────────────────────────────────────
 * 잘 읽는 것보다 '못 읽어도 시연이 멈추지 않는 것' 이 먼저다.
 * 카메라가 없든, 권한을 거절당하든, 심사장 조명이 어떻든
 * 이 훅은 상태만 알려 주고 조용히 물러난다. 키패드로 계속 진행할 수 있어야 한다.
 * 그래서 어떤 실패도 예외를 밖으로 던지지 않는다.
 */

export type ScannerStatus =
  /** 아직 시작하지 않음 */
  | 'idle'
  /** 카메라를 켜고 권한을 여쭙는 중 */
  | 'starting'
  /** 화면을 비추며 읽는 중 */
  | 'scanning'
  /** 권한이 거절됐거나 쓸 수 있는 카메라가 없음 — 키패드로만 진행한다 */
  | 'unavailable'

interface Options {
  /** 켤지 말지. 주문 확인 뒤에는 꺼서 카메라 불이 켜진 채로 남지 않게 한다. */
  enabled: boolean
  /** 바코드를 읽었을 때. 우리 주문인지 아닌지는 부르는 쪽에서 판단한다. */
  onScan: (value: string) => void
}

/** 같은 바코드를 계속 비추고 있을 때 몇 번이고 다시 부르지 않도록 두는 시간 */
const REPEAT_GUARD_MS = 2500

export function useBarcodeScanner({ enabled, onScan }: Options) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<ScannerStatus>('idle')

  // 콜백이 바뀌어도 카메라를 다시 켜지 않도록 최신 값만 들고 있는다.
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  /** 방금 읽은 값과 시각 — 같은 화면을 계속 비출 때 중복 처리를 막는다. */
  const lastRef = useRef<{ value: string; at: number }>({ value: '', at: 0 })

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }

    const video = videoRef.current
    if (!video || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }

    // CODE128 만 찾게 못 박아 둔다. 형식을 좁힐수록 빨리, 더 정확히 읽는다.
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128])
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints)
    let stopped = false

    setStatus('starting')

    reader
      // null = 브라우저가 알아서 카메라를 고른다. (노트북은 대부분 앞 카메라 하나뿐이다)
      .decodeFromVideoDevice(null, video, (result: Result | undefined) => {
        if (stopped || !result) return

        const value = result.getText()
        const now = Date.now()
        const last = lastRef.current
        if (last.value === value && now - last.at < REPEAT_GUARD_MS) return
        lastRef.current = { value, at: now }

        onScanRef.current(value)
      })
      .then(() => {
        if (!stopped) setStatus('scanning')
      })
      .catch(() => {
        // 권한 거절, 카메라 없음, https 가 아님 등. 이유를 나눠 봐야 할 일이 같다.
        if (!stopped) setStatus('unavailable')
      })

    return () => {
      stopped = true
      try {
        reader.reset() // 카메라를 놓는다. 이걸 빼먹으면 불이 켜진 채로 남는다.
      } catch {
        // 이미 꺼졌다.
      }
    }
  }, [enabled])

  return { videoRef, status }
}
