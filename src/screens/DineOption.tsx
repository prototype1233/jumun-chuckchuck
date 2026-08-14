import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import { MugIcon, TakeoutIcon } from '../components/Icons'
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
    <ScreenLayout onBack={handleBack} subtitle="둘 중 하나를 손가락으로 눌러 주세요">
      <QuestionTitle lines={QUESTION_LINES} />

      <div className="mt-8 flex flex-col gap-5">
        {/* emphasis="dine": 제목 32px + 설명 22px.
            글씨가 커진 만큼 카드 좌우 여백을 줄여(ChoiceCard 참고) 제목은 한 줄에 들어가고,
            설명은 줄이 바뀌더라도 '들고 나가실 수 / 있어요' 처럼 낱말 단위로만 나뉜다. */}
        <ChoiceCard
          icon={<MugIcon size={64} />}
          title="매장에서 마시기"
          caption="가게 안에서 드세요"
          emphasis="dine"
          selected={state.dine === 'store'}
          onClick={() => advance('/q/1', () => setDine('store'))}
        />
        <ChoiceCard
          icon={<TakeoutIcon size={64} />}
          title="포장하기"
          caption="들고 나가실 수 있어요"
          emphasis="dine"
          selected={state.dine === 'togo'}
          onClick={() => advance('/q/1', () => setDine('togo'))}
        />
      </div>
    </ScreenLayout>
  )
}
