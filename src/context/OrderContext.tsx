import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { detectNearestStore } from '../data/stores'
import { createBarcodeValue } from '../lib/barcode'
import { publishOrder } from '../lib/kioskChannel'
import { cartTotal } from '../logic/cart'
import type {
  Answers,
  CartItem,
  Category,
  CoffeeTaste,
  DineOption,
  EntryMode,
  Menu,
  Sweetness,
  Store,
} from '../types'

/**
 * 주문 상태 — 외부 상태관리 라이브러리 없이 Context + useReducer 만 사용한다.
 * 매장(store)은 GPS로 자동 인식된 값으로 내부 상태에만 두고 화면에는 노출하지 않는다.
 */
interface OrderState {
  store: Store
  dine: DineOption | null
  /**
   * 이 주문을 말로 시작하셨는지, 버튼으로 시작하셨는지.
   * '다시 고를래요' 가 어디로 돌아갈지를 정한다. (말로 시작 -> 말하는 화면으로)
   */
  entryMode: EntryMode
  answers: Answers
  /** 잔 수를 고르는 중인 메뉴 */
  selectedMenu: Menu | null
  /** 담은 음료들. 담은 순서대로 둔다. */
  cart: CartItem[]
  waitingNumber: string | null
  /**
   * 매장 기계에 대는 바코드에 담을 값.
   * 대기번호와 같은 주문을 가리키므로 주문을 확정할 때 함께 만든다.
   */
  barcodeValue: string | null
  /**
   * 음성 안내 켜짐 여부 — 언제나 true.
   * 끄는 버튼을 없앴으므로 값이 바뀌는 곳은 없다.
   * useSpeech 가 이 값을 보고 있어서 자리는 그대로 남겨 둔다.
   */
  soundOn: boolean
}

type Action =
  | { type: 'setDine'; dine: DineOption }
  | { type: 'setEntryMode'; mode: EntryMode }
  | { type: 'setCategory'; value: Category }
  | { type: 'setTemp'; value: 'ice' | 'hot' }
  | { type: 'setSweetness'; value: Sweetness }
  | { type: 'setCoffeeTaste'; value: CoffeeTaste }
  | { type: 'selectMenu'; menu: Menu }
  // addedAt 은 reducer 를 순수하게 두려고 바깥에서 만들어 넣는다.
  | { type: 'addToCart'; menu: Menu; quantity: number; addedAt: number }
  | { type: 'removeFromCart'; menuId: string }
  | { type: 'clearCart' }
  // 대기번호와 바코드 값 모두 reducer 를 순수하게 두려고 바깥에서 만들어 넣는다.
  | { type: 'confirmOrder'; waitingNumber: string; barcodeValue: string }
  | { type: 'resetAnswers' }
  | { type: 'resetAll' }

const emptyAnswers: Answers = { category: null, temp: null, sweetness: null, coffeeTaste: null }

function createInitialState(): OrderState {
  return {
    store: detectNearestStore(),
    dine: null,
    // 시작 화면에서 [시작하기] 로 들어오는 것이 기본 흐름이다.
    // [말로 주문하기] 로 들어오면 그 화면에서 'voice' 로 바꾼다.
    entryMode: 'button',
    answers: { ...emptyAnswers },
    selectedMenu: null,
    cart: [],
    waitingNumber: null,
    barcodeValue: null,
    // 예전에 소리를 꺼 둔 기기가 있어도 저장된 값을 읽지 않고 항상 켠다.
    soundOn: true,
  }
}

function reducer(state: OrderState, action: Action): OrderState {
  switch (action.type) {
    case 'setDine':
      return { ...state, dine: action.dine }
    case 'setEntryMode':
      // 화면에 들어올 때마다 부르므로, 같은 값이면 상태를 그대로 돌려준다.
      // (새 객체를 만들면 그것만으로 다시 그려지고, 그 화면이 또 부르는 일이 반복된다)
      if (state.entryMode === action.mode) return state
      return { ...state, entryMode: action.mode }
    case 'setCategory':
      // 종류를 바꾸면 세 번째 질문 자체가 바뀐다. (커피는 '어떤 맛', 음료는 '당도')
      // 앞서 고르신 답이 남아 있으면 묻지도 않은 답으로 추천이 나오므로 함께 비운다.
      if (state.answers.category === action.value) {
        return { ...state, answers: { ...state.answers, category: action.value } }
      }
      return {
        ...state,
        answers: { ...state.answers, category: action.value, sweetness: null, coffeeTaste: null },
      }
    case 'setTemp':
      return { ...state, answers: { ...state.answers, temp: action.value } }
    case 'setSweetness':
      return { ...state, answers: { ...state.answers, sweetness: action.value } }
    case 'setCoffeeTaste':
      return { ...state, answers: { ...state.answers, coffeeTaste: action.value } }
    case 'selectMenu':
      // 메뉴만 고른 상태. 잔 수는 다음 화면에서 고른다.
      return { ...state, selectedMenu: action.menu, waitingNumber: null }
    case 'addToCart': {
      // 같은 메뉴를 또 담으면 줄을 새로 만들지 않고 잔 수만 더한다.
      const existing = state.cart.find((item) => item.menu.id === action.menu.id)
      const cart = existing
        ? state.cart.map((item) =>
            item.menu.id === action.menu.id
              ? { ...item, quantity: item.quantity + action.quantity }
              : item,
          )
        : [
            ...state.cart,
            { menu: action.menu, quantity: action.quantity, addedAt: action.addedAt },
          ]
      // selectedMenu 는 비우지 않는다. 담긴 직후에도 잔 수 화면이 400ms 동안 그대로
      // 떠 있어야 하는데, 여기서 비우면 그 화면이 곧바로 되돌아가 버린다.
      return { ...state, cart, waitingNumber: null }
    }
    case 'removeFromCart':
      return { ...state, cart: state.cart.filter((item) => item.menu.id !== action.menuId) }
    case 'clearCart':
      return { ...state, cart: [] }
    case 'confirmOrder':
      return { ...state, waitingNumber: action.waitingNumber, barcodeValue: action.barcodeValue }
    case 'resetAnswers':
      // '다시 고를래요' / '더 담을래요' — 질문 3개만 처음으로 되돌린다.
      // 드실 곳(dine)과 매장은 다시 묻지 않으려고 그대로 둔다.
      // 담아 둔 장바구니(cart)도 그대로 둔다. 더 담으려고 돌아가는 것이기 때문이다.
      // 어떻게 시작하셨는지(entryMode)도 그대로 둔다. 이 값이 바로 지금 어디로 돌아갈지를 정한다.
      // 추천 결과는 answers 에서 그때그때 계산하므로 answers 만 비우면 함께 사라진다.
      return {
        ...state,
        answers: { ...emptyAnswers },
        selectedMenu: null,
        waitingNumber: null,
      }
    case 'resetAll':
      // 주문을 마치고 처음으로 — 드실 곳과 시작 방법까지 포함해 전부 비운다.
      return createInitialState()
    default:
      return state
  }
}

/** 1000~9999 사이의 네 자리 대기번호를 만든다. */
function createWaitingNumber(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

/**
 * '다시 고를래요' / '더 담을래요' 로 되돌아갈 화면.
 * 말로 시작하신 분은 말하는 화면으로, 버튼으로 시작하신 분은 첫 질문으로 돌아간다.
 */
export function pickAgainPath(mode: EntryMode): string {
  return mode === 'voice' ? '/voice' : '/q/1'
}

interface OrderContextValue {
  state: OrderState
  setDine: (dine: DineOption) => void
  /** 주문을 시작한 방법을 기록한다. 각 입구 화면(말하기 / 드실 곳)이 들어올 때 부른다. */
  setEntryMode: (mode: EntryMode) => void
  setCategory: (value: Category) => void
  setTemp: (value: 'ice' | 'hot') => void
  /** 음료를 고르셨을 때의 세 번째 답 */
  setSweetness: (value: Sweetness) => void
  /** 커피를 고르셨을 때의 세 번째 답 */
  setCoffeeTaste: (value: CoffeeTaste) => void
  selectMenu: (menu: Menu) => void
  /** 잔 수까지 정한 메뉴를 장바구니에 담는다. 같은 메뉴면 잔 수만 더해진다. */
  addToCart: (menu: Menu, quantity: number) => void
  removeFromCart: (menuId: string) => void
  clearCart: () => void
  confirmOrder: () => void
  /** 질문 3개의 답변만 초기화 (드실 곳·매장·장바구니·시작 방법은 유지) */
  resetAnswers: () => void
  /** 드실 곳과 장바구니까지 포함해 주문 상태 전체를 초기화 */
  resetAll: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const value = useMemo<OrderContextValue>(
    () => ({
      state,
      setDine: (dine) => dispatch({ type: 'setDine', dine }),
      setEntryMode: (mode) => dispatch({ type: 'setEntryMode', mode }),
      setCategory: (value) => dispatch({ type: 'setCategory', value }),
      setTemp: (value) => dispatch({ type: 'setTemp', value }),
      setSweetness: (value) => dispatch({ type: 'setSweetness', value }),
      setCoffeeTaste: (value) => dispatch({ type: 'setCoffeeTaste', value }),
      selectMenu: (menu) => dispatch({ type: 'selectMenu', menu }),
      addToCart: (menu, quantity) =>
        dispatch({ type: 'addToCart', menu, quantity, addedAt: Date.now() }),
      removeFromCart: (menuId) => dispatch({ type: 'removeFromCart', menuId }),
      clearCart: () => dispatch({ type: 'clearCart' }),
      confirmOrder: () => {
        const waitingNumber = createWaitingNumber()
        // 바코드 값 하나에 대기번호와 담은 것을 함께 담는다.
        // 매장 기계가 이 값만 읽어도 주문 전체를 되살릴 수 있어야 한다. (lib/orderCode.ts)
        const barcodeValue = createBarcodeValue(
          waitingNumber,
          state.cart.map((item) => ({ menuId: item.menu.id, quantity: item.quantity })),
        )
        dispatch({ type: 'confirmOrder', waitingNumber, barcodeValue })

        // 같은 브라우저의 키오스크 시연 화면에도 알린다.
        // 듣는 곳이 없거나 실패해도 주문에는 아무 영향이 없다.
        publishOrder({
          waitingNumber,
          barcodeValue,
          lines: state.cart.map((item) => ({
            menuId: item.menu.id,
            menuName: item.menu.name,
            quantity: item.quantity,
            price: item.menu.price,
          })),
          total: cartTotal(state.cart),
          dine: state.dine ?? 'store',
          at: Date.now(),
        })
      },
      resetAnswers: () => dispatch({ type: 'resetAnswers' }),
      resetAll: () => dispatch({ type: 'resetAll' }),
    }),
    [state],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder 는 OrderProvider 안에서만 쓸 수 있습니다.')
  return ctx
}
