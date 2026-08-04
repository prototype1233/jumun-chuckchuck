import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 말소리 알아듣기 (Web Speech API — SpeechRecognition, ko-KR)
 *
 * 타입 정의가 아직 표준 DOM 타입에 들어 있지 않아 쓰는 만큼만 여기에 적어 둔다.
 */
interface RecognitionAlternative {
  transcript: string
}

interface RecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  [index: number]: RecognitionAlternative
}

interface RecognitionEvent {
  readonly resultIndex: number
  readonly results: { readonly length: number; [index: number]: RecognitionResult }
}

interface RecognitionErrorEvent {
  readonly error: string
}

interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type RecognitionCtor = new () => Recognition

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * 이 브라우저가 말소리를 알아들을 수 있는지.
 * 안 되는 브라우저에서는 [말로 주문하기] 버튼 자체를 감춘다.
 * 없는 기능을 눌러 보고 실패하시면 더 혼란스럽기 때문이다.
 */
export function isVoiceInputSupported(): boolean {
  return getCtor() !== null
}

interface VoiceInputHandlers {
  /** 다 말씀하셨을 때. 알아들은 후보를 그럴듯한 순서로 넘긴다. */
  onFinal: (alternatives: string[]) => void
  /** 마이크를 쓸 수 없을 때 (권한 거부 등) */
  onDenied: () => void
  /** 아무 말씀도 못 알아들은 채 끝났을 때 */
  onSilence: () => void
}

/**
 * 마이크를 켜고 말씀을 받아 적는다.
 *
 * 고령자 배려로 정한 것들:
 *  - continuous: false — 한 번 말씀하시면 거기서 끊는다. 말씀 중간에 잘리지 않는다.
 *  - interimResults: true — 알아듣는 중간 과정을 화면에 보여 드려 지금 듣고 있음을 알린다.
 *  - maxAlternatives: 3 — 발음이 흐리셔도 후보를 여러 개 받아 두고 그중에서 메뉴를 찾는다.
 *
 * 화면을 벗어나면 반드시 마이크를 놓는다. (아래 useEffect 정리 함수)
 */
export function useVoiceInput(handlers: VoiceInputHandlers) {
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)

  const recognitionRef = useRef<Recognition | null>(null)
  // 콜백이 바뀌어도 인식기를 다시 만들지 않도록 최신 값만 들고 있는다.
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers
  /** 결과를 받았는지. 못 받고 끝나면 '못 알아들었다' 로 본다. */
  const gotResultRef = useRef(false)

  const stop = useCallback(() => {
    const recognition = recognitionRef.current
    recognitionRef.current = null
    setListening(false)
    if (!recognition) return
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    try {
      recognition.abort()
    } catch {
      // 이미 끝난 경우. 무시해도 된다.
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) {
      handlersRef.current.onDenied()
      return
    }

    stop()
    setInterim('')
    gotResultRef.current = false

    let recognition: Recognition
    try {
      recognition = new Ctor()
    } catch {
      handlersRef.current.onDenied()
      return
    }

    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const alternatives: string[] = []
          for (let a = 0; a < result.length; a++) alternatives.push(result[a].transcript)
          gotResultRef.current = true
          setInterim(alternatives[0] ?? '')
          handlersRef.current.onFinal(alternatives)
          return
        }
        text += result[0]?.transcript ?? ''
      }
      // 아직 말씀하시는 중 — 지금까지 알아들은 만큼만 보여 드린다.
      if (text) setInterim(text)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        gotResultRef.current = true // onend 에서 또 처리하지 않게 표시해 둔다
        setListening(false)
        handlersRef.current.onDenied()
      }
      // 'no-speech' 같은 나머지는 onend 에서 한 번에 처리한다.
    }

    recognition.onend = () => {
      setListening(false)
      if (!gotResultRef.current) handlersRef.current.onSilence()
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setListening(true)
    } catch {
      handlersRef.current.onDenied()
    }
  }, [stop])

  // 화면을 벗어나면 마이크를 반드시 놓는다.
  useEffect(() => stop, [stop])

  return { start, stop, interim, listening }
}
