import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import ProgressDots from '../components/ProgressDots'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import {
  BeanIcon,
  CoffeeIcon,
  ColdIcon,
  DrinkIcon,
  DropIcon,
  HotIcon,
  PlainIcon,
  SweetIcon,
} from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'
import type { Category, CoffeeTaste, Sweetness, Temp } from '../types'

/** 질문 3개 — 화면 구조가 같아 한 컴포넌트로 처리한다. */
const TOTAL = 3

type StepValue = string

interface StepConfig {
  /** 질문. 좁은 화면에서 줄이 바뀔 자리를 이 덩어리로 정한다. (QuestionTitle 참고) */
  question: string[]
  /** 음성으로 읽어 줄 문장 (질문 + 선택지 안내) */
  speech: string
  subtitle: string
  options: {
    value: StepValue
    label: string
    /** 한 줄 설명. 말만으로는 무엇이 다른지 알기 어려운 선택지에만 붙인다. */
    caption?: string
    icon: React.ReactNode
  }[]
}

/** 종류·온도 — 커피든 음료든 똑같이 여쭙는다. */
const STEPS: Record<number, StepConfig> = {
  1: {
    question: ['어떤 메뉴를', '준비해 드릴까요?'],
    speech: '어떤 메뉴를 준비해 드릴까요? 커피와 음료 중에서 골라 주세요.',
    subtitle: '고르시면 다음 질문으로 넘어가요',
    options: [
      { value: 'coffee', label: '커피', icon: <CoffeeIcon size={64} /> },
      { value: 'beverage', label: '음료', icon: <DrinkIcon size={64} /> },
    ],
  },
  2: {
    question: ['온도는 어떻게', '하시겠어요?'],
    speech: '온도는 어떻게 하시겠어요? 시원한 것과 따뜻한 것 중에서 골라 주세요.',
    subtitle: '고르시면 다음 질문으로 넘어가요',
    options: [
      { value: 'ice', label: '시원함', icon: <ColdIcon size={64} /> },
      { value: 'hot', label: '따뜻함', icon: <HotIcon size={64} /> },
    ],
  },
}

/**
 * 세 번째 질문 — 음료를 고르셨을 때. 예전 그대로 당도를 여쭙는다.
 */
const STEP3_BEVERAGE: StepConfig = {
  question: ['당도는 어떻게', '맞춰드릴까요?'],
  speech: '당도는 어떻게 맞춰드릴까요? 달콤한 맛과 담백한 맛 중에서 골라 주세요.',
  subtitle: '마지막 질문이에요',
  options: [
    { value: 'sweet', label: '달콤함', icon: <SweetIcon size={64} /> },
    { value: 'plain', label: '담백함', icon: <PlainIcon size={64} /> },
  ],
}

/**
 * 세 번째 질문 — 커피를 고르셨을 때.
 *
 * 커피에 '당도' 를 여쭙는 것은 어색해서 맛의 결을 여쭙는다.
 * 세 가지를 넘기지 않는다. 선택지가 넷이 되면 한 화면에 다 담기지 않고,
 * 고르는 일 자체가 일이 된다.
 *
 * 말은 어르신이 평소 쓰시는 표현으로만 쓴다.
 * ('산미', '바디감', '쓴맛' 같은 커피 전문 용어는 쓰지 않는다)
 */
const STEP3_COFFEE: StepConfig = {
  question: ['어떤 맛으로', '드릴까요?'],
  speech: '어떤 맛으로 드릴까요? 연하게, 진하게, 달콤하게 중에서 골라 주세요.',
  subtitle: '마지막 질문이에요',
  options: [
    { value: 'light', label: '연하게', caption: '부드럽고 순한 맛', icon: <DropIcon size={64} /> },
    { value: 'strong', label: '진하게', caption: '깊고 묵직한 맛', icon: <BeanIcon size={64} /> },
    { value: 'sweet', label: '달콤하게', caption: '우유와 단맛', icon: <SweetIcon size={64} /> },
  ],
}

export default function Question() {
  const { step: stepParam } = useParams()
  const navigate = useNavigate()
  const { state, setCategory, setTemp, setSweetness, setCoffeeTaste } = useOrder()
  const { advance, cancel } = useAutoAdvance()

  const step = Number(stepParam)
  /** 세 번째 질문은 커피냐 음료냐에 따라 아예 다른 질문이 된다. */
  const isCoffee = state.answers.category === 'coffee'
  const config = step === 3 ? (isCoffee ? STEP3_COFFEE : STEP3_BEVERAGE) : STEPS[step]

  // 잘못된 주소로 들어오면 처음 질문으로 되돌린다.
  useEffect(() => {
    if (!config) navigate('/dine', { replace: true })
  }, [config, navigate])

  useScreenSpeech(config ? config.speech : '')

  if (!config) return null

  const selected =
    step === 1
      ? state.answers.category
      : step === 2
        ? state.answers.temp
        : isCoffee
          ? state.answers.coffeeTaste
          : state.answers.sweetness

  const handleSelect = (value: StepValue) => {
    advance(step < TOTAL ? `/q/${step + 1}` : '/result', () => {
      if (step === 1) setCategory(value as Category)
      else if (step === 2) setTemp(value as Temp)
      else if (isCoffee) setCoffeeTaste(value as CoffeeTaste)
      else setSweetness(value as Sweetness)
    })
  }

  const handleBack = () => {
    cancel()
    navigate(step > 1 ? `/q/${step - 1}` : '/dine')
  }

  // 선택지가 셋이면 카드를 조금 낮춰 세 장이 스크롤 없이 한 화면에 들어가게 한다.
  const compact = config.options.length > 2

  return (
    <ScreenLayout onBack={handleBack} subtitle={config.subtitle}>
      {/* 점만 있는 진행 표시. 높이(28px)는 예전 자리 그대로라 질문 위치는 변하지 않는다. */}
      <ProgressDots total={TOTAL} current={step} />

      <QuestionTitle lines={config.question} className="mt-6" />

      <div className={compact ? 'mt-6 flex flex-col gap-4' : 'mt-8 flex flex-col gap-5'}>
        {config.options.map((option) => (
          <ChoiceCard
            key={option.value}
            icon={option.icon}
            title={option.label}
            caption={option.caption}
            emphasis="large"
            size={compact ? 'compact' : 'default'}
            selected={selected === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </ScreenLayout>
  )
}
