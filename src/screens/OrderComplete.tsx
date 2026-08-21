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
  '이 그림을 기계에 대세요',
  '카드를 넣으면 끝이에요',
]

/**
 * 7. 주문 완료
 * ※ 이 앱에서는 절대 결제하지 않는다. 결제는 매장 기계에서 카드로만 한다.
 *    (계좌 연동도, 카드 등록도 없다는 점이 이 서비스의 핵심이다.)
 *
 * 이 화면이 하는 일은 하나다 — 바코드를 스캐너에 대기 좋게 보여 주는 것.
 * 그래서 대기번호 네 자리도, 잔 수도 여기서는 보여 주지 않는다.
 * 비운 자리는 전부 바코드 크기로 갔다. 클수록 잘 읽힌다.
 *
 * 대기번호는 없어진 것이 아니라 화면에 내놓지 않을 뿐이다.
 * 값은 그대로 만들어지고 바코드 안에 담긴다(JC + 대기번호 4자리 + 주문 — lib/orderCode.ts).
 * 바코드 아래 적어 둔 값에도 그 네 자리가 들어 있어서, 스캐너가 못 읽으면
 * 키오스크 번호판으로 그대로 넘어갈 수 있다. (screens/Kiosk.tsx 의 번호 입력)
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
      ? `주문이 준비됐어요. 음료 ${cups}잔을 준비할게요. 가게 기계 앞으로 가셔서 아래 줄무늬 그림을 기계에 대 주세요. 그다음 카드를 넣으시면 끝이에요.`
      : '',
  )

  const handleHome = () => {
    resetAll()
    navigate('/')
  }

  if (!waitingNumber) return null

  return (
    <>
      <ScreenLayout onBack={handleHome} backLabel="처음으로">
        <div className="flex shrink-0 flex-col items-center">
          {/* 그림·글씨·여백 모두 창 높이에 따라 함께 줄어든다. (src/index.css 토큰) */}
          <CheckCircleIcon size="var(--icon-done)" className="text-brand" />
          {/* 안내 글씨(40px)에 자리를 내주느라 그림 아래 여백을 8 -> 4px 로 줄였다 */}
          <h1 className="mt-1 text-screen-title font-bold text-ink">주문이 준비됐어요</h1>
        </div>

        {/* 남는 세로 자리는 전부 여기로 온다. 위아래 여백은 창이 짧아지면 먼저 줄어들고,
            바코드는 그 안에서 가운데 놓인다.
            -mx-6 으로 본문 좌우 여백을 걷어내야 아래 폭이 '화면 기준' 이 된다. */}
        <div className="-mx-6 flex min-h-0 w-[calc(100%+48px)] flex-1 items-center justify-center py-[var(--stack-md)]">
          {barcodeValue && (
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="바코드 크게 보기"
              // 스캐너 인식률을 위해 배경은 반드시 흰색.
              // h-full — 위아래가 정해지고 남은 자리를 그대로 받는다. 뷰포트 높이(vh)로 재지 않는 이유는
              // 안내 글씨가 두 줄로 접히느냐에 따라 남는 자리가 크게 달라지기 때문이다.
              // vh 로 잡으면 375x667 처럼 짧은 기기에서 카드가 안내 위로 삐져나온다.
              className="flex h-full max-h-[300px] w-[92%] flex-col rounded-2xl bg-white px-3 py-3 shadow-card active:scale-[0.99]"
            >
              {/* 남는 세로는 전부 막대가 가져간다. 폭(92%)은 어느 기기에서도 건드리지 않는다 —
                  인식률을 정하는 것은 막대의 굵기, 즉 가로다. 세로는 스캐너가 조준할 만하면 된다.
                  height 는 그림 자체의 기준 높이다. 크게 늘려도 막대가 뭉개지지 않게 함께 올렸다. */}
              <Barcode value={barcodeValue} height={200} className="min-h-0 w-full flex-1" />
              {/* 스캐너로 읽힌 값이 맞는지 눈으로 확인하는 줄. 대기번호 네 자리도 이 안에 들어 있어
                  바코드를 못 읽을 때 키오스크 번호판으로 넘어갈 수 있다. (lib/orderCode.ts)
                  자간을 줄여 한 줄에 붙잡아 둔다 — 줄이 바뀌면 바코드가 밀려 대기 어려워진다. */}
              <span className="mt-2 w-full shrink-0 truncate text-center text-sub font-semibold tracking-[0.08em] text-black">
                {barcodeValue}
              </span>
            </button>
          )}
        </div>

        {/* 이 화면에서 가장 큰 글씨(40px). 자리가 모자라면 위 바코드 칸이 먼저 줄어들고
            이 안내는 끝까지 그대로 남는다 — 매장 기계 앞에서 읽을 글이라서다.

            mx-auto w-fit max-w-full: 덩어리는 화면 가운데, 안쪽은 왼쪽 정렬.
            세 줄 모두 배지가 같은 x 에서 시작하므로 문구 길이가 달라도 시작선이 흔들리지 않는다. */}
        <ol className="mx-auto flex w-fit max-w-full shrink-0 flex-col gap-[var(--gap-steps)]">
          {STEPS.map((text, index) => (
            <li key={text} className="flex shrink-0 items-start gap-5">
              {/* items-start + 첫 줄 높이만큼의 보정 = 배지가 언제나 '첫 줄' 한가운데에 온다.
                  한 줄짜리 문구면 그대로 세로 가운데가 되고, 두 줄로 접혀도 배지는 첫 줄에 머문다.
                  (items-center 로 두면 두 줄일 때 배지가 두 줄 사이로 내려가 시작선이 어긋나 보인다) */}
              <span className="mt-[calc((var(--lh-step)-var(--circle-step))/2)] flex h-[var(--circle-step)] w-[var(--circle-step)] shrink-0 items-center justify-center rounded-full bg-brand text-step-num font-bold text-white">
                {index + 1}
              </span>
              {/* 40px 이면 한 줄에 담기지 않는다. break-keep 이라 '가게 기계 / 앞으로 가세요' 처럼
                  낱말 단위로만 접힌다. (한글은 기본값이면 아무 글자에서나 잘린다) */}
              <span className="break-keep text-step font-medium text-ink">{text}</span>
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
