import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import ProgressDots from '../components/ProgressDots'
import ScreenLayout from '../components/ScreenLayout'
import {
  CoffeeIcon,
  ColdIcon,
  DrinkIcon,
  HotIcon,
  PlainIcon,
  SweetIcon,
} from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'

/** 질문 3개 — 화면 구조가 같아 한 컴포넌트로 처리한다. */
const TOTAL = 3

type StepValue = string

interface StepConfig {
  question: string
  /** 음성으로 읽어 줄 문장 (질문 + 선택지 안내) */
  speech: string
  subtitle: string
  options: {
    value: StepValue
    label: string
    icon: React.ReactNode
  }[]
}

const STEPS: Record<number, StepConfig> = {
  1: {
    question: '어떤 메뉴를 준비해 드릴까요?',
    speech: '어떤 메뉴를 준비해 드릴까요? 커피와 음료 중에서 골라 주세요.',
    subtitle: '고르시면 다음 질문으로 넘어가요',
    options: [
      { value: 'coffee', label: '커피', icon: <CoffeeIcon size={64} /> },
      { value: 'beverage', label: '음료', icon: <DrinkIcon size={64} /> },
    ],
  },
  2: {
    question: '온도는 어떻게 하시겠어요?',
    speech: '온도는 어떻게 하시겠어요? 시원한 것과 따뜻한 것 중에서 골라 주세요.',
    subtitle: '고르시면 다음 질문으로 넘어가요',
    options: [
      { value: 'ice', label: '시원함', icon: <ColdIcon size={64} /> },
      { value: 'hot', label: '따뜻함', icon: <HotIcon size={64} /> },
    ],
  },
  3: {
    question: '당도는 어떻게 맞춰드릴까요?',
    speech: '당도는 어떻게 맞춰드릴까요? 달콤한 맛과 담백한 맛 중에서 골라 주세요.',
    subtitle: '마지막 질문이에요',
    options: [
      { value: 'sweet', label: '달콤함', icon: <SweetIcon size={64} /> },
      { value: 'plain', label: '담백함', icon: <PlainIcon size={64} /> },
    ],
  },
}

export default function Question() {
  const { step: stepParam } = useParams()
  const navigate = useNavigate()
  const { state, setCategory, setTemp, setSweetness } = useOrder()
  const { advance, cancel } = useAutoAdvance()

  const step = Number(stepParam)
  const config = STEPS[step]

  // 잘못된 주소로 들어오면 처음 질문으로 되돌린다.
  useEffect(() => {
    if (!config) navigate('/dine', { replace: true })
  }, [config, navigate])

  useScreenSpeech(config ? config.speech : '')

  if (!config) return null

  const selected =
    step === 1 ? state.answers.category : step === 2 ? state.answers.temp : state.answers.sweetness

  const handleSelect = (value: StepValue) => {
    advance(step < TOTAL ? `/q/${step + 1}` : '/result', () => {
      if (step === 1) setCategory(value as 'coffee' | 'beverage')
      else if (step === 2) setTemp(value as 'ice' | 'hot')
      else setSweetness(value as 'sweet' | 'plain')
    })
  }

  const handleBack = () => {
    cancel()
    navigate(step > 1 ? `/q/${step - 1}` : '/dine')
  }

  return (
    <ScreenLayout onBack={handleBack} subtitle={config.subtitle}>
      <ProgressDots total={TOTAL} current={step} />

      <h1 className="mt-6 text-question font-bold text-ink">{config.question}</h1>

      <div className="mt-8 flex flex-col gap-5">
        {config.options.map((option) => (
          <ChoiceCard
            key={option.value}
            icon={option.icon}
            title={option.label}
            emphasis="large"
            selected={selected === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </ScreenLayout>
  )
}
