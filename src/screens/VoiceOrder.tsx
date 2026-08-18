import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import MenuImage from '../components/MenuImage'
import QuestionTitle from '../components/QuestionTitle'
import ScreenLayout from '../components/ScreenLayout'
import { MicIcon } from '../components/Icons'
import { useOrder } from '../context/OrderContext'
import { MENUS } from '../data/menus'
import { useSpeech } from '../hooks/useSpeech'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { won } from '../logic/cart'
import { matchMenuByVoice } from '../logic/voiceMatch'
import type { Menu } from '../types'

/**
 * 안내를 읽어 드리는 문장. 이 문장을 다 읽은 다음에 마이크를 켠다.
 * 읽어 주는 소리를 마이크가 되받아 알아듣지 않도록, 길게 늘이지 않고 짧게 둔다.
 * (예시 문구는 화면에 크게 적혀 있으므로 소리로 또 읽지 않는다)
 */
const PROMPT = '드시고 싶은 것을 말씀해 주세요.'

/** 읽어 주기가 끝나지 않아도 이만큼 지나면 마이크를 켠다. */
const PREPARE_LIMIT_MS = 6000

/** 아무 말씀이 없을 때 시작 화면으로 되돌아가기까지 기다리는 시간 */
const SILENCE_MS = 10000

/**
 * 브라우저가 먼저 끊었을 때 다시 켜기까지의 짧은 틈.
 * 곧바로 다시 켜면 같은 자리를 쉴 새 없이 맴돌 수 있어 한 박자 쉰다.
 */
const RESTART_DELAY_MS = 300

/** 다시 켜는 횟수의 한계 — 위 10초 안에서도 무한히 돌지 않게 두는 안전장치 */
const MAX_RESTARTS = 40

/** 여러 개가 걸렸을 때 화면에 보여 드릴 최대 개수 */
const MAX_CHOICES = 3

/** 사진 크기 — 세 장이 스크롤 없이 들어가는 값 */
const IMAGE_SIZE = 96

type Phase =
  /** 안내를 읽어 드리는 중. 아직 마이크를 켜지 않았다. */
  | 'preparing'
  /** 듣고 있는 중 */
  | 'listening'
  /** 여러 개가 걸려서 하나만 골라 달라고 여쭙는 중 */
  | 'choosing'
  /** 못 알아들었을 때 */
  | 'notFound'
  /** 마이크를 쓸 수 없을 때 */
  | 'denied'

/**
 * 1-2. 말로 주문하기
 *
 * 메뉴를 이미 정하고 오신 분을 위한 지름길이다.
 * 질문 세 개를 건너뛰고 바로 잔 수를 고르는 화면으로 간다.
 *
 * 실패해도 막다른 길로 끝내지 않는다. 언제나 '다시 말하기' 나
 * '질문으로 고르기' 중 하나로 이어 가실 수 있게 둔다.
 */
export default function VoiceOrder() {
  const navigate = useNavigate()
  const { setDine, selectMenu, setEntryMode } = useOrder()
  const { speak, cancel } = useSpeech()

  const [phase, setPhase] = useState<Phase>('preparing')
  const [choices, setChoices] = useState<Menu[]>([])

  /** 듣기 시작한 시각 — 10초를 재는 기준 */
  const startedAtRef = useRef(0)
  /** 브라우저가 먼저 포기했을 때 다시 켠 횟수. 같은 자리를 맴돌지 않게 제한한다. */
  const restartsRef = useRef(0)
  /** 다시 켜기를 기다리는 중인 타이머 */
  const restartTimerRef = useRef(0)

  // 말로 시작한 주문이다. 나중에 [다시 고를래요] 를 누르시면 이 화면으로 돌아와야 한다.
  useEffect(() => {
    setEntryMode('voice')
  }, [setEntryMode])

  /**
   * 버튼으로 고르는 원래 흐름으로 넘어간다.
   * 넘어간 다음에는 버튼 흐름이 된다. (드실 곳 화면이 entryMode 를 'button' 으로 바꾼다)
   */
  const goQuestions = useCallback(() => {
    navigate('/dine')
  }, [navigate])

  /** 메뉴 하나로 정해졌을 때 — 잔 수 화면으로 바로 넘어간다. */
  const pickMenu = useCallback(
    (menu: Menu) => {
      // 질문(드실 곳 포함)을 건너뛰었으므로 기본값을 넣어 둔다. 매장에서 다시 여쭤보지 않는다.
      setDine('store')
      selectMenu(menu)
      // 뒤로가기는 시작 화면으로. 마이크가 저절로 다시 켜지면 놀라시기 때문이다.
      navigate('/quantity', { state: { from: '/' } })
    },
    [navigate, selectMenu, setDine],
  )

  const handleFinal = useCallback(
    (alternatives: string[]) => {
      // 발음이 흐리셨을 수 있으니 후보를 순서대로 훑어 하나라도 걸리면 그것을 쓴다.
      for (const text of alternatives) {
        const matched = matchMenuByVoice(text, MENUS)
        if (matched.length === 1) {
          pickMenu(matched[0])
          return
        }
        if (matched.length > 1) {
          setChoices(matched.slice(0, MAX_CHOICES))
          setPhase('choosing')
          return
        }
      }
      setPhase('notFound')
    },
    [pickMenu],
  )

  const handleDenied = useCallback(() => setPhase('denied'), [])

  const { start, stop, interim, listening } = useVoiceInput({
    onFinal: handleFinal,
    onDenied: handleDenied,
    onSilence: () => {
      // 어르신은 말씀을 꺼내기까지 시간이 걸린다.
      // 브라우저가 먼저 포기하더라도 10초까지는 다시 켜서 계속 듣는다.
      if (Date.now() - startedAtRef.current < SILENCE_MS && restartsRef.current < MAX_RESTARTS) {
        restartsRef.current += 1
        restartTimerRef.current = window.setTimeout(start, RESTART_DELAY_MS)
        return
      }
      navigate('/')
    },
  })

  // 안내를 다 읽어 드린 다음에 마이크를 켠다.
  // 읽어 주는 소리를 마이크가 자기 목소리로 알아듣는 일을 막기 위해서다.
  useEffect(() => {
    if (phase !== 'preparing') return

    let done = false
    const begin = () => {
      if (done) return
      done = true
      cancel() // 아직 읽고 있다면 여기서 멈춘다
      startedAtRef.current = Date.now()
      restartsRef.current = 0
      setPhase('listening')
    }

    const limit = window.setTimeout(begin, PREPARE_LIMIT_MS)
    speak(PROMPT, begin)

    return () => {
      done = true
      window.clearTimeout(limit)
      cancel()
    }
  }, [phase, speak, cancel])

  // 듣기 시작 / 10초 동안 아무 말씀이 없으면 시작 화면으로.
  useEffect(() => {
    if (phase !== 'listening') return
    start()
    const timer = window.setTimeout(() => {
      stop()
      navigate('/')
    }, SILENCE_MS)

    return () => {
      window.clearTimeout(timer)
      // 다시 켜려고 기다리던 것이 있으면 함께 없앤다. 화면을 떠난 뒤에 켜지면 안 된다.
      window.clearTimeout(restartTimerRef.current)
    }
  }, [phase, start, stop, navigate])

  // 듣기가 끝난 화면들에서는 다시 안내를 읽어 드린다.
  useEffect(() => {
    if (phase === 'choosing') speak('어떤 걸로 드릴까요? 하나를 눌러 주세요.')
    else if (phase === 'notFound') speak('잘 못 알아들었어요. 다시 말씀해 주시거나, 질문으로 골라 주세요.')
    else if (phase === 'denied') speak('소리를 들을 수 없어요. 질문으로 골라 주세요.')
  }, [phase, speak])

  const handleRetry = () => {
    stop()
    setChoices([])
    setPhase('preparing')
  }

  const handleQuit = () => {
    stop()
    navigate('/')
  }

  /** 말하는 것이 어려우실 때 언제든 버튼 방식으로 갈아탈 수 있게 한다. */
  const handleUseButtons = () => {
    stop()
    goQuestions()
  }

  const subtitle =
    phase === 'choosing'
      ? '드시고 싶은 것을 눌러 주세요'
      : phase === 'notFound'
        ? '다시 말씀하시거나 골라 주세요'
        : phase === 'denied'
          ? '질문으로 고르실 수 있어요'
          : '천천히 말씀하셔도 괜찮아요'

  return (
    <ScreenLayout
      onBack={handleQuit}
      backLabel="처음으로"
      subtitle={subtitle}
      footer={footerFor(phase, { handleQuit, handleRetry, goQuestions, handleUseButtons })}
    >
      {(phase === 'preparing' || phase === 'listening') && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {/* 화면이 짧으면 마이크만 줄어든다. 글씨 크기는 노안 대응 기준이라 건드리지 않는다. */}
          <div className="relative flex h-[clamp(92px,15vh,132px)] w-[clamp(92px,15vh,132px)] items-center justify-center">
            {/* 듣는 중일 때만 물결이 퍼진다 */}
            {listening && (
              <span
                aria-hidden
                className="absolute inset-0 animate-mic-ring rounded-full bg-brand motion-reduce:animate-none"
              />
            )}
            <span
              className={[
                'relative flex h-full w-full items-center justify-center rounded-full text-white',
                listening ? 'animate-mic-bounce bg-brand motion-reduce:animate-none' : 'bg-ink-sub',
              ].join(' ')}
            >
              <MicIcon size={72} className="h-1/2 w-1/2" />
            </span>
          </div>

          {/* 56px 에서는 '드시고 싶은 것을'(352px) 한 덩어리가 375px 화면 폭(327px)을 넘는다.
              세 줄로 흘리는 대신 화면 글씨를 짧게 줄였다.
              읽어 드리는 말(PROMPT)은 '드시고 싶은 것을 말씀해 주세요.' 그대로다. */}
          <QuestionTitle
            lines={['무엇을', '드시겠어요?']}
            className="mt-[var(--stack-md)] text-center"
          />

          <p className="mt-[var(--gap-in-card)] break-keep text-center text-card-title font-semibold text-ink-sub">
            예) 따뜻한 아메리카노
          </p>

          {/* 알아듣는 중인 말. 자리를 미리 잡아 두어 글씨가 나타나도 화면이 밀리지 않는다. */}
          {/* min-h 는 text-btn 한 줄 높이(34px 글씨 · 44px 줄간격)와 같다.
              알아들은 말이 나타날 때 화면이 밀리지 않도록 자리를 미리 잡아 둔다. */}
          <p className="mt-4 min-h-[44px] break-keep text-center text-btn font-bold text-ink">
            {interim}
          </p>

          {/* 마이크 권한을 여쭙기 전에 왜 필요한지 먼저 알려 드린다.
              읽어 주는 소리가 없는 기기에서는 준비 단계가 순식간에 지나가므로
              듣는 중에도 계속 보이게 두어야 권한 창이 떴을 때 이유를 아실 수 있다. */}
          <p className="mt-1 break-keep text-center text-sub font-medium text-ink-sub">
            말씀을 알아듣기 위해 마이크를 잠깐 사용해요
          </p>
        </div>
      )}

      {phase === 'choosing' && (
        <>
          <QuestionTitle lines={['어떤 걸로', '드릴까요?']} />

          <div className="mt-[var(--gap-card-sm)] flex flex-col gap-3">
            {choices.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => pickMenu(menu)}
                className="flex w-full items-center gap-4 rounded-card bg-surface p-2 text-left shadow-card transition-transform duration-150 active:scale-[0.99]"
              >
                <MenuImage menu={menu} size={IMAGE_SIZE} radius={20} eager />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="break-keep text-card-title font-bold leading-[32px] text-ink">
                    {menu.name}
                  </span>
                  <span className="mt-1 text-price font-bold text-brand">{won(menu.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'notFound' && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <span className="flex h-[clamp(92px,15vh,132px)] w-[clamp(92px,15vh,132px)] items-center justify-center rounded-full bg-line text-ink-sub">
            <MicIcon size={72} />
          </span>
          {/* 어르신 탓처럼 들리지 않게 '못 알아들었다' 고 말한다. */}
          <QuestionTitle lines={['잘 못', '알아들었어요']} className="mt-[var(--stack-lg)] text-center" />
          <p className="mt-4 break-keep text-center text-body font-medium text-ink-sub">
            다시 한 번 말씀해 주시겠어요?
          </p>
        </div>
      )}

      {phase === 'denied' && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <span className="flex h-[clamp(92px,15vh,132px)] w-[clamp(92px,15vh,132px)] items-center justify-center rounded-full bg-line text-ink-sub">
            <MicIcon size={72} />
          </span>
          <QuestionTitle lines={['소리를 들을 수', '없어요']} className="mt-[var(--stack-lg)] text-center" />
          <p className="mt-4 break-keep text-center text-body font-medium text-ink-sub">
            질문으로 골라 주세요
          </p>
        </div>
      )}
    </ScreenLayout>
  )
}

/** 화면마다 아래에 놓는 버튼. 어느 경우에도 빠져나갈 길을 하나 이상 둔다. */
function footerFor(
  phase: Phase,
  actions: {
    handleQuit: () => void
    handleRetry: () => void
    goQuestions: () => void
    handleUseButtons: () => void
  },
) {
  if (phase === 'preparing' || phase === 'listening') {
    return (
      <div className="flex flex-col items-center gap-1">
        <Button variant="outline" onClick={actions.handleQuit}>
          그만두기
        </Button>
        {/*
          말이 잘 안 나오실 때를 위한 길. 말씀을 못 알아들을 때까지 기다리지 않아도 된다.
          여기서는 버튼이 아니라 글씨 링크로 둔다. 큰 버튼을 하나 더 놓으면
          [그만두기] 와 무게가 같아 보여서 무엇을 눌러야 할지 헷갈리기 때문이다.
          (반대 방향 — 버튼 화면에서 말하기로 가는 링크 — 은 두지 않는다. 화면이 복잡해진다)
        */}
        <button
          type="button"
          onClick={actions.handleUseButtons}
          // 글씨 링크지만 손가락으로 누르는 곳이라 위아래 여백으로 60px 넘는 터치 영역을 만든다.
          // (하단 CTA 96px 만큼 키우면 [그만두기] 와 구별이 되지 않아 여기까지만 둔다)
          className="flex items-center px-4 py-4 text-body font-semibold text-ink-sub underline underline-offset-4 active:scale-[0.98]"
        >
          버튼으로 고를래요
        </button>
      </div>
    )
  }

  if (phase === 'notFound') {
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={actions.handleRetry}>다시 말하기</Button>
        <Button variant="outline" onClick={actions.goQuestions}>
          질문으로 고를래요
        </Button>
      </div>
    )
  }

  if (phase === 'denied') {
    return <Button onClick={actions.goQuestions}>질문으로 고를래요</Button>
  }

  // 여러 개 중에 고르는 중 — 위 카드가 주인공이라 보조 버튼만 둔다.
  return (
    <Button variant="outline" onClick={actions.goQuestions}>
      질문으로 고를래요
    </Button>
  )
}
