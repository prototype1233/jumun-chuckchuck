import { useCallback, useEffect, useRef } from 'react'
import { useOrder } from '../context/OrderContext'

/**
 * 음성 안내 (Web Speech API, ko-KR)
 * - 화면에 들어오면 질문 문장을 자동으로 읽어 준다.
 * - 소리를 끄면 즉시 중단한다.
 * - 아이폰 사파리는 사용자가 화면을 한 번 눌러야 소리를 낼 수 있어서,
 *   시작하기 버튼에서 primeSpeech() 로 미리 잠금을 풀어 둔다.
 */

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis ?? null
}

/** 한국어 목소리를 고른다. 없으면 브라우저 기본 목소리를 쓴다. */
function pickKoreanVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().startsWith('ko')) ?? null
}

/** 첫 사용자 터치에서 호출해 아이폰의 음성 재생 잠금을 푼다. */
export function primeSpeech(): void {
  const synth = getSynth()
  if (!synth) return
  try {
    const warmup = new SpeechSynthesisUtterance(' ')
    warmup.volume = 0
    warmup.lang = 'ko-KR'
    synth.speak(warmup)
    synth.cancel()
  } catch {
    // 음성 미지원 기기는 조용히 넘어간다.
  }
}

export function useSpeech() {
  const {
    state: { soundOn },
  } = useOrder()

  const cancel = useCallback(() => {
    const synth = getSynth()
    if (!synth) return
    synth.cancel()
  }, [])

  const speak = useCallback(
    (text: string) => {
      const synth = getSynth()
      if (!synth || !soundOn || !text) return
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 0.92 // 조금 느리게 — 알아듣기 쉽게
      utterance.pitch = 1
      const voice = pickKoreanVoice(synth)
      if (voice) utterance.voice = voice
      synth.speak(utterance)
    },
    [soundOn],
  )

  // 소리를 끄는 순간 읽던 문장을 즉시 멈춘다.
  useEffect(() => {
    if (!soundOn) cancel()
  }, [soundOn, cancel])

  return { speak, cancel, soundOn }
}

/**
 * 화면 진입 시 안내 문장을 자동으로 읽어 주는 훅.
 * 목소리 목록이 늦게 준비되는 브라우저를 위해 voiceschanged 이벤트도 한 번 기다린다.
 */
export function useScreenSpeech(text: string): void {
  const { speak, cancel, soundOn } = useSpeech()
  const spokenRef = useRef<string | null>(null)

  useEffect(() => {
    const synth = getSynth()
    if (!synth || !soundOn) {
      spokenRef.current = null
      return
    }
    // 같은 문장을 두 번 읽지 않는다.
    if (spokenRef.current === text) return

    let cancelled = false
    const run = () => {
      if (cancelled) return
      spokenRef.current = text
      speak(text)
    }

    if (synth.getVoices().length > 0) {
      // 화면 전환 애니메이션(200ms)이 끝난 뒤 읽기 시작한다.
      const timer = window.setTimeout(run, 250)
      return () => {
        cancelled = true
        window.clearTimeout(timer)
        cancel()
      }
    }

    const onVoices = () => window.setTimeout(run, 100)
    synth.addEventListener('voiceschanged', onVoices, { once: true })
    const fallbackTimer = window.setTimeout(run, 600)
    return () => {
      cancelled = true
      synth.removeEventListener('voiceschanged', onVoices)
      window.clearTimeout(fallbackTimer)
      cancel()
    }
  }, [text, soundOn, speak, cancel])
}
