import JsBarcode from 'jsbarcode'
import { useEffect, useRef, useState } from 'react'

/** 막대 하나의 굵기(모듈 폭). CSS 로 늘어나므로 화면에서의 실제 굵기와는 다르다. */
const MODULE_WIDTH = 2

/**
 * 좌우 여백(quiet zone).
 * CODE128 규격은 모듈 10칸 이상을 요구한다. 인식률을 위해 12칸으로 넉넉히 잡았다.
 * 이 여백이 모자라면 스캐너가 바코드의 시작·끝을 찾지 못한다.
 */
const QUIET_ZONE = MODULE_WIDTH * 12

interface BarcodeProps {
  /** 바코드에 담을 값 */
  value: string
  /** 막대 높이(기준값). 실제 크기는 className 으로 정한다. */
  height?: number
  className?: string
}

/**
 * 1차원 바코드(CODE128).
 *
 * QR 이 아니라 1D 바코드다. 매장 키오스크에 붙어 있는 스캐너는 대부분 1D 전용이라
 * QR 을 대면 아무 반응이 없다.
 *
 * 스캐너 인식률을 위해 지키는 것들:
 *  - 배경은 반드시 흰색, 막대는 검은색 (회색·색깔 배경은 인식이 크게 떨어진다)
 *  - 좌우 quiet zone 확보
 *  - shapeRendering="crispEdges" 로 막대 경계가 흐려지지 않게 한다
 *  - preserveAspectRatio="none" 으로 가로만 늘린다. 막대들의 굵기 비율은 그대로 유지되므로
 *    늘어나도 값은 똑같이 읽힌다.
 */
export default function Barcode({ value, height = 100, className }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    try {
      JsBarcode(svg, value, {
        format: 'CODE128',
        width: MODULE_WIDTH,
        height,
        // 값은 아래에 HTML 글씨로 따로 그린다. 바코드 그림이 늘어나도 글씨 크기가
        // 함께 늘어나지 않게 하려는 것이다.
        displayValue: false,
        background: '#FFFFFF',
        lineColor: '#000000',
        margin: 0,
        marginLeft: QUIET_ZONE,
        marginRight: QUIET_ZONE,
      })
      // JsBarcode 가 넣어 둔 width/height 속성을 지워야 CSS 크기가 그대로 먹는다.
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.setAttribute('preserveAspectRatio', 'none')
      setFailed(false)
    } catch {
      // CODE128 이 담을 수 없는 값이 들어온 경우. 바코드는 접고 번호로만 안내한다.
      setFailed(true)
    }
  }, [value, height])

  // 스크린리더에는 바코드 그림 대신 옆에 적힌 번호를 읽히는 편이 낫다.
  // 실패했을 때도 svg 자체는 남겨 둔다. (지워 버리면 값이 바뀌어도 다시 그릴 자리가 없다)
  return (
    <svg
      ref={svgRef}
      aria-hidden
      shapeRendering="crispEdges"
      className={failed ? 'hidden' : className}
    />
  )
}
