import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'
import { speechOf } from '../lib/speech'

/** 좁은 화면에서 줄이 바뀔 자리를 이 덩어리로 정한다. (QuestionTitle 참고) */
const QUESTION_LINES = ['어디에서', '드시겠어요?']
const QUESTION = QUESTION_LINES.join(' ')

/**
 * 읽어 줄 문장. 화면에는 질문만 짧게 두고, 소리로는 한마디를 더 얹는다.
 * 고르는 데 시간이 걸려도 괜찮다는 말을 들으셔야 서두르지 않으신다.
 */
const QUESTION_SPEECH = '어디에서 드시겠어요? 천천히 고르셔도 괜찮아요.'

/**
 * 2. 드실 곳 선택
 *
 * 여기는 카페다. '식사' 가 아니라 '마시는 것' 이므로 어느 문구에도 밥집 말투를 쓰지 않는다.
 * 진행 인디케이터는 넣지 않는다. (질문 3개는 다음 화면부터 센다)
 * 질문 화면들과 똑같이, 카드를 누르면 [다음] 없이 저절로 넘어간다.
 */
export default function DineOption() {
  const navigate = useNavigate()
  const { state, setDine, setEntryMode } = useOrder()
  const { advance, cancel } = useAutoAdvance()

  // 버튼으로 고르는 흐름의 입구. 나중에 [다시 고를래요] 가 첫 질문으로 돌아가야 한다.
  // (말로 주문하다가 [버튼으로 고를래요] 로 넘어오신 경우도 여기서 갈아 끼워진다)
  useEffect(() => {
    setEntryMode('button')
  }, [setEntryMode])

  useScreenSpeech(speechOf(QUESTION, QUESTION_SPEECH))

  const handleBack = () => {
    cancel()
    navigate('/')
  }

  return (
    <ScreenLayout onBack={handleBack}>
      <QuestionTitle lines={QUESTION_LINES} />

      {/* 질문 바로 아래에 붙이고(--gap-question), 남는 자리는 카드 둘이 나눠 갖는다.
          카드가 flex-1 이라 화면 아래가 비지 않는다. (ChoiceCard 참고) */}
      <div className="mt-[var(--gap-question)] flex flex-1 flex-col gap-[var(--gap-card)]">
        {/* emphasis="dine": 카드 한가운데 라벨(44px) 하나뿐이다.
            64px 아이콘과 '가게 안에서 드세요' 같은 보조 설명을 모두 걷어냈다.

            질문 화면 라벨은 52px 인데 여기만 44px 인 것은 '매장에서 마시기' 가 일곱 글자라서다.
            44px 일 때 이 라벨의 폭이 269px 인데, 카드 안쪽 폭은 375px 화면에서 289px,
            가장 좁은 360px 화면에서 274px 다. 여기서 한 글자라도 더 키우면(46px = 284px)
            360px 화면에서 '매장에서 / 마시기' 로 접힌다. */}
        <ChoiceCard
          title="매장에서 마시기"
          emphasis="dine"
          selected={state.dine === 'store'}
          onClick={() => advance('/q/1', () => setDine('store'))}
        />
        <ChoiceCard
          title="포장하기"
          emphasis="dine"
          selected={state.dine === 'togo'}
          onClick={() => advance('/q/1', () => setDine('togo'))}
        />
      </div>
    </ScreenLayout>
  )
}
