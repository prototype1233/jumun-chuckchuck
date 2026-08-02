import { useEffect, useState } from 'react'
import { assetUrl } from '../assetUrl'
import type { Menu } from '../types'

interface MenuImageProps {
  menu: Menu
  /** 정사각 한 변의 크기(px) */
  size: number
  /** 모서리 둥글기(px) */
  radius: number
  /** 바로 불러올지 여부 — 추천 결과 3장은 true */
  eager?: boolean
}

/**
 * 메뉴 사진.
 *
 * 사진 경로는 이 순서로 정한다.
 *   1) menu.image (메뉴 전용 사진)
 *   2) /menu/{imageGroup}.jpg (같은 종류끼리 함께 쓰는 사진)
 *   3) 둘 다 실패하면 파란 그라데이션 + 메뉴 첫 글자 (앱이 절대 깨지지 않게)
 *
 * 사진 위에 글씨를 얹거나, 어둡게 덮거나, 필터를 씌우지 않는다.
 */
export default function MenuImage({ menu, size, radius, eager = false }: MenuImageProps) {
  // assetUrl 을 거쳐야 GitHub Pages 처럼 하위 경로에 올렸을 때도 사진을 찾는다.
  const src = assetUrl(menu.image ?? `/menu/${menu.imageGroup}.jpg`)
  const [failed, setFailed] = useState(false)

  // 다른 메뉴로 바뀌면 실패 표시를 지운다.
  useEffect(() => setFailed(false), [src])

  const box = { width: size, height: size, borderRadius: radius } as const

  if (failed) {
    return (
      <div
        style={box}
        className="flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-deep to-brand-light"
        aria-hidden="true"
      >
        <span className="font-black text-white" style={{ fontSize: Math.round(size * 0.42) }}>
          {placeholderLetter(menu.name)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={menu.name}
      width={size}
      height={size}
      style={box}
      className="shrink-0 bg-brand-tint object-cover"
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      onError={() => setFailed(true)}
      draggable={false}
    />
  )
}

/** '시원한 아메리카노' -> '아' 처럼 온도 표현을 뺀 뒤 첫 글자를 쓴다. */
function placeholderLetter(name: string): string {
  const core = name.replace(/^(시원한|따뜻한)\s*/, '')
  return (core || name).charAt(0)
}
