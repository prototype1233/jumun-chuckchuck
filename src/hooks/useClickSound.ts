import { useEffect } from 'react'
import { playClick, primeClickSound } from '../lib/clickSound'

/** 소리를 내지 않을 요소에 붙이는 표시 (예: 소리가 방해되는 곳) */
const SKIP_ATTRIBUTE = 'data-no-click-sound'

/** 눌렀을 때 소리가 나야 하는 것들 — 선택 카드와 버튼은 전부 button 으로 만들어져 있다. */
const PRESSABLE = 'button, [role="button"], a'

/**
 * 앱 전체의 버튼 터치음.
 *
 * 화면마다 onClick 에 소리를 하나씩 끼워 넣으면 새 버튼을 만들 때 빠뜨리기 쉽다.
 * 그래서 문서 전체에서 누름을 한 번만 받아 처리한다. 화면이 몇 개가 되든,
 * 버튼을 새로 만들든 소리는 저절로 따라온다.
 *
 * click 이 아니라 pointerdown 에서 낸다. 손가락을 뗄 때가 아니라 대는 순간
 * 소리가 나야 '지금 눌렸다' 로 느껴지기 때문이다.
 */
export function useClickSound(): void {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const pressable = target.closest(PRESSABLE)
      if (!pressable) return
      // 눌러도 아무 일이 일어나지 않는 버튼에서 소리가 나면 더 헷갈린다.
      if (pressable instanceof HTMLButtonElement && pressable.disabled) return
      if (pressable.getAttribute('aria-disabled') === 'true') return
      if (pressable.hasAttribute(SKIP_ATTRIBUTE)) return

      playClick()
    }

    // 화면 아무 데나 처음 닿는 순간 소리 잠금을 풀어 둔다.
    // (버튼이 아닌 곳을 먼저 누르셨더라도 그 다음 버튼부터 바로 소리가 나게)
    const handleFirstTouch = () => primeClickSound()

    // capture 단계에서 받는다. 중간에서 이벤트를 멈추는 곳이 있어도 소리는 난다.
    document.addEventListener('pointerdown', handleFirstTouch, { capture: true, once: true })
    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', handleFirstTouch, true)
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [])
}
