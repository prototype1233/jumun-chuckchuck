import type { CartItem } from '../types'

/** 잔 수를 세는 우리말 (한 잔, 두 잔 …). 열 잔이 넘으면 숫자로 읽는 편이 낫다. */
const NATIVE_NUMBERS = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']

/** 3 -> '세 잔' */
export function cupsLabel(count: number): string {
  const word = NATIVE_NUMBERS[count]
  return word ? `${word} 잔` : `${count}잔`
}

/** 한 줄의 합계 금액 */
export function itemTotal(item: CartItem): number {
  return item.menu.price * item.quantity
}

/** 장바구니 전체 금액 */
export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + itemTotal(item), 0)
}

/** 장바구니 전체 잔 수 */
export function cartCups(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

/** 12000 -> '12,000원' */
export function won(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}
