import type { DineOption } from '../types'

/**
 * 앱(폰)과 키오스크 시연 화면 사이의 연락 통로.
 *
 * ── 두 갈래로 둔 이유 ──────────────────────────────────────────
 *   1) BroadcastChannel — 같은 브라우저의 다른 탭끼리 즉시 오간다.
 *      노트북 한 대에서 왼쪽 탭은 앱, 오른쪽 탭은 키오스크로 두고 시연할 때 쓴다.
 *      기기가 다르면(폰 ↔ 노트북) 전혀 통하지 않는다.
 *   2) localStorage 사본 — 키오스크 탭을 나중에 열어도 방금 주문을 찾을 수 있게 남겨 둔다.
 *      BroadcastChannel 은 '보낼 때 듣고 있던 탭' 에만 닿기 때문이다.
 *
 * 기기가 서로 다를 때는 이 통로가 아니라 바코드 값 자체로 주문이 건너간다. (lib/orderCode.ts)
 * 여기는 어디까지나 '같은 브라우저에서 더 편하게' 를 위한 보조 수단이다.
 * 그래서 이 파일의 모든 실패는 조용히 넘어간다. 없어도 시연은 성립해야 한다.
 */

const CHANNEL_NAME = 'jumun-kiosk'

/** 키오스크가 나중에 열려도 찾을 수 있도록 남기는 최근 주문 */
const STORAGE_KEY = 'jumun-kiosk-orders'

/** 남겨 두는 최근 주문 수 */
const MAX_STORED = 5

export interface KioskOrderLine {
  menuId: string
  menuName: string
  quantity: number
  /** 한 잔 값 */
  price: number
}

/** 앱이 주문을 확정할 때 키오스크로 보내는 내용 */
export interface KioskOrder {
  waitingNumber: string
  barcodeValue: string
  lines: KioskOrderLine[]
  total: number
  dine: DineOption
  /** 보낸 시각 (ms) */
  at: number
}

interface KioskMessage {
  type: 'order'
  order: KioskOrder
}

function isOrder(value: unknown): value is KioskOrder {
  if (typeof value !== 'object' || value === null) return false
  const order = value as Partial<KioskOrder>
  return (
    typeof order.waitingNumber === 'string' &&
    typeof order.barcodeValue === 'string' &&
    Array.isArray(order.lines) &&
    typeof order.total === 'number'
  )
}

function openChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null
  try {
    return new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

/** 최근 주문 사본을 읽는다. (최신이 앞) */
export function readStoredOrders(): KioskOrder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isOrder)
  } catch {
    return []
  }
}

function storeOrder(order: KioskOrder): void {
  try {
    const next = [order, ...readStoredOrders().filter((o) => o.waitingNumber !== order.waitingNumber)]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_STORED)))
  } catch {
    // 저장소가 막힌 브라우저. 바코드로도 건너가므로 그냥 넘어간다.
  }
}

/** 주문을 확정했음을 키오스크에 알린다. 듣는 곳이 없어도 그냥 지나간다. */
export function publishOrder(order: KioskOrder): void {
  storeOrder(order)

  const channel = openChannel()
  if (!channel) return
  try {
    const message: KioskMessage = { type: 'order', order }
    channel.postMessage(message)
  } catch {
    // 보내지 못해도 주문 자체는 이미 끝났다.
  } finally {
    channel.close()
  }
}

/**
 * 새 주문이 들어오는 것을 듣는다.
 * @returns 그만 듣는 함수. 화면을 벗어날 때 반드시 부른다.
 */
export function subscribeOrders(onOrder: (order: KioskOrder) => void): () => void {
  const channel = openChannel()
  if (!channel) return () => {}

  const handle = (event: MessageEvent) => {
    const data = event.data as Partial<KioskMessage> | null
    if (!data || data.type !== 'order' || !isOrder(data.order)) return
    onOrder(data.order)
  }

  channel.addEventListener('message', handle)
  return () => {
    channel.removeEventListener('message', handle)
    try {
      channel.close()
    } catch {
      // 이미 닫혔다. 무시해도 된다.
    }
  }
}
