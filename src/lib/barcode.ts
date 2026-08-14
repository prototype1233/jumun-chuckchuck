import { encodeOrderValue, type OrderCodeLine } from './orderCode'

/**
 * 매장 기계(키오스크·POS)에 대는 바코드 값.
 *
 * ── 지금 값을 어떻게 만드는가 ──────────────────────────────
 * 형식: JC + 대기번호 4자리 + (메뉴 2자리 + 잔수 1자리) × 담은 줄 수
 *   예) JC3721 0402 1101   … 대기번호 3721, 4번 메뉴 두 잔 + 11번 메뉴 한 잔
 * 자세한 규칙과 이유는 lib/orderCode.ts 에 적어 두었다.
 *
 * 값 안에 주문 내용까지 담는 이유는 하나다. 서버가 없어서,
 * 폰과 매장 기계가 서로 다른 기기일 때 주문이 건너갈 길이 이 바코드밖에 없다.
 * (같은 브라우저끼리는 BroadcastChannel 로도 오간다 — lib/kioskChannel.ts)
 *
 * ── 실제 매장에 들일 때 ────────────────────────────────────
 * 이 앱은 POS 와 연결돼 있지 않아서 주문번호를 스스로 만들어 쓴다.
 * 즉 지금 이 바코드는 우리끼리 정한 값이지, 매장 기계가 알아보는 주문번호가 아니다.
 *
 * 매장에 실제로 들이게 되면 아래 createBarcodeValue 하나만 갈아 끼우면 된다.
 * 화면·컴포넌트는 이 함수가 돌려준 문자열을 그대로 그리기만 하므로 다른 곳은 손댈 필요가 없다.
 *   1) POS 에 주문을 넣고 받은 주문번호를 그대로 돌려주도록 바꾼다.
 *      (비동기가 되면 주문 확정 시점에 받아 두고 이 함수는 서식만 맞추게 두는 편이 낫다)
 *   2) 매장 체계가 CODE128 이 아니라면 Barcode 컴포넌트의 format 도 함께 맞춘다.
 *      (EAN-13 처럼 자릿수·체크숫자 규칙이 있는 형식은 여기서 그 규칙까지 지켜 만들어야 한다)
 *   3) 체크숫자나 매장 코드가 필요하면 이 파일 안에서 붙인다. 화면 쪽은 그대로 둔다.
 */

/**
 * 대기번호와 담은 것으로 바코드에 담을 값을 만든다.
 *
 * @param waitingNumber 대기번호 4자리 문자열
 * @param lines 담은 메뉴와 잔 수. 비어 있으면 대기번호만 담긴다.
 */
export function createBarcodeValue(waitingNumber: string, lines: OrderCodeLine[] = []): string {
  return encodeOrderValue(waitingNumber, lines)
}
