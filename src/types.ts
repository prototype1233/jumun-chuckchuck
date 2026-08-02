/** 앱 전체에서 쓰는 공통 타입 */

/** 메뉴 분류 */
export type Category = 'coffee' | 'beverage'
/** 온도 */
export type Temp = 'ice' | 'hot'
/** 당도 — sweet(달콤함) / plain(담백함) */
export type Sweetness = 'sweet' | 'plain'
/** 식사 장소 */
export type DineOption = 'store' | 'togo'

/**
 * 사진 묶음.
 * 메뉴마다 사진을 따로 두지 않고 비슷한 종류끼리 한 장을 같이 쓴다.
 * 파일 위치는 public/menu/{imageGroup}.jpg
 */
export type ImageGroup =
  | 'coffee-ice'
  | 'coffee-hot'
  | 'latte-ice'
  | 'latte-hot'
  | 'tea-ice'
  | 'tea-hot'

export interface Menu {
  id: string
  name: string
  category: Category
  temp: Temp
  sweetness: Sweetness
  price: number
  description: string
  /** 인기도 (1~10, 높을수록 인기) */
  popularity: number
  /** 어떤 사진 묶음을 쓸지 */
  imageGroup: ImageGroup
  /** 메뉴 전용 사진이 따로 있으면 이 경로를 먼저 쓴다 (예: '/menu/special.jpg') */
  image?: string
}

/**
 * 장바구니에 담긴 한 줄.
 * 잔 수는 담기 전에 정하므로, 담은 뒤에는 [빼기] 로 지우고 다시 담는다.
 */
export interface CartItem {
  menu: Menu
  quantity: number
  /** 담은 시각 — 담은 순서대로 보여 주려고 둔다 */
  addedAt: number
}

/** 질문 3개에 대한 답변. 아직 답하지 않았으면 null */
export interface Answers {
  category: Category | null
  temp: Temp | null
  sweetness: Sweetness | null
}

export interface Store {
  id: string
  name: string
  address: string
}
