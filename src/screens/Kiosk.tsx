import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircleIcon } from '../components/Icons'
import { MENUS } from '../data/menus'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import { playClick } from '../lib/clickSound'
import { readStoredOrders, subscribeOrders, type KioskOrder } from '../lib/kioskChannel'
import { decodeOrderValue } from '../lib/orderCode'
import { cupsLabel, won } from '../logic/cart'

/**
 * 심사 시연용 매장 키오스크 시뮬레이터. (/kiosk)
 *
 * ── 이 화면이 무엇이고 무엇이 아닌가 ──────────────────────────
 * 실제 매장 키오스크와는 연결돼 있지 않다. 연결됐다면 어떻게 되는지를
 * 눈으로 보여 주기 위한 '흉내' 다. 그래서 화면 구석에 '시연용 화면' 을 늘 적어 둔다.
 * 심사위원이 이것을 실제 연동으로 오해하시면 안 된다.
 *
 * ── 주문이 건너오는 두 갈래 ───────────────────────────────────
 *   1) 바코드 — 폰 화면을 웹캠에 댄다. 값 자체에 주문이 들어 있어(lib/orderCode.ts)
 *      폰과 노트북이 서로 다른 기기여도 주문이 그대로 되살아난다. 현장 시연은 이 길이다.
 *   2) BroadcastChannel — 같은 브라우저의 다른 탭에서 주문했을 때. (lib/kioskChannel.ts)
 *      노트북 한 대로 시연할 때 편하다.
 *
 * ── 시연이 멈추지 않게 하려고 둔 것들 ─────────────────────────
 *   - 웹캠이 없거나 권한이 거절돼도 화면은 그대로 뜬다. 키패드로 진행한다.
 *   - 바코드를 못 읽으면 '번호를 눌러 주세요' 로 자연스럽게 넘어간다.
 *   - 번호로도 못 찾으면 시연용 예시 주문으로라도 끝까지 보여 준다.
 *     (다만 '시연용 예시' 라고 화면에 밝힌다. 없는 주문을 있는 척하지는 않는다)
 */

/** 가상 매장 이름. 실제 상호와 겹치지 않도록 지어낸 이름만 쓴다. */
const BRAND = '한빛커피'

/** 주문 확인 화면에 머무는 시간 — 이 뒤 결제 안내로 넘어간다 */
const CONFIRM_MS = 3000
/** 결제 안내(카드를 넣어 주세요) 시간 */
const PAYMENT_MS = 3000
/** 결제 완료 화면에 머무는 시간 — 이 뒤 대기 화면으로 되돌아간다 */
const DONE_MS = 5000
/** 이만큼 읽히지 않으면 키패드 쪽으로 안내를 옮긴다 */
const SCAN_HINT_MS = 12000
/** 안내 쪽지가 저절로 사라지기까지 */
const NOTICE_MS = 3500

type Phase = 'idle' | 'confirm' | 'payment' | 'done'

/** 주문이 어디로 들어왔는지 — 화면에 그대로 밝힌다 */
type Source = '바코드' | '앱 연결' | '번호 입력' | '시연용 예시'

interface DisplayLine {
  name: string
  quantity: number
  /** 한 잔 값 */
  price: number
}

interface DisplayOrder {
  waitingNumber: string
  lines: DisplayLine[]
  total: number
  source: Source
  /** 담은 줄이 많아 바코드에 다 담기지 못했는지 */
  truncated: boolean
}

function sumTotal(lines: DisplayLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

function cupsOf(lines: DisplayLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

/** BroadcastChannel 로 받은 주문 -> 화면에 그릴 모양 */
function fromChannel(order: KioskOrder, source: Source): DisplayOrder {
  const lines = order.lines.map((line) => ({
    name: line.menuName,
    quantity: line.quantity,
    price: line.price,
  }))
  return {
    waitingNumber: order.waitingNumber,
    lines,
    total: order.total || sumTotal(lines),
    source,
    truncated: false,
  }
}

/**
 * 아무것도 찾지 못했을 때 쓰는 예시 주문.
 * 시연이 막다른 길로 끝나지 않게 하려는 마지막 수단이다. 화면에는 '시연용 예시' 라고 밝힌다.
 */
function sampleOrder(waitingNumber: string): DisplayOrder {
  const picked = ['hot-americano', 'ice-cafe-latte']
    .map((id) => MENUS.find((menu) => menu.id === id))
    .filter((menu): menu is (typeof MENUS)[number] => Boolean(menu))
  const menus = picked.length ? picked : MENUS.slice(0, 2)
  const lines = menus.map((menu, index) => ({
    name: menu.name,
    quantity: index === 0 ? 2 : 1,
    price: menu.price,
  }))
  return { waitingNumber, lines, total: sumTotal(lines), source: '시연용 예시', truncated: false }
}

export default function Kiosk() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [order, setOrder] = useState<DisplayOrder | null>(null)
  const [digits, setDigits] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  /** 바코드가 안 읽힐 때 키패드 쪽으로 안내를 옮긴다 */
  const [keypadFirst, setKeypadFirst] = useState(false)
  /** 번호로도 주문을 못 찾은 뒤에만 '예시 주문으로 계속' 을 보여 준다 */
  const [offerSample, setOfferSample] = useState(false)

  // 같은 브라우저에서 받아 둔 주문들. 키오스크 탭을 나중에 열었어도 찾을 수 있게
  // localStorage 사본부터 읽고 시작한다.
  const [orders, setOrders] = useState<KioskOrder[]>(() => readStoredOrders())
  const ordersRef = useRef(orders)
  ordersRef.current = orders

  useEffect(() => subscribeOrders((incoming) => {
    setOrders((prev) => [incoming, ...prev.filter((o) => o.waitingNumber !== incoming.waitingNumber)])
  }), [])

  /** 주문을 받아들이고 확인 화면으로 넘어간다. */
  const accept = useCallback((next: DisplayOrder) => {
    playClick() // 매장 기계처럼 '삑' — 읽혔다는 신호
    setOrder(next)
    setNotice(null)
    setOfferSample(false)
    setDigits('')
    setPhase('confirm')
  }, [])

  const showNotice = useCallback((text: string) => {
    setNotice(text)
    setKeypadFirst(true)
  }, [])

  /** 웹캠이 바코드를 읽었을 때. 우리 주문인지 여기서 가린다. */
  const handleScan = useCallback(
    (value: string) => {
      // 같은 브라우저에서 받아 둔 주문이면 그쪽을 먼저 쓴다.
      // 담은 줄이 많아 바코드에서 잘렸더라도 여기에는 전부 들어 있다.
      const known = ordersRef.current.find((o) => o.barcodeValue === value)
      if (known) {
        accept(fromChannel(known, '앱 연결'))
        return
      }

      const decoded = decodeOrderValue(value)
      if (!decoded) {
        // 키오스크는 남의 바코드(우유갑·영수증)도 읽는다. 읽은 것과 우리 주문인 것은 다르다.
        showNotice('주문 척척 바코드가 아니에요. 번호를 눌러 주세요.')
        return
      }

      const lines = decoded.lines.map((line) => ({
        name: line.menu.name,
        quantity: line.quantity,
        price: line.menu.price,
      }))
      accept({
        waitingNumber: decoded.waitingNumber,
        lines,
        total: sumTotal(lines),
        source: '바코드',
        truncated: decoded.truncated,
      })
    },
    [accept, showNotice],
  )

  const { videoRef, status } = useBarcodeScanner({ enabled: phase === 'idle', onScan: handleScan })

  // 카메라를 쓸 수 없으면 처음부터 키패드가 주인공이다.
  useEffect(() => {
    if (status === 'unavailable') setKeypadFirst(true)
  }, [status])

  // 한참 비춰도 안 읽히면 키패드 쪽으로 안내를 옮긴다. 어떤 경우에도 길이 막히면 안 된다.
  useEffect(() => {
    if (phase !== 'idle' || status !== 'scanning') return
    const timer = window.setTimeout(() => setKeypadFirst(true), SCAN_HINT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, status])

  // 안내 쪽지는 저절로 사라진다. 시연 중에 닫을 것을 찾게 만들지 않는다.
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const reset = useCallback(() => {
    setPhase('idle')
    setOrder(null)
    setDigits('')
    setNotice(null)
    setOfferSample(false)
    setKeypadFirst(false)
  }, [])

  // 화면이 저절로 흘러간다. 심사장에서 누가 눌러 주지 않아도 끝까지 간다.
  useEffect(() => {
    if (phase === 'idle') return
    const next: Record<Exclude<Phase, 'idle'>, [number, () => void]> = {
      confirm: [CONFIRM_MS, () => setPhase('payment')],
      payment: [PAYMENT_MS, () => setPhase('done')],
      done: [DONE_MS, reset],
    }
    const [ms, run] = next[phase]
    const timer = window.setTimeout(run, ms)
    return () => window.clearTimeout(timer)
  }, [phase, reset])

  /** 키패드에서 번호 네 자리를 다 누르셨을 때 */
  const submitDigits = useCallback(() => {
    if (digits.length !== 4) return
    const found = ordersRef.current.find((o) => o.waitingNumber === digits)
    if (found) {
      accept(fromChannel(found, '번호 입력'))
      return
    }
    // 다른 기기에서 하신 주문은 번호만으로는 알 수 없다. (바코드에는 주문이 들어 있다)
    setNotice(`${digits} 번으로 들어온 주문을 찾지 못했어요.`)
    setOfferSample(true)
  }, [digits, accept])

  const pressDigit = (digit: string) => {
    setOfferSample(false)
    setDigits((prev) => (prev.length >= 4 ? prev : prev + digit))
  }

  return (
    <div className="relative flex h-[100dvh] min-h-[600px] w-full flex-col overflow-hidden bg-bg">
      <BrandHeader />

      <main className="flex min-h-0 flex-1 flex-col px-10 py-6">
        {phase === 'idle' && (
          <IdlePanel
            videoRef={videoRef}
            status={status}
            keypadFirst={keypadFirst}
            digits={digits}
            onDigit={pressDigit}
            onErase={() => setDigits((prev) => prev.slice(0, -1))}
            onSubmit={submitDigits}
            offerSample={offerSample}
            onSample={() => accept(sampleOrder(digits || '0000'))}
          />
        )}
        {phase === 'confirm' && order && <ConfirmPanel order={order} onPay={() => setPhase('payment')} onCancel={reset} />}
        {phase === 'payment' && order && <PaymentPanel order={order} />}
        {phase === 'done' && order && <DonePanel order={order} />}
      </main>

      <CardSlot active={phase === 'payment'} />

      {notice && (
        <div className="pointer-events-none absolute left-1/2 top-28 z-20 -translate-x-1/2 animate-rise-in rounded-2xl bg-ink px-8 py-4 text-[24px] font-bold text-white shadow-card-selected">
          {notice}
        </div>
      )}

      {/* 실제 매장 연동으로 오해받지 않도록 언제나 켜 두는 표시 */}
      <span className="pointer-events-none absolute bottom-2 right-3 z-20 rounded-full bg-ink/70 px-3 py-1 text-[14px] font-semibold text-white/90">
        시연용 화면
      </span>
    </div>
  )
}

/** 매장 기계 위쪽의 브랜드 띠 */
function BrandHeader() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20000)
    return () => window.clearInterval(timer)
  }, [])

  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-brand-deep to-brand-light px-10 py-4 text-white">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-[28px]">
          ☕
        </span>
        <div>
          <p className="text-[30px] font-black leading-none tracking-[-0.02em]">{BRAND}</p>
          <p className="mt-1 text-[15px] font-medium text-white/75">주문·결제 기계 1번</p>
        </div>
      </div>
      <div className="text-right">
        {/* 실제 매장이 아니라는 것을 위쪽에서도 한 번 더 밝힌다 */}
        <p className="text-[16px] font-semibold text-white/85">가상 매장 · 시연용</p>
        <p className="text-[15px] text-white/70">{clock}</p>
      </div>
    </header>
  )
}

interface IdleProps {
  videoRef: React.RefObject<HTMLVideoElement>
  status: string
  keypadFirst: boolean
  digits: string
  onDigit: (digit: string) => void
  onErase: () => void
  onSubmit: () => void
  offerSample: boolean
  onSample: () => void
}

/** 1. 대기 화면 — 왼쪽은 바코드, 오른쪽은 번호. 둘 중 어느 쪽으로도 주문을 불러올 수 있다. */
function IdlePanel({
  videoRef,
  status,
  keypadFirst,
  digits,
  onDigit,
  onErase,
  onSubmit,
  offerSample,
  onSample,
}: IdleProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-8">
      <section className="flex min-h-0 flex-col">
        <h1 className="text-[40px] font-black leading-tight tracking-[-0.02em] text-ink">
          주문 척척 앱으로 주문하셨나요?
        </h1>
        <p className="mt-2 text-[22px] font-medium text-ink-sub">
          폰 화면의 줄무늬 그림을 네모 안에 대 주세요
        </p>

        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-[28px] bg-ink">
          {/* 웹캠 화면. 못 켜면 아래 안내가 대신 덮는다. */}
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-90"
            muted
            playsInline
          />

          {/* 스캔 영역 표시 — 네 귀퉁이 + 훑고 지나가는 빛 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="relative h-[58%] w-[78%] rounded-2xl border-[3px] border-white/70"
              style={{ ['--scan-travel' as string]: '160px' }}
            >
              <Corner className="left-[-3px] top-[-3px] border-l-[6px] border-t-[6px] rounded-tl-2xl" />
              <Corner className="right-[-3px] top-[-3px] border-r-[6px] border-t-[6px] rounded-tr-2xl" />
              <Corner className="bottom-[-3px] left-[-3px] border-b-[6px] border-l-[6px] rounded-bl-2xl" />
              <Corner className="bottom-[-3px] right-[-3px] border-b-[6px] border-r-[6px] rounded-br-2xl" />
              {status === 'scanning' && (
                <span className="absolute left-3 right-3 top-4 h-[4px] animate-scan-line rounded-full bg-brand-light shadow-[0_0_18px_4px_rgba(59,125,245,0.7)] motion-reduce:animate-none" />
              )}
            </div>
          </div>

          {status !== 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/85 px-8 text-center">
              <p className="text-[28px] font-bold text-white">
                {status === 'starting' ? '카메라를 켜는 중이에요' : '카메라를 쓸 수 없어요'}
              </p>
              <p className="mt-2 text-[20px] font-medium text-white/75">
                {status === 'starting'
                  ? '잠시만 기다려 주세요'
                  : '오른쪽 번호판으로 그대로 진행하실 수 있어요'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-col">
        <h2
          className={[
            'text-[28px] font-bold transition-colors',
            keypadFirst ? 'text-brand' : 'text-ink',
          ].join(' ')}
        >
          {keypadFirst ? '번호를 눌러 주세요' : '번호로도 하실 수 있어요'}
        </h2>
        <p className="mt-1 text-[18px] font-medium text-ink-sub">폰에 적힌 대기번호 네 자리</p>

        <div className="mt-3 flex gap-3">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={[
                'flex h-[64px] flex-1 items-center justify-center rounded-2xl border-[3px] text-[36px] font-black',
                digits.length === index
                  ? 'border-brand bg-brand-tint text-brand'
                  : 'border-line bg-surface text-ink',
              ].join(' ')}
            >
              {digits[index] ?? ''}
            </span>
          ))}
        </div>

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <KeypadButton key={digit} onClick={() => onDigit(digit)}>
              {digit}
            </KeypadButton>
          ))}
          <KeypadButton onClick={onErase} tone="soft">
            지움
          </KeypadButton>
          <KeypadButton onClick={() => onDigit('0')}>0</KeypadButton>
          <KeypadButton onClick={onSubmit} tone="brand" disabled={digits.length !== 4}>
            확인
          </KeypadButton>
        </div>

        {offerSample && (
          // 다른 기기에서 하신 주문은 번호만으로는 찾을 수 없다.
          // 그래도 시연이 여기서 끊기지 않도록 예시로 이어 갈 길을 둔다.
          <button
            type="button"
            onClick={onSample}
            className="mt-3 shrink-0 rounded-2xl border-2 border-dashed border-ink-sub/50 py-3 text-[19px] font-semibold text-ink-sub"
          >
            시연용 예시 주문으로 계속하기
          </button>
        )}
      </section>
    </div>
  )
}

function Corner({ className }: { className: string }) {
  return <span aria-hidden className={`absolute h-9 w-9 border-brand-light ${className}`} />
}

interface KeypadButtonProps {
  children: React.ReactNode
  onClick: () => void
  tone?: 'default' | 'soft' | 'brand'
  disabled?: boolean
}

function KeypadButton({ children, onClick, tone = 'default', disabled }: KeypadButtonProps) {
  const tones = {
    default: 'bg-surface text-ink shadow-card',
    soft: 'bg-line/70 text-ink',
    brand: 'bg-brand text-white shadow-card-selected disabled:bg-line disabled:text-ink-sub disabled:shadow-none',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl text-[30px] font-bold transition-transform duration-100 active:scale-[0.97] ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

/** 주문이 어디로 들어왔는지 알려 주는 딱지 */
function SourceBadge({ source }: { source: Source }) {
  const sample = source === '시연용 예시'
  return (
    <span
      className={[
        'rounded-full px-4 py-1.5 text-[17px] font-bold',
        sample ? 'bg-ink-sub text-white' : 'bg-brand-tint text-brand-deep',
      ].join(' ')}
    >
      {sample ? '시연용 예시 주문' : `${source}으로 불러옴`}
    </span>
  )
}

/** 3. 주문 확인 */
function ConfirmPanel({
  order,
  onPay,
  onCancel,
}: {
  order: DisplayOrder
  onPay: () => void
  onCancel: () => void
}) {
  const cups = cupsOf(order.lines)

  return (
    <div className="flex min-h-0 flex-1 animate-enter flex-col">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[40px] font-black tracking-[-0.02em] text-ink">이 주문이 맞나요?</h1>
          <SourceBadge source={order.source} />
        </div>
        <div className="text-right">
          <p className="text-[18px] font-semibold text-ink-sub">대기번호</p>
          <p className="text-[44px] font-black leading-none text-brand">{order.waitingNumber}</p>
        </div>
      </div>

      <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {order.lines.map((line, index) => (
          <li
            key={`${line.name}-${index}`}
            className="flex shrink-0 items-center justify-between rounded-2xl bg-surface px-7 py-4 shadow-card"
          >
            <span className="text-[28px] font-bold text-ink">{line.name}</span>
            <span className="flex items-baseline gap-8">
              <span className="text-[24px] font-semibold text-ink-sub">
                {cupsLabel(line.quantity)}
              </span>
              <span className="w-[140px] text-right text-[26px] font-bold text-ink">
                {won(line.price * line.quantity)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {order.truncated && (
        <p className="mt-2 shrink-0 text-[17px] font-medium text-ink-sub">
          ※ 바코드에는 앞의 네 줄까지만 담겨요. 나머지는 매장에서 번호로 확인해요.
        </p>
      )}

      <div className="mt-4 flex shrink-0 items-center justify-between rounded-2xl bg-ink px-8 py-5 text-white">
        <span className="text-[26px] font-semibold">모두 {cups}잔</span>
        <span className="text-[40px] font-black">{won(order.total)}</span>
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-[76px] w-[200px] rounded-cta border-2 border-line bg-surface text-[24px] font-semibold text-ink active:scale-[0.99]"
        >
          처음으로
        </button>
        <button
          type="button"
          onClick={onPay}
          className="h-[76px] flex-1 rounded-cta bg-brand text-[28px] font-bold text-white shadow-card-selected active:scale-[0.99]"
        >
          결제하기
        </button>
      </div>
      <p className="mt-2 shrink-0 text-center text-[17px] font-medium text-ink-sub">
        누르지 않으셔도 잠시 뒤 결제 안내로 넘어가요
      </p>
    </div>
  )
}

/** 4. 결제 안내 — 카드를 넣어 주세요 */
function PaymentPanel({ order }: { order: DisplayOrder }) {
  return (
    <div className="flex min-h-0 flex-1 animate-enter flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-[24px] font-semibold text-ink-sub">결제하실 금액</p>
        <p className="mt-1 text-[64px] font-black leading-none tracking-[-0.02em] text-ink">
          {won(order.total)}
        </p>

        <h1 className="mt-6 text-[48px] font-black tracking-[-0.02em] text-brand">
          카드를 넣어 주세요
        </h1>
        <p className="mt-2 text-[22px] font-medium text-ink-sub">
          아래 투입구에 카드를 넣으시면 결제가 진행돼요
        </p>
      </div>

      {/*
        카드가 아래 투입구로 들어갔다 나오기를 되풀이한다.
        - 화면 아래쪽에 붙여 둔다. 투입구(CardSlot)가 바로 밑에 있어야 '들어간다' 로 보인다.
        - overflow-hidden 이 아래 경계에서 카드를 잘라 준다. 투입구로 사라지는 것처럼 보이는 이유다.
      */}
      <div className="relative h-[132px] w-full shrink-0 overflow-hidden">
        {/* 가운데 맞추기(-translate-x-1/2)와 움직임(animate-card-insert)은 둘 다 transform 이라
            한 요소에 같이 두면 나중 것이 앞의 것을 덮어 버린다. 그래서 감싸는 칸을 하나 더 둔다. */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="animate-card-insert motion-reduce:animate-none">
            <div className="h-[112px] w-[180px] rounded-2xl bg-gradient-to-br from-brand-deep to-brand-light p-4 shadow-card-selected">
              <div className="h-6 w-10 rounded-md bg-white/70" />
              <div className="mt-5 h-2.5 w-24 rounded-full bg-white/50" />
              <div className="mt-2 h-2.5 w-16 rounded-full bg-white/35" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 5. 결제 완료 */
function DonePanel({ order }: { order: DisplayOrder }) {
  const cups = cupsOf(order.lines)
  return (
    <div className="flex min-h-0 flex-1 animate-enter flex-col items-center justify-center">
      <CheckCircleIcon size={72} className="text-brand" />
      <h1 className="mt-3 text-[52px] font-black tracking-[-0.02em] text-ink">결제가 끝났어요</h1>

      <p className="mt-6 text-[22px] font-semibold text-ink-sub">대기번호</p>
      <p className="text-[120px] font-black leading-none tracking-[0.02em] text-brand">
        {order.waitingNumber}
      </p>

      <p className="mt-5 text-[26px] font-medium text-ink">
        음료 {cups}잔을 준비할게요. 번호를 부르면 받아 가세요.
      </p>
      <p className="mt-2 text-[18px] font-medium text-ink-sub">
        잠시 뒤 처음 화면으로 돌아가요
      </p>
    </div>
  )
}

/** 화면 아래쪽의 카드 투입구. 결제 중일 때만 둘레가 밝아진다. */
function CardSlot({ active }: { active: boolean }) {
  return (
    // 투입구는 화면 한가운데에 둔다. 결제 화면의 카드가 바로 위에서 내려오므로,
    // 둘이 세로로 맞아야 '이 구멍으로 들어간다' 가 한눈에 읽힌다.
    <footer className="relative shrink-0 bg-ink px-10 pb-5 pt-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={[
              'h-[22px] w-[300px] rounded-full border-2 bg-black/70 transition-colors',
              active
                ? 'animate-slot-glow border-brand-light motion-reduce:animate-none'
                : 'border-white/25',
            ].join(' ')}
          />
          <span className="absolute inset-x-6 top-[8px] h-[5px] rounded-full bg-white/10" />
        </div>
        <p className="mt-2 text-[19px] font-bold text-white">카드 투입구</p>
        <p className="text-[15px] font-medium text-white/60">
          신용·체크카드를 넣어 주세요 (현금은 직원에게)
        </p>
      </div>

      {/* 이 앱의 핵심 — 카드를 등록하지 않는다는 점을 매장 기계 화면에서도 밝혀 둔다 */}
      <p className="absolute bottom-6 left-10 text-[15px] font-medium text-white/45">
        이 앱은 카드를 등록하지 않아요 · 결제는 매장 기계에서만
      </p>
    </footer>
  )
}
