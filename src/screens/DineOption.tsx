import { useNavigate } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import { MugIcon, TakeoutIcon } from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'

/** 좁은 화면에서 줄이 바뀔 자리를 이 덩어리로 정한다. (QuestionTitle 참고) */
const QUESTION_LINES = ['식사는 어떻게', '하시겠어요?']
const QUESTION = QUESTION_LINES.join(' ')

/**
 * 2. 식사 장소 선택
 * 진행 인디케이터는 넣지 않는다. (질문 3개는 다음 화면부터 센다)
 * 질문 화면들과 똑같이, 카드를 누르면 [다음] 없이 저절로 넘어간다.
 */
export default function DineOption() {
  const navigate = useNavigate()
  const { state, setDine } = useOrder()
  const { advance, cancel } = useAutoAdvance()

  useScreenSpeech(`${QUESTION} 매장에서 드실지, 포장하실지 골라 주세요.`)

  const handleBack = () => {
    cancel()
    navigate('/')
  }

  return (
    <ScreenLayout onBack={handleBack} subtitle="둘 중 하나를 손가락으로 눌러 주세요">
      <QuestionTitle lines={QUESTION_LINES} />

      <div className="mt-8 flex flex-col gap-5">
        <ChoiceCard
          icon={<MugIcon size={64} />}
          title="매장에서 먹기"
          caption="가게 안에서 드세요"
          selected={state.dine === 'store'}
          onClick={() => advance('/q/1', () => setDine('store'))}
        />
        <ChoiceCard
          icon={<TakeoutIcon size={64} />}
          title="포장하기"
          caption="들고 나가실 수 있어요"
          selected={state.dine === 'togo'}
          onClick={() => advance('/q/1', () => setDine('togo'))}
        />
      </div>
    </ScreenLayout>
  )
}
