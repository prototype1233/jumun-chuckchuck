import { SPEECH_PITCH, SPEECH_RATE, SPEECH_VOLUME } from '../constants'
import type { Menu } from '../types'

/**
 * 음성 안내의 재료 — 목소리 고르기, 읽을 문장 다듬기, 금액을 우리말로 바꾸기.
 *
 * React 와 상관없는 부분만 여기에 모은다.
 * 화면에서 쓰는 훅(useSpeech / useScreenSpeech)은 hooks/useSpeech.ts 에 있다.
 */

declare global {
  interface Window {
    /**
     * 개발용 — 콘솔에서 이 기기가 가진 한국어 목소리와 지금 고른 목소리를 확인한다.
     * 기기마다 목소리가 달라서, 어떤 기기에서 기계 소리가 난다는 제보를 받았을 때
     * 그 기기 콘솔에서 이것부터 확인한다.
     */
    __listVoices?: () => SpeechSynthesisVoice[]
  }
}

export function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis ?? null
}

/** ko-KR / ko_KR / ko 를 모두 한국어로 본다. */
function isKorean(voice: SpeechSynthesisVoice): boolean {
  return voice.lang?.toLowerCase().replace('_', '-').startsWith('ko') ?? false
}

/**
 * 한국어 목소리 순위 — 값이 클수록 먼저 쓴다.
 *
 * 같은 문장이라도 목소리에 따라 사람 목소리처럼도, 기계 소리처럼도 들린다.
 *   3) Google 계열  — 안드로이드·크롬. 지금까지 들어본 중 가장 사람 목소리에 가깝다.
 *   2) Microsoft 계열 — 윈도우. 자연스러운 편이다.
 *   1) 그 밖의 시스템 기본 (아이폰의 'Yuna' 등)
 * 어느 것도 없으면 브라우저가 알아서 고르게 둔다.
 */
function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  if (name.includes('google')) return 3
  if (name.includes('microsoft')) return 2
  return 1
}

/** 이 기기가 가진 한국어 목소리 목록 (순위가 높은 것부터) */
function koreanVoices(): SpeechSynthesisVoice[] {
  const synth = getSynth()
  if (!synth) return []
  return synth
    .getVoices()
    .filter(isKorean)
    .sort((a, b) => voiceScore(b) - voiceScore(a))
}

/**
 * 고른 목소리를 기억해 둔다. 문장마다 목록을 훑고 정렬할 이유가 없어서다.
 * 목록이 늦게 채워지는 브라우저가 있으므로 voiceschanged 가 오면 다시 고른다.
 */
let cachedVoice: SpeechSynthesisVoice | null = null
let voicesDirty = true

/**
 * 읽어 줄 한국어 목소리. 한국어 목소리가 없으면 null 을 돌려주고,
 * 그때는 브라우저 기본 목소리가 lang='ko-KR' 만 보고 읽는다.
 */
export function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (!voicesDirty) return cachedVoice
  const voices = koreanVoices()
  // 목록이 아직 안 왔을 뿐일 수 있다. 이때는 기억해 두지 않고 다음 문장에서 다시 고른다.
  if (voices.length === 0) return null
  cachedVoice = voices[0]
  voicesDirty = false
  return cachedVoice
}

// 목소리 목록은 비동기로 채워진다. (크롬은 첫 호출에서 빈 배열을 돌려준다)
// 목록이 바뀔 때마다 다시 고르게 표시만 해 두고, 실제로 고르는 일은 읽을 때 한다.
const synth = getSynth()
if (synth) {
  synth.addEventListener('voiceschanged', () => {
    voicesDirty = true
  })
}

/**
 * 개발용 목소리 목록 보기. window.__listVoices() 로 부른다.
 * 콘솔에서 기기별로 어떤 목소리가 있고 그중 무엇이 골라졌는지 확인한다.
 */
export function listVoices(): SpeechSynthesisVoice[] {
  const s = getSynth()
  if (!s) {
    console.warn('이 기기는 음성 안내를 지원하지 않아요.')
    return []
  }
  const all = s.getVoices()
  const korean = koreanVoices()
  const selected = pickKoreanVoice()

  console.log(`전체 ${all.length}개 중 한국어 ${korean.length}개`)
  console.table(
    korean.map((voice) => ({
      이름: voice.name,
      언어: voice.lang,
      순위: voiceScore(voice),
      기기내장: voice.localService,
      선택됨: voice === selected,
    })),
  )
  console.log('지금 읽어 주는 목소리:', selected?.name ?? '(한국어 목소리 없음 — 브라우저 기본)')
  return korean
}

if (typeof window !== 'undefined') {
  window.__listVoices = listVoices
}

/** 정해 둔 목소리·속도로 읽을 문장 하나를 만든다. 읽는 소리는 모든 화면에서 똑같아야 한다. */
export function createUtterance(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = SPEECH_RATE
  utterance.pitch = SPEECH_PITCH
  utterance.volume = SPEECH_VOLUME
  const voice = pickKoreanVoice()
  if (voice) utterance.voice = voice
  return utterance
}

/**
 * 화면에 보이는 글자와 읽어 주는 문장을 따로 둔다.
 *
 * 화면 글씨는 짧아야 읽기 쉽고, 읽어 주는 말은 조금 더 친절해야 알아듣기 쉽다.
 * (예: 화면 '어디에서 드시겠어요?' / 소리 '어디에서 드시겠어요? 천천히 고르셔도 괜찮아요.')
 * speechText 를 따로 적어 두지 않았으면 화면 글씨를 그대로 읽는다.
 */
export function speechOf(screenText: string, speechText?: string): string {
  return speechText?.trim() || screenText
}

/** 메뉴 이름을 읽어 줄 문장. 읽기 어려운 이름만 menus.ts 에 speechText 를 따로 적어 둔다. */
export function menuSpeech(menu: Menu): string {
  return speechOf(menu.name, menu.speechText)
}

/** 0~9 를 한자어 수로. 0 은 자리를 읽지 않으므로 빈 칸으로 둔다. */
const SINO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** 천·백·십 자리 (만 미만) 를 우리말 덩어리로 끊어 읽는다. */
function readUnderTenThousand(value: number): string[] {
  const units: [number, string][] = [
    [1000, '천'],
    [100, '백'],
    [10, '십'],
  ]
  const parts: string[] = []
  let rest = value

  for (const [unitValue, unitName] of units) {
    const digit = Math.floor(rest / unitValue)
    // 0인 자리는 아예 읽지 않는다. (5000 -> '오천', '오천 영백' 이 아니다)
    // 1은 숫자를 붙이지 않는다. (1000 -> '일천' 이 아니라 '천')
    if (digit > 0) parts.push(digit === 1 ? unitName : `${SINO[digit]}${unitName}`)
    rest %= unitValue
  }
  if (rest > 0) parts.push(SINO[rest])

  return parts
}

/**
 * 금액을 읽어 줄 우리말로 바꾼다.
 *
 *   priceToKorean(4900)  -> '사천 구백원'
 *   priceToKorean(3600)  -> '삼천 육백원'
 *   priceToKorean(5000)  -> '오천원'
 *   priceToKorean(10000) -> '만원'
 *
 * '4,900원' 을 그대로 넘기면 읽어 주는 목소리가 '사 쉼표 구백원' 처럼
 * 숫자를 하나씩 끊어 읽어서 알아듣기 어렵다.
 *
 * 이 앱의 금액은 몇 만원을 넘지 않으므로 만 단위까지만 다룬다.
 * (그 위로 넘어가도 '십이만 삼천원' 처럼 이어서 읽히기는 한다)
 */
export function priceToKorean(price: number): string {
  const amount = Math.max(0, Math.round(price))
  if (amount === 0) return '영원'

  const tenThousands = Math.floor(amount / 10000)
  const rest = amount % 10000
  const parts: string[] = []

  // 10000 은 '일만' 이 아니라 '만' 이다.
  if (tenThousands === 1) parts.push('만')
  // '십이만' 처럼 만 앞자리는 붙여 읽는다. 사이를 띄우는 것은 만·천·백 덩어리 사이뿐이다.
  else if (tenThousands > 1) parts.push(`${readUnderTenThousand(tenThousands).join('')}만`)

  parts.push(...readUnderTenThousand(rest))

  return `${parts.join(' ')}원`
}
