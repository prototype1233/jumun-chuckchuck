import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InstallGuide from '../components/InstallGuide'
import Logo from '../components/Logo'
import { primeSpeech } from '../hooks/useSpeech'

/**
 * 1. 시작 화면
 * 로고가 주인공인 화면. 로고 · 한 줄 문구 · 시작 버튼 외에는 아무것도 두지 않는다.
 */
export default function Welcome() {
  const navigate = useNavigate()

  const handleStart = () => {
    // 첫 터치에서 음성 잠금을 풀어 두어야 다음 화면부터 안내가 나온다.
    primeSpeech()
    navigate('/dine')
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] animate-enter flex-col bg-bg px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo className="h-auto w-[70%]" />
        <p className="mt-7 text-body font-medium text-ink-sub">오늘도 편하게 주문하세요</p>
      </div>

      <div className="pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {/* 홈 화면에 두는 방법. 이미 홈 화면 앱이거나 한 번 닫았으면 아무것도 그리지 않는다. */}
        <InstallGuide />

        <p className="mb-5 text-center text-sub font-medium text-ink-sub">
          가입 없이 바로 쓸 수 있어요
        </p>
        <Button onClick={handleStart}>시작하기</Button>
      </div>
    </div>
  )
}
