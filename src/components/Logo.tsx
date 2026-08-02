import { useId, useState } from 'react'
import { assetUrl } from '../assetUrl'

/**
 * '주문 척척' 워드마크.
 *
 * public/logo.png 가 있으면 그 파일을 그대로 쓰고,
 * 없으면 같은 모양의 파란 그라데이션 워드마크를 그려서 대신 보여 준다.
 * (실제 로고 파일을 public/logo.png 로 넣으면 코드 수정 없이 바로 반영된다.)
 *
 * 로고는 시작 화면 / 주문 완료 화면 / 파비콘 세 곳에만 쓴다.
 */
interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  const [failed, setFailed] = useState(false)
  const gradientId = useId()

  if (failed) {
    return (
      <svg viewBox="0 0 720 200" role="img" aria-label="주문 척척" className={className}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B3FA0" />
            <stop offset="100%" stopColor="#3B7DF5" />
          </linearGradient>
        </defs>
        <text
          x="360"
          y="102"
          fill={`url(#${gradientId})`}
          fontSize="132"
          fontWeight="900"
          letterSpacing="-4"
          textAnchor="middle"
          dominantBaseline="central"
        >
          주문 척척
        </text>
      </svg>
    )
  }

  return (
    <img
      src={assetUrl('/logo.png')}
      alt="주문 척척"
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  )
}
