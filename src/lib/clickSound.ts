/**
 * 버튼 터치음.
 *
 * 어르신이 '눌렸다' 를 눈뿐 아니라 귀로도 확인하실 수 있게, 누르는 순간
 * 아주 짧은 '똑' 소리를 낸다.
 *
 * - 음원 파일을 두지 않는다. Web Audio API 로 800Hz 사인파 80ms 를 그때그때 만든다.
 *   (파일이 늦게 받아지거나 없어서 소리가 안 나는 일이 생기지 않는다)
 * - 볼륨은 아주 작게(0.06) 둔다. 이 소리가 음성 안내를 덮으면 안 되기 때문이다.
 * - 소리를 낼 수 없는 기기에서는 조용히 아무것도 하지 않는다. 앱은 그대로 동작한다.
 */

/** 톤 높이 — 너무 높으면 귀에 거슬리고, 너무 낮으면 진동처럼 들려 800Hz 로 둔다. */
const FREQUENCY_HZ = 800
/** 톤 길이 — '눌렸다' 만 알리면 되므로 아주 짧게 */
const DURATION_MS = 80
/** 최대 볼륨 — 음성 안내와 겹쳐도 안내가 묻히지 않는 크기 */
const PEAK_GAIN = 0.06
/** 소리가 '툭' 끊기며 잡음이 생기지 않도록 앞뒤로 두는 여림/줄임 시간(초) */
const ATTACK_S = 0.008

type AudioContextCtor = typeof AudioContext

let context: AudioContext | null = null
/** 이 기기에서는 소리를 낼 수 없다고 판단한 뒤에는 다시 시도하지 않는다. */
let unavailable = false

function getContext(): AudioContext | null {
  if (unavailable || typeof window === 'undefined') return null
  if (context) return context

  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  if (!Ctor) {
    unavailable = true
    return null
  }

  try {
    context = new Ctor()
  } catch {
    unavailable = true
    return null
  }
  return context
}

/**
 * 첫 터치에서 불러 소리 잠금을 풀어 둔다.
 * (브라우저는 사용자가 화면을 한 번 누르기 전에는 소리를 내지 못하게 막아 둔다)
 */
export function primeClickSound(): void {
  const audio = getContext()
  if (audio && audio.state === 'suspended') void audio.resume()
}

/** 짧은 클릭음 한 번. */
export function playClick(): void {
  const audio = getContext()
  if (!audio) return
  // 화면을 오래 켜 두면 브라우저가 잠재우기도 한다. 누를 때마다 깨워 둔다.
  if (audio.state === 'suspended') void audio.resume()

  try {
    const now = audio.currentTime
    const seconds = DURATION_MS / 1000

    const oscillator = audio.createOscillator()
    const gain = audio.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(FREQUENCY_HZ, now)

    // 0 에서 시작해 지수 곡선으로 오르내린다. 네모난 소리는 '탁' 하고 갈라진다.
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, now + ATTACK_S)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)

    oscillator.connect(gain)
    gain.connect(audio.destination)

    oscillator.start(now)
    oscillator.stop(now + seconds + 0.02)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  } catch {
    // 소리 하나 때문에 화면이 멈추면 안 된다. 조용히 넘어간다.
  }
}
