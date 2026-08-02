import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** primary: 화면당 한 개만 쓰는 brand 색 CTA / outline: 보조 동작 */
  variant?: Variant
}

const base =
  'w-full rounded-cta font-semibold text-btn transition-[transform,background-color] duration-150 active:scale-[0.99] disabled:opacity-40'

const variants: Record<Variant, string> = {
  // 하단 폭 꽉 찬 CTA. 높이 96px.
  primary: 'h-cta bg-brand text-white shadow-card-selected',
  // 아웃라인 — 테두리만, 색은 쓰지 않는다.
  outline: 'h-touch bg-surface text-ink border-2 border-line',
}

export default function Button({ children, variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
