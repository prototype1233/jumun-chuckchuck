import type { DineOption } from '../types'

/**
 * 이 기기에 남기는 주문 기록.
 *
 * 로그인도, 회원가입도, 서버도 없다. 이 브라우저의 localStorage 한 칸이 전부다.
 * 기기를 바꾸거나 브라우저 기록을 지우면 함께 사라지는 것이 정상이다.
 *
 * 사파리 프라이빗 모드처럼 localStorage 를 막아 둔 환경에서도 앱이 멀쩡해야 하므로
 * 읽기·쓰기를 모두 try-catch 로 감싸고, 실패하면 조용히 없는 셈 친다.
 */

/** 저장 키 — 하나만 쓴다 */
const KEY = 'jumun-order-history'

/** 이만큼만 남기고 오래된 것부터 지운다 */
const MAX_RECORDS = 10

/** '자주 드시던 것' 으로 볼 최소 주문 횟수 */
export const FREQUENT_THRESHOLD = 3

export interface OrderRecord {
  menuId: string
  menuName: string
  quantity: number
  dineOption: DineOption
  /** 주문한 시각 (ms) */
  orderedAt: number
}

interface HistoryFile {
  orders: OrderRecord[]
  updatedAt: number
}

/** 저장된 값이 우리가 아는 모양인지 확인한다. 손상된 값은 없는 셈 친다. */
function isRecord(value: unknown): value is OrderRecord {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Partial<OrderRecord>
  return (
    typeof r.menuId === 'string' &&
    typeof r.menuName === 'string' &&
    typeof r.quantity === 'number' &&
    (r.dineOption === 'store' || r.dineOption === 'togo') &&
    typeof r.orderedAt === 'number'
  )
}

/** 저장된 기록을 읽는다. 읽을 수 없으면 빈 배열. (최신이 앞) */
function read(): OrderRecord[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return []
    const orders = (parsed as Partial<HistoryFile>).orders
    if (!Array.isArray(orders)) return []
    return orders.filter(isRecord)
  } catch {
    // 저장소가 막혔거나 값이 깨졌다. 기록이 없는 것으로 본다.
    return []
  }
}

function write(orders: OrderRecord[]): void {
  try {
    const file: HistoryFile = { orders, updatedAt: Date.now() }
    window.localStorage.setItem(KEY, JSON.stringify(file))
  } catch {
    // 저장에 실패해도 주문 자체는 이미 끝났다. 조용히 넘어간다.
  }
}

/**
 * 주문 하나를 기록에 추가한다.
 * 장바구니에 담긴 메뉴 수만큼 줄이 쌓인다. (같은 메뉴도 합치지 않고 따로 쌓는다)
 * 최근 MAX_RECORDS 개만 남는다.
 */
export function saveOrder(records: OrderRecord[]): void {
  if (!records.length) return
  // 최신이 앞에 오도록 새 기록을 앞에 붙인다.
  write([...records, ...read()].slice(0, MAX_RECORDS))
}

/** 최근 주문 기록 (최신순). */
export function getRecentOrders(): OrderRecord[] {
  return read()
}

/**
 * 자주 주문한 메뉴의 id 목록.
 * 잔 수가 아니라 '몇 번 주문했는지' 로 센다. (두 잔짜리 한 번은 1회)
 */
export function getFrequentMenuIds(minCount: number = FREQUENT_THRESHOLD): string[] {
  const counts = new Map<string, number>()
  for (const record of read()) {
    counts.set(record.menuId, (counts.get(record.menuId) ?? 0) + 1)
  }
  return [...counts.entries()].filter(([, count]) => count >= minCount).map(([menuId]) => menuId)
}

/** 기록을 모두 지운다. (시연 리허설 전에 초기 상태로 되돌릴 때) */
export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // 지우지 못해도 할 수 있는 일이 없다.
  }
}
