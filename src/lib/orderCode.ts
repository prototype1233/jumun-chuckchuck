import { MENUS } from '../data/menus'
import type { Menu } from '../types'

/**
 * 바코드 값 하나에 주문 내용을 통째로 담는 규칙.
 *
 * ── 왜 값 안에 담는가 ──────────────────────────────────────────
 * 서버가 없다. 폰(앱)과 노트북(키오스크 시연 화면)이 주문을 주고받을 길은 두 가지뿐이다.
 *   1) BroadcastChannel — 같은 브라우저의 다른 탭끼리만 통한다. (lib/kioskChannel.ts)
 *   2) 바코드 값 그 자체 — 폰 화면을 노트북 웹캠에 대면 기기가 달라도 건너간다.
 * 현장 시연은 폰과 노트북이 서로 다른 기기라서 2번이 없으면 성립하지 않는다.
 * 그래서 바코드는 '주문을 가리키는 이름표' 가 아니라 '주문 그 자체' 를 담는다.
 *
 * ── 형식 ──────────────────────────────────────────────────────
 *   JC + 대기번호 4자리 + (메뉴코드 2자리 + 잔수 1자리) × 담은 줄 수
 *   예) JC3721 0402 1101
 *       JC     … 주문 척척 주문이라는 표시
 *       3721   … 화면에 크게 보여 주는 대기번호
 *       04 2   … 4번 메뉴 두 잔
 *       11 1   … 11번 메뉴 한 잔
 *
 * 'JC' 뒤는 모두 숫자다. CODE128 은 숫자가 이어지면 두 자리를 한 칸에 담으므로(Code C)
 * 막대가 그만큼 굵어진다. 굵을수록 웹캠이 잘 읽는다 — 시연에서는 이것이 곧 성공률이다.
 * 한 줄짜리 주문이면 9글자로, 예전 형식(12글자)보다 오히려 짧다.
 *
 * ── 실제 매장에 들일 때 ────────────────────────────────────────
 * 매장 POS 와 연결되면 이 규칙은 통째로 필요 없어진다.
 * POS 가 준 주문번호를 lib/barcode.ts 의 createBarcodeValue 가 그대로 돌려주게 바꾸면 되고,
 * 그때 이 파일과 키오스크 시연 화면(screens/Kiosk.tsx)은 함께 걷어내면 된다.
 */

/** 앞에 붙는 표시. 주문 척척(Jumun ChuckChuck). */
const PREFIX = 'JC'

/** 대기번호 자릿수 */
export const WAITING_DIGITS = 4

/** 메뉴 한 줄이 차지하는 글자 수 — 메뉴코드 2 + 잔수 1 */
const LINE_LENGTH = 3

/**
 * 바코드에 담는 최대 줄 수.
 *
 * 담은 줄이 많아질수록 막대가 가늘어져 웹캠이 못 읽는다.
 * 넘치는 줄은 바코드에서 빠지지만(잘렸음은 decodeOrderValue 가 알려 준다),
 * 대기번호는 그대로라 매장에서 번호로 확인하면 된다.
 */
const MAX_LINES = 4

/** 한 줄에 담을 수 있는 최대 잔 수. 한 자리로 적으므로 9잔까지다. */
const MAX_QUANTITY = 9

/**
 * 메뉴에 붙이는 두 자리 번호의 기준이 되는 순서.
 *
 * ⚠ 이 배열은 바코드 값의 일부다.
 *   - 중간에 끼워 넣거나 지우면 이미 찍힌 바코드가 다른 메뉴를 가리키게 된다.
 *   - 메뉴를 새로 만들면 반드시 '맨 뒤에만' 덧붙인다.
 *   - 메뉴를 없앨 때는 배열에서 지우지 말고 자리를 그대로 비워 둔 채 남겨 둔다.
 * (menus.ts 의 순서와는 따로 관리한다. 그쪽은 화면에 보여 줄 순서라 언제든 바뀔 수 있다)
 */
const CODE_ORDER: string[] = [
  'ice-americano',
  'ice-cold-brew',
  'ice-espresso',
  'ice-cafe-latte',
  'ice-milk-coffee',
  'ice-mild-americano',
  'ice-vanilla-latte',
  'ice-cafe-mocha',
  'ice-caramel-latte',
  'hot-americano',
  'hot-drip-coffee',
  'hot-espresso',
  'hot-cafe-latte',
  'hot-milk-coffee',
  'hot-mild-americano',
  'hot-vanilla-latte',
  'hot-cafe-mocha',
  'hot-caramel-latte',
  'ice-yuja-tea',
  'ice-grapefruit-ade',
  'ice-plum-tea',
  'ice-green-tea',
  'ice-barley-tea',
  'ice-corn-tea',
  'hot-yuja-tea',
  'hot-jujube-tea',
  'hot-ginger-tea',
  'hot-chamomile-tea',
  'hot-dungulle-tea',
  'hot-brown-rice-tea',
]

/** 메뉴 id -> 두 자리 번호 ('01' 부터). 목록에 없는 메뉴는 null. */
export function menuCodeOf(menuId: string): string | null {
  const index = CODE_ORDER.indexOf(menuId)
  if (index < 0) return null
  return String(index + 1).padStart(2, '0')
}

/** 두 자리 번호 -> 메뉴 id */
function menuIdOf(code: string): string | null {
  const index = Number(code) - 1
  if (!Number.isInteger(index) || index < 0 || index >= CODE_ORDER.length) return null
  return CODE_ORDER[index] ?? null
}

// 메뉴를 새로 만들고 위 목록에 덧붙이는 것을 잊으면, 그 메뉴는 바코드에 담기지 못한다.
// 시연 당일이 아니라 개발 중에 알아채도록 여기서 미리 알려 준다. (배포본에서는 빠진다)
if (import.meta.env.DEV) {
  const missing = MENUS.filter((menu) => menuCodeOf(menu.id) === null).map((menu) => menu.id)
  if (missing.length) {
    console.warn(
      `[orderCode] 바코드 번호가 없는 메뉴: ${missing.join(', ')}\n` +
        'src/lib/orderCode.ts 의 CODE_ORDER 맨 뒤에 id 를 덧붙여 주세요.',
    )
  }
}

/** 바코드에 담을 한 줄 (장바구니 한 줄과 같다) */
export interface OrderCodeLine {
  menuId: string
  quantity: number
}

/** 바코드에서 풀어낸 주문 */
export interface DecodedOrder {
  waitingNumber: string
  lines: { menu: Menu; quantity: number }[]
  /** 담은 줄이 많아 바코드에 다 담기지 못했는지 (MAX_LINES 초과) */
  truncated: boolean
}

/**
 * 주문을 바코드 값으로 만든다.
 * 목록에 없는 메뉴나 잔 수가 0인 줄은 조용히 건너뛴다. (바코드가 깨지는 것보다 낫다)
 */
export function encodeOrderValue(waitingNumber: string, lines: OrderCodeLine[]): string {
  const digits = waitingNumber.replace(/\D/g, '').slice(0, WAITING_DIGITS).padStart(WAITING_DIGITS, '0')

  const encoded = lines
    .map((line) => {
      const code = menuCodeOf(line.menuId)
      if (!code) return null
      const quantity = Math.min(Math.max(Math.round(line.quantity), 1), MAX_QUANTITY)
      return `${code}${quantity}`
    })
    .filter((part): part is string => part !== null)
    .slice(0, MAX_LINES)
    .join('')

  return `${PREFIX}${digits}${encoded}`
}

/**
 * 바코드 값에서 주문을 되살린다. 우리 형식이 아니면 null.
 *
 * 키오스크는 남의 바코드(우유갑, 영수증)도 얼마든지 읽는다.
 * 그래서 '읽었다' 와 '우리 주문이다' 는 반드시 따로 판단해야 한다.
 */
export function decodeOrderValue(value: string, menus: Menu[] = MENUS): DecodedOrder | null {
  const text = value.trim().toUpperCase()
  if (!text.startsWith(PREFIX)) return null

  const body = text.slice(PREFIX.length)
  // 대기번호 4자리 + 줄마다 3자리. 숫자가 아니면 우리 것이 아니다.
  if (!/^\d+$/.test(body)) return null
  if (body.length < WAITING_DIGITS) return null

  const waitingNumber = body.slice(0, WAITING_DIGITS)
  const rest = body.slice(WAITING_DIGITS)
  if (rest.length % LINE_LENGTH !== 0) return null

  const lines: { menu: Menu; quantity: number }[] = []
  for (let at = 0; at < rest.length; at += LINE_LENGTH) {
    const menuId = menuIdOf(rest.slice(at, at + 2))
    const quantity = Number(rest.slice(at + 2, at + LINE_LENGTH))
    if (!menuId || !quantity) return null

    const menu = menus.find((item) => item.id === menuId)
    // 메뉴 목록에서 사라진 메뉴를 가리키는 옛 바코드. 주문 전체를 버리지 않고 그 줄만 뺀다.
    if (!menu) continue
    lines.push({ menu, quantity })
  }

  if (!lines.length) return null
  return { waitingNumber, lines, truncated: rest.length / LINE_LENGTH >= MAX_LINES }
}
