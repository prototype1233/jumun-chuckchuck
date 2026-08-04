/** 앱 전체에서 쓰는 공통 타입 */

/** 메뉴 분류 */
export type Category = 'coffee' | 'beverage'
/** 온도 */
export type Temp = 'ice' | 'hot'
/** 당도 — sweet(달콤함) / plain(담백함). 음료(beverage)의 세 번째 질문에 쓴다. */
export type Sweetness = 'sweet' | 'plain'
/**
 * 커피 맛 — light(연하게) / strong(진하게) / sweet(달콤하게).
 *
 * 커피에 '당도' 를 여쭙는 것이 어색해서 커피만 따로 쓰는 축이다.
 * 이름은 어르신이 쓰시는 일상 표현으로만 정한다.
 * ('산미', '바디감', '쓴맛' 같은 커피 전문 용어는 화면에도 여기에도 쓰지 않는다)
 */
export type CoffeeTaste = 'light' | 'strong' | 'sweet'
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
  /** 음료 추천에 쓰는 축. 커피에도 값은 있지만 추천에는 쓰이지 않는다. (말로 주문하기에서는 쓴다) */
  sweetness: Sweetness
  /** 커피 추천에 쓰는 축. 음료에도 결이 비슷한 값을 넣어 두었지만 추천에는 쓰이지 않는다. */
  coffeeTaste: CoffeeTaste
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

/**
 * 질문 3개에 대한 답변. 아직 답하지 않았으면 null.
 *
 * 세 번째 질문은 종류에 따라 갈린다.
 *   - 음료를 고르셨으면 '당도는 어떻게 맞춰드릴까요?'  -> sweetness
 *   - 커피를 고르셨으면 '어떤 맛으로 드릴까요?'        -> coffeeTaste
 * 그래서 둘 중 하나만 채워지고, 다른 하나는 null 로 남는다.
 */
export interface Answers {
  category: Category | null
  temp: Temp | null
  sweetness: Sweetness | null
  coffeeTaste: CoffeeTaste | null
}

export interface Store {
  id: string
  name: string
  address: string
}
