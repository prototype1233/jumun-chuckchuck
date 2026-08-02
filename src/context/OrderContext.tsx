import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { detectNearestStore } from '../data/stores'
import type { Answers, CartItem, Category, DineOption, Menu, Sweetness, Store } from '../types'

/**
 * 주문 상태 — 외부 상태관리 라이브러리 없이 Context + useReducer 만 사용한다.
 * 매장(store)은 GPS로 자동 인식된 값으로 내부 상태에만 두고 화면에는 노출하지 않는다.
 */
interface OrderState {
  store: Store
  dine: DineOption | null
  answers: Answers
  /** 잔 수를 고르는 중인 메뉴 */
  selectedMenu: Menu | null
  /** 담은 음료들. 담은 순서대로 둔다. */
  cart: CartItem[]
  waitingNumber: string | null
  /**
   * 음성 안내 켜짐 여부 — 언제나 true.
   * 끄는 버튼을 없앴으므로 값이 바뀌는 곳은 없다.
   * useSpeech 가 이 값을 보고 있어서 자리는 그대로 남겨 둔다.
   */
  soundOn: boolean
}

type Action =
  | { type: 'setDine'; dine: DineOption }
  | { type: 'setCategory'; value: Category }
  | { type: 'setTemp'; value: 'ice' | 'hot' }
  | { type: 'setSweetness'; value: Sweetness }
  | { type: 'selectMenu'; menu: Menu }
  // addedAt 은 reducer 를 순수하게 두려고 바깥에서 만들어 넣는다.
  | { type: 'addToCart'; menu: Menu; quantity: number; addedAt: number }
  | { type: 'removeFromCart'; menuId: string }
  | { type: 'clearCart' }
  | { type: 'confirmOrder'; waitingNumber: string }
  | { type: 'resetAnswers' }
  | { type: 'resetAll' }

const emptyAnswers: Answers = { category: null, temp: null, sweetness: null }

function createInitialState(): OrderState {
  return {
    store: detectNearestStore(),
    dine: null,
    answers: { ...emptyAnswers },
    selectedMenu: null,
    cart: [],
    waitingNumber: null,
    // 예전에 소리를 꺼 둔 기기가 있어도 저장된 값을 읽지 않고 항상 켠다.
    soundOn: true,
  }
}

function reducer(state: OrderState, action: Action): OrderState {
  switch (action.type) {
    case 'setDine':
      return { ...state, dine: action.dine }
    case 'setCategory':
      return { ...state, answers: { ...state.answers, category: action.value } }
    case 'setTemp':
      return { ...state, answers: { ...state.answers, temp: action.value } }
    case 'setSweetness':
      return { ...state, answers: { ...state.answers, sweetness: action.value } }
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
      return { ...state, waitingNumber: action.waitingNumber }
    case 'resetAnswers':
      // '다시 고를래요' / '더 담을래요' — 질문 3개만 처음으로 되돌린다.
      // 식사 장소(dine)와 매장은 다시 묻지 않으려고 그대로 둔다.
      // 담아 둔 장바구니(cart)도 그대로 둔다. 더 담으려고 돌아가는 것이기 때문이다.
      // 추천 결과는 answers 에서 그때그때 계산하므로 answers 만 비우면 함께 사라진다.
      return {
        ...state,
        answers: { ...emptyAnswers },
        selectedMenu: null,
        waitingNumber: null,
      }
    case 'resetAll':
      // 주문을 마치고 처음으로 — 식사 장소까지 포함해 전부 비운다.
      return createInitialState()
    default:
      return state
  }
}

/** 1000~9999 사이의 네 자리 대기번호를 만든다. */
function createWaitingNumber(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

interface OrderContextValue {
  state: OrderState
  setDine: (dine: DineOption) => void
  setCategory: (value: Category) => void
  setTemp: (value: 'ice' | 'hot') => void
  setSweetness: (value: Sweetness) => void
  selectMenu: (menu: Menu) => void
  /** 잔 수까지 정한 메뉴를 장바구니에 담는다. 같은 메뉴면 잔 수만 더해진다. */
  addToCart: (menu: Menu, quantity: number) => void
  removeFromCart: (menuId: string) => void
  clearCart: () => void
  confirmOrder: () => void
  /** 질문 3개의 답변만 초기화 (식사 장소·매장·장바구니는 유지) */
  resetAnswers: () => void
  /** 식사 장소와 장바구니까지 포함해 주문 상태 전체를 초기화 */
  resetAll: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const value = useMemo<OrderContextValue>(
    () => ({
      state,
      setDine: (dine) => dispatch({ type: 'setDine', dine }),
      setCategory: (value) => dispatch({ type: 'setCategory', value }),
      setTemp: (value) => dispatch({ type: 'setTemp', value }),
      setSweetness: (value) => dispatch({ type: 'setSweetness', value }),
      selectMenu: (menu) => dispatch({ type: 'selectMenu', menu }),
      addToCart: (menu, quantity) =>
        dispatch({ type: 'addToCart', menu, quantity, addedAt: Date.now() }),
      removeFromCart: (menuId) => dispatch({ type: 'removeFromCart', menuId }),
      clearCart: () => dispatch({ type: 'clearCart' }),
      confirmOrder: () =>
        dispatch({ type: 'confirmOrder', waitingNumber: createWaitingNumber() }),
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
