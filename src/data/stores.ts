import type { Store } from '../types'

/**
 * 매장 목데이터.
 * 실제 서비스에서는 GPS로 가장 가까운 매장을 자동 인식한다.
 * 시연에서는 "이미 인식된 상태"로 처리하며 화면에 매장명을 노출하지 않는다.
 * (매장 선택 단계를 없애는 것이 곧 고령친화 UI)
 */
export const STORES: Store[] = [
  { id: 'store-01', name: '척척카페 종로3가점', address: '서울 종로구 돈화문로 12' },
  { id: 'store-02', name: '척척카페 부산 온천장점', address: '부산 동래구 금강공원로 5' },
  { id: 'store-03', name: '척척카페 대구 서문시장점', address: '대구 중구 큰장로26길 3' },
]

/** GPS 자동 인식 결과를 흉내 낸 함수 — 항상 첫 번째 매장을 돌려준다. */
export function detectNearestStore(): Store {
  return STORES[0]
}
