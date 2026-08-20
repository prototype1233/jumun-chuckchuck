import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChoiceCard from '../components/ChoiceCard'
import ProgressDots from '../components/ProgressDots'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import { useOrder } from '../context/OrderContext'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useScreenSpeech } from '../hooks/useSpeech'
import { speechOf } from '../lib/speech'
import type { Category, CoffeeTaste, Sweetness, Temp } from '../types'

/** 질문 3개 — 화면 구조가 같아 한 컴포넌트로 처리한다. */
const TOTAL = 3

type StepValue = string

interface StepConfig {
  /** 질문. 좁은 화면에서 줄이 바뀔 자리를 이 덩어리로 정한다. (QuestionTitle 참고) */
  question: string[]
  /**
   * 읽어 줄 문장. 적어 두지 않으면 화면의 질문을 그대로 읽는다.
   *
   * 화면 글씨는 짧을수록 읽기 쉽고, 읽어 주는 말은 선택지까지 알려 줘야 알아듣기 쉬워서
   * 둘이 갈리는 질문에만 따로 적는다.
   */
  speechText?: string
  subtitle: string
  /**
   * 선택지는 라벨 한 줄뿐이다.
   *
   * 예전에는 64px 아이콘과 '부드럽고 순한 맛' 같은 22px 한 줄 설명이 함께 있었다.
   * 둘 다 걷어내고 그 자리를 라벨 크기(52px)에 줬다.
   * 무엇이 다른지는 speechText 의 음성 안내와 자막 바가 알려 드린다.
   *
   * 라벨은 네 글자를 넘기지 않는다. 52px 에서 '달콤하게'(176px)까지가 375px 화면에 들어간다.
   */
  options: {
    value: StepValue
    label: string
  }[]
}

/** 종류·온도 — 커피든 음료든 똑같이 여쭙는다. */
const STEPS: Record<number, StepConfig> = {
  1: {
    // 56px 에서는 '어떤 메뉴를 준비해 드릴까요?' 가 세 줄이 된다.
    // (375px 화면에서 한 줄에 쓸 수 있는 폭이 327px 인데, '준비해 드릴까요?' 만으로 371px 이다)
    // 세 줄이 되면 눈이 글을 따라가다 놓치므로 화면 글씨에서 '준비해' 를 덜어 두 줄로 맞췄다.
    // 덜어낸 말은 아래 speechText 가 그대로 담고 있어 귀로 듣는 문장은 예전과 같다.
    question: ['어떤 메뉴를', '드릴까요?'],
    speechText: '어떤 메뉴를 준비해 드릴까요? 커피, 음료 중에 골라주세요.',
    subtitle: '고르시면 다음으로 넘어가요',
    options: [
      { value: 'coffee', label: '커피' },
      { value: 'beverage', label: '음료' },
    ],
  },
  2: {
    // 64px 에서는 '온도는 어떻게'(337px) 가 390px 화면의 가용 폭 342px 을 아슬아슬하게 쓰고
    // 375·360px 화면에서는 삐져나간다. 덩어리는 nowrap 이라 넘치면 잘려 보인다.
    // 그래서 화면 글씨를 '온도는 / 어떠세요?' 로 줄여 덩어리를 다섯 자 아래로 맞췄다.
    // 귀로 듣는 문장은 speechText 가 예전 그대로 담고 있다.
    question: ['온도는', '어떠세요?'],
    speechText: '온도는 어떻게 하시겠어요? 차갑게, 따뜻하게 중에 골라주세요.',
    subtitle: '고르시면 다음으로 넘어가요',
    options: [
      { value: 'ice', label: '시원함' },
      { value: 'hot', label: '따뜻함' },
    ],
  },
}

/**
 * 세 번째 질문 — 음료를 고르셨을 때. 예전 그대로 당도를 여쭙는다.
 */
const STEP3_BEVERAGE: StepConfig = {
  // '맞춰드릴까요?' 는 64px 에서 365px 이라 어느 화면에서도 한 줄에 들어가지 않는다.
  // (390px 화면의 가용 폭이 342px 이다) 화면 글씨만 '당도는 / 어떠세요?' 로 줄였다.
  question: ['당도는', '어떠세요?'],
  speechText: '당도는 어떻게 맞춰드릴까요? 달콤한 맛과 담백한 맛 중에 골라주세요.',
  subtitle: '마지막 질문이에요',
  options: [
    { value: 'sweet', label: '달콤함' },
    { value: 'plain', label: '담백함' },
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
  speechText: '어떤 맛으로 드릴까요? 연하게, 진하게, 달콤하게 중에 골라주세요.',
  subtitle: '마지막 질문이에요',
  options: [
    { value: 'light', label: '연하게' },
    { value: 'strong', label: '진하게' },
    { value: 'sweet', label: '달콤하게' },
  ],
}

export default function Question() {
  const { step: stepParam } = useParams()
  const navigate = useNavigate()
  const { state, setCategory, setTemp, setSweetness, setCoffeeTaste, setEntryMode } = useOrder()
  const { advance, cancel } = useAutoAdvance()

  const step = Number(stepParam)
  /** 세 번째 질문은 커피냐 음료냐에 따라 아예 다른 질문이 된다. */
  const isCoffee = state.answers.category === 'coffee'
  const config = step === 3 ? (isCoffee ? STEP3_COFFEE : STEP3_BEVERAGE) : STEPS[step]

  // 잘못된 주소로 들어오면 처음 질문으로 되돌린다.
  useEffect(() => {
    if (!config) navigate('/dine', { replace: true })
  }, [config, navigate])

  // 질문 화면을 지나셨다면 버튼으로 고르는 흐름이다. (드실 곳 화면을 건너뛰고 들어와도 마찬가지)
  useEffect(() => {
    setEntryMode('button')
  }, [setEntryMode])

  // speechText 를 적어 둔 질문은 그 문장을, 없으면 화면의 질문을 그대로 읽는다.
  useScreenSpeech(config ? speechOf(config.question.join(' '), config.speechText) : '')

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
    // compactSubtitle: 선택지가 셋인 화면에서만 자막 바가 자리를 조금 내준다.
    //                   카드 세 장이 스크롤 없이 들어가는 것이 자막 크기보다 앞선다.
    <ScreenLayout onBack={handleBack} subtitle={config.subtitle} compactSubtitle={compact}>
      {/* 점만 있는 진행 표시. 높이(28px)는 예전 자리 그대로라 질문 위치는 변하지 않는다. */}
      <ProgressDots total={TOTAL} current={step} />

      <QuestionTitle lines={config.question} className="mt-[var(--stack-md)]" />

      {/* 질문과 카드 사이 여백 — 질문이 56px 로 커지며 두 줄이 되어 좁혔다.
          선택지 둘: 32 -> 24px / 선택지 셋: 24 -> 16px.
          글자 크기는 그대로 두고 여백부터 내주는 순서다.
          창이 짧아질 때도 같은 순서다 — 여백이 먼저 줄고 글자는 마지막에 줄어든다. */}
      <div
        className={
          compact
            ? 'mt-[var(--gap-card-sm)] flex flex-col gap-[var(--gap-card-sm)]'
            : 'mt-[var(--stack-md)] flex flex-col gap-[var(--gap-card)]'
        }
      >
        {config.options.map((option) => (
          <ChoiceCard
            key={option.value}
            title={option.label}
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
