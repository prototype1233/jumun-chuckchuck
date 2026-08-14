import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTO_ADVANCE_MS } from '../constants'

/**
 * 카드를 누르면 선택 표시를 잠깐 보여 준 뒤 다음 화면으로 넘어가는 동작.
 *
 * 선택 화면(드실 곳, 질문 3개)이 모두 이 훅을 쓰기 때문에
 * 반응 속도와 중복 방지 규칙이 화면마다 어긋날 일이 없다.
 *
 * - 이동이 예약된 뒤 또 누르면 무시한다. 먼저 누른 것이 그대로 유지된다.
 *   (기다리는 동안 답이 바뀌거나 두 번 넘어가는 일을 막는다.)
 * - 화면을 벗어나면 예약된 이동을 반드시 정리한다.
 */
export function useAutoAdvance() {
  const navigate = useNavigate()
  const timerRef = useRef<number | null>(null)
  const advancingRef = useRef(false)

  /** 예약된 이동을 취소한다. (뒤로가기, 화면 이탈) */
  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    advancingRef.current = false
  }, [])

  useEffect(() => cancel, [cancel])

  /**
   * commit(답변 저장)을 실행하고 AUTO_ADVANCE_MS 뒤에 to 로 이동한다.
   * 이미 이동이 예약된 상태면 commit 도 하지 않고 그냥 무시한다.
   */
  const advance = useCallback(
    (to: string, commit: () => void) => {
      if (advancingRef.current) return
      advancingRef.current = true

      commit()

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        navigate(to)
      }, AUTO_ADVANCE_MS)
    },
    [navigate],
  )

  return { advance, cancel }
}
