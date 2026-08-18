import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Barcode from '../components/Barcode'
import ScreenLayout from '../components/ScreenLayout'
import { CheckCircleIcon } from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { useScreenSpeech } from '../hooks/useSpeech'
import { useWakeLock } from '../hooks/useWakeLock'
import { saveOrder } from '../lib/history'
import { cartCups } from '../logic/cart'

/** 기계 앞에서 할 일 세 가지 */
const STEPS = [
  '가게 기계 앞으로 가세요',
  '화면에 번호를 누르거나, 이 그림을 기계에 대세요',
  '카드를 넣으면 끝이에요',
]

/**
 * 7. 주문 완료
 * ※ 이 앱에서는 절대 결제하지 않는다. 결제는 매장 기계에서 카드로만 한다.
 *    (계좌 연동도, 카드 등록도 없다는 점이 이 서비스의 핵심이다.)
 *
 * 매장 기계에 주문을 넣는 방법을 두 가지로 둔다. 매장 사정에 따라 편한 쪽을 쓰면 된다.
 *   1) 대기번호 4자리를 키오스크 화면에 직접 누른다 (예전부터 있던 방법)
 *   2) 바코드를 스캐너에 댄다
 * 둘은 같은 주문을 가리킨다. 어느 쪽이 막혀도 나머지 하나로 주문할 수 있다.
 */
export default function OrderComplete() {
  const navigate = useNavigate()
  const { state, resetAll } = useOrder()
  const waitingNumber = state.waitingNumber
  const barcodeValue = state.barcodeValue
  const cups = cartCups(state.cart)

  /** 바코드를 크게 펼쳐 놓았는지. 스캐너에 대기 어려울 때 화면 가득 키워 보여 준다. */
  const [zoomed, setZoomed] = useState(false)

  // 바코드를 보여 주는 화면에서만 화면이 꺼지지 않게 붙잡는다.
  // 이 화면을 벗어나면 훅의 정리 함수가 반드시 놓아 준다.
  useWakeLock(Boolean(waitingNumber))

  // 주문 없이 들어온 경우 시작 화면으로 되돌린다.
  useEffect(() => {
    if (!waitingNumber) navigate('/', { replace: true })
  }, [waitingNumber, navigate])

  // 주문이 끝난 이 시점에 이 기기에만 기록을 남긴다. (한 주문당 한 번만)
  const savedRef = useRef(false)
  useEffect(() => {
    if (!waitingNumber || savedRef.current) return
    savedRef.current = true
    saveOrder(
      state.cart.map((item) => ({
        menuId: item.menu.id,
        menuName: item.menu.name,
        quantity: item.quantity,
        dineOption: state.dine ?? 'store',
        orderedAt: Date.now(),
      })),
    )
  }, [waitingNumber, state.cart, state.dine])

  useScreenSpeech(
    waitingNumber
      ? `주문이 준비됐어요. 대기번호는 ${waitingNumber.split('').join(' ')} 입니다. 음료 ${cups}잔을 준비할게요. 가게 기계 앞으로 가셔서 화면에 이 번호를 누르시거나, 아래 줄무늬 그림을 기계에 대 주세요. 그다음 카드를 넣으시면 끝이에요.`
      : '',
  )

  const handleHome = () => {
    resetAll()
    navigate('/')
  }

  if (!waitingNumber) return null

  return (
    <>
      <ScreenLayout onBack={handleHome} backLabel="처음으로" subtitle="천천히 하셔도 괜찮아요">
        {/* 대기번호와 바코드는 어떤 화면 크기에서도 스크롤 없이 보여야 한다.
            그래서 이 덩어리는 줄어들지도 스크롤되지도 않게 고정한다. */}
        <div className="flex shrink-0 flex-col items-center">
          {/* 그림·글씨·여백 모두 창 높이에 따라 함께 줄어든다. (src/index.css 토큰) */}
          <CheckCircleIcon size="var(--icon-done)" className="text-brand" />
          <h1 className="mt-2 text-screen-title font-bold text-ink">주문이 준비됐어요</h1>

          <p className="mt-[var(--gap-in-card)] text-sub font-semibold text-ink-sub">대기번호</p>
          <p className="text-waiting font-black text-ink">{waitingNumber}</p>
          <p className="text-body font-medium text-ink-sub">음료 {cups}잔을 준비할게요</p>

          {barcodeValue && (
            // 화면 폭의 85%. -mx-6 으로 본문 좌우 여백을 걷어내야 '화면 기준' 85% 가 된다.
            <div className="-mx-6 mt-[var(--gap-in-card)] flex w-[calc(100%+48px)] justify-center">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label="바코드 크게 보기"
                // 스캐너 인식률을 위해 배경은 반드시 흰색.
                className="w-[85%] rounded-2xl bg-white px-3 py-[var(--gap-in-card)] shadow-card active:scale-[0.99]"
              >
                {/* 규격상 최소 100px. 화면이 짧을 때만 110 → 100px 로 줄여 안내 자리를 조금 넘겨준다. */}
                <Barcode value={barcodeValue} className="h-[clamp(100px,13vh,110px)] w-full" />
                {/* 값에 주문 내용까지 담기면서 길어질 수 있다. 자간을 줄여 한 줄에 붙잡아 둔다.
                    (줄이 바뀌면 바코드가 아래로 밀려 스캐너에 대기 어려워진다) */}
                <span className="mt-1 block truncate text-center text-sub font-semibold tracking-[0.08em] text-black">
                  {barcodeValue}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 자리가 모자라면 이 안내만 스크롤된다.
            아래쪽 여백(padding)을 두지 않는다. 여백은 줄어들지 않아서
            작은 화면에서는 그만큼 위 덩어리를 밀어내기 때문이다. */}
        <ol className="mt-[var(--gap-in-card)] flex min-h-0 flex-1 flex-col gap-[var(--gap-steps)] overflow-y-auto">
          {STEPS.map((text, index) => (
            <li key={text} className="flex shrink-0 items-center gap-4">
              <span className="flex h-[var(--circle-step)] w-[var(--circle-step)] shrink-0 items-center justify-center rounded-full bg-brand-tint text-price font-bold text-brand-deep">
                {index + 1}
              </span>
              <span className="break-keep text-body font-medium text-ink">{text}</span>
            </li>
          ))}
        </ol>
      </ScreenLayout>

      {zoomed && barcodeValue && (
        // 크게 펼친 바코드. 배경은 여기서도 흰색을 유지한다.
        <button
          type="button"
          onClick={() => setZoomed(false)}
          aria-label="바코드 작게 보기"
          className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center gap-6 bg-white px-4"
        >
          <Barcode value={barcodeValue} height={160} className="h-[46vh] w-full" />
          <span className="break-all text-center text-price font-bold tracking-[0.08em] text-black">
            {barcodeValue}
          </span>
          <span className="text-sub font-medium text-ink-sub">화면을 누르면 작아져요</span>
        </button>
      )}
    </>
  )
}
