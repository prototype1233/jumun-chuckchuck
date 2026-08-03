import { Fragment } from 'react'

interface QuestionTitleProps {
  /**
   * 질문을 '한 줄로 붙어 있어야 하는 덩어리' 단위로 끊어서 넘긴다.
   * 예: ['어떤 메뉴를', '준비해 드릴까요?']
   *
   * 덩어리 안에서는 절대 줄이 바뀌지 않고, 덩어리와 덩어리 사이에서만 바뀐다.
   * 그래서 화면이 넓으면 한 줄로 이어지고, 좁으면 여기 적어 둔 자리에서만 줄이 나뉜다.
   */
  lines: string[]
  /** 바깥 여백 등 화면마다 다른 부분 */
  className?: string
}

/**
 * 질문 화면의 큰 제목.
 *
 * 한국어는 글자 단위로 줄을 바꿔도 문법적으로는 문제가 없어서 브라우저가
 * '어떤 메뉴를 준비해 드릴까 / 요?' 처럼 낱말 한가운데를 잘라 버린다.
 * 노안이신 분들께는 이 한 번의 어색한 줄바꿈이 글을 다시 읽게 만든다.
 *
 * 그래서 두 가지를 겹쳐 둔다.
 *  1) word-break: keep-all  — 낱말 가운데에서 자르지 않는다. (긴 영문·숫자는 overflow-wrap 으로 흘려보낸다)
 *  2) lines 로 넘겨받은 덩어리 — 낱말 단위로 잘라도 어색한 자리는 아예 못 자르게 묶어 둔다.
 *
 * 글자 크기(34px)와 줄 간격(46px, 1.35배)은 노안 대응 기준이라 여기서 줄이지 않는다.
 */
export default function QuestionTitle({ lines, className = '' }: QuestionTitleProps) {
  return (
    <h1
      className={[
        // max-w 는 화면 틀(430px)보다 넓게 잡아 두었다.
        // 줄바꿈 자리는 아래 덩어리가 정하고, 이 값은 틀이 더 넓어질 때를 위한 상한이다.
        'mx-auto w-full max-w-[26rem] break-keep text-question font-bold text-ink [overflow-wrap:break-word]',
        className,
      ]
        .join(' ')
        .trim()}
    >
      {lines.map((line, index) => (
        <Fragment key={line}>
          {/* 덩어리 사이의 이 한 칸이 유일하게 줄이 바뀔 수 있는 자리다. */}
          {index > 0 && ' '}
          <span className="inline-block whitespace-nowrap">{line}</span>
        </Fragment>
      ))}
    </h1>
  )
}
