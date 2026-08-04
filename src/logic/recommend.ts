/**
 * 추천 로직 (순수 함수)
 *
 * ── 세 번째 질문이 둘로 갈린다 ────────────────────────────────────
 * 커피는 '어떤 맛으로 드릴까요?'(coffeeTaste), 음료는 '당도는 어떻게
 * 맞춰드릴까요?'(sweetness) 를 여쭙는다. 그래서 마지막 조건은 고르신
 * 종류에 따라 보는 칸이 다르다. (matchesTaste 참고)
 *
 * ── 조합마다 결과가 달라야 한다 ──────────────────────────────────
 * 조합이 다른데 같은 메뉴 셋이 나오면 '내가 고른 것이 반영됐나' 싶어진다.
 * 그런 일은 딱 맞는 메뉴가 3개가 안 돼서 조건을 풀 때 생긴다.
 * 그래서 메뉴 데이터에 조합마다 3개씩을 두었고, checkCombos() 로 확인한다.
 *   npm run check:combos
 *
 * ── 나중에 LLM 추천으로 바꾸는 방법 ────────────────────────────────
 * 1. RecommendationEngine 인터페이스를 그대로 구현하는 LlmEngine 클래스를 만든다.
 *      class LlmEngine implements RecommendationEngine {
 *        recommend(answers, menus) { ...서버에 답변을 보내고 메뉴 3개를 돌려받는다... }
 *      }
 *    (비동기가 필요하면 인터페이스 반환 타입을 Promise<Menu[]> 로 바꾸고
 *     Result 화면에서 useEffect 로 받아 쓰면 된다.)
 * 2. 이 파일 맨 아래 defaultEngine 을 new LlmEngine() 으로 교체한다.
 * 3. 화면 코드는 recommendMenus() 만 부르므로 한 줄도 고치지 않아도 된다.
 *    LLM 호출이 실패하면 RuleBasedEngine 으로 되돌리는 것을 권장한다.
 * ─────────────────────────────────────────────────────────────────
 */
import type { Answers, Category, CoffeeTaste, Menu, Sweetness, Temp } from '../types'

/** 추천 개수 — 한 화면에 세 개까지만 보여준다. */
export const RECOMMEND_COUNT = 3

export interface RecommendationEngine {
  /** 답변과 전체 메뉴를 받아 추천 메뉴를 돌려준다. 절대 빈 배열을 돌려주지 않는다. */
  recommend(answers: Answers, menus: Menu[]): Menu[]
}

/** 인기순 내림차순 정렬 (동점이면 가격이 싼 순 — 부담이 적은 쪽 우선) */
function byPopularity(a: Menu, b: Menu): number {
  if (b.popularity !== a.popularity) return b.popularity - a.popularity
  return a.price - b.price
}

function matchesTemp(menu: Menu, temp: Answers['temp']): boolean {
  if (!temp) return true
  return menu.temp === temp
}

function matchesCategory(menu: Menu, category: Answers['category']): boolean {
  if (!category) return true
  return menu.category === category
}

/**
 * 세 번째 질문의 답과 맞는지 본다.
 * 커피면 coffeeTaste, 음료면 sweetness 를 본다. 아직 안 고르셨으면 거르지 않는다.
 */
function matchesTaste(menu: Menu, answers: Answers): boolean {
  if (answers.category === 'coffee') {
    return !answers.coffeeTaste || menu.coffeeTaste === answers.coffeeTaste
  }
  if (answers.category === 'beverage') {
    return !answers.sweetness || menu.sweetness === answers.sweetness
  }
  // 종류를 아직 안 고르신 경우 — 답이 있는 쪽으로만 거른다.
  if (answers.coffeeTaste) return menu.coffeeTaste === answers.coffeeTaste
  if (answers.sweetness) return menu.sweetness === answers.sweetness
  return true
}

/** 조건을 하나도 풀지 않고 딱 맞는 메뉴들 (인기순) */
function exactMatches(answers: Answers, menus: Menu[]): Menu[] {
  return menus
    .filter(
      (m) =>
        matchesCategory(m, answers.category) &&
        matchesTemp(m, answers.temp) &&
        matchesTaste(m, answers),
    )
    .sort(byPopularity)
}

/** 이미 담긴 메뉴는 건너뛰고 목표 개수까지 채운다. */
function fill(picked: Menu[], candidates: Menu[], count: number): void {
  for (const menu of candidates.slice().sort(byPopularity)) {
    if (picked.length >= count) return
    if (picked.some((m) => m.id === menu.id)) continue
    picked.push(menu)
  }
}

/**
 * 규칙 기반 추천.
 * 조건을 단계적으로 완화해서 결과가 0개가 되는 일이 없도록 보장한다.
 *   1단계: 종류 + 온도 + 맛(당도) 모두 일치   <- 메뉴가 충분하면 여기서 끝난다
 *   2단계: 맛(당도) 조건 완화 (종류 + 온도)
 *   3단계: 온도 조건까지 완화 (종류)
 *   4단계: 전체 메뉴에서 인기순
 *
 * 2단계 아래로 내려가면 조합이 달라도 결과가 겹치기 시작한다.
 * 그래서 2단계는 '있으면 안 되는 안전장치' 로 두고, 평소에는 1단계에서 끝나도록
 * 메뉴 데이터를 조합마다 3개씩 채워 둔다. (checkCombos 로 확인)
 */
export class RuleBasedEngine implements RecommendationEngine {
  recommend(answers: Answers, menus: Menu[]): Menu[] {
    const picked: Menu[] = []

    // 1단계 — 세 조건 모두 만족
    fill(picked, exactMatches(answers, menus), RECOMMEND_COUNT)

    // 2단계 — 맛(당도) 완화
    if (picked.length < RECOMMEND_COUNT) {
      fill(
        picked,
        menus.filter((m) => matchesCategory(m, answers.category) && matchesTemp(m, answers.temp)),
        RECOMMEND_COUNT,
      )
    }

    // 3단계 — 온도까지 완화
    if (picked.length < RECOMMEND_COUNT) {
      fill(
        picked,
        menus.filter((m) => matchesCategory(m, answers.category)),
        RECOMMEND_COUNT,
      )
    }

    // 4단계 — 최후 보루: 전체 메뉴 인기순
    if (picked.length < RECOMMEND_COUNT) {
      fill(picked, menus, RECOMMEND_COUNT)
    }

    return picked
  }
}

/** 현재 사용 중인 엔진. LLM으로 교체할 때 이 한 줄만 바꾸면 된다. */
const defaultEngine: RecommendationEngine = new RuleBasedEngine()

/** 화면에서 쓰는 진입점 */
export function recommendMenus(
  answers: Answers,
  menus: Menu[],
  engine: RecommendationEngine = defaultEngine,
): Menu[] {
  return engine.recommend(answers, menus)
}

/* ────────────────────────────────────────────────────────────────
 * 조합 점검 — 개발용
 * 화면에서는 쓰지 않는다. scripts/check-combos.mjs 가 이 함수를 부른다.
 * ──────────────────────────────────────────────────────────────── */

const CATEGORIES: Category[] = ['coffee', 'beverage']
const TEMPS: Temp[] = ['ice', 'hot']
const COFFEE_TASTES: CoffeeTaste[] = ['light', 'strong', 'sweet']
const SWEETNESSES: Sweetness[] = ['sweet', 'plain']

/** 콘솔에 사람이 읽을 수 있게 찍기 위한 이름표 */
const LABELS = {
  category: { coffee: '커피', beverage: '음료' } as Record<Category, string>,
  temp: { ice: '시원함', hot: '따뜻함' } as Record<Temp, string>,
  coffeeTaste: { light: '연하게', strong: '진하게', sweet: '달콤하게' } as Record<
    CoffeeTaste,
    string
  >,
  sweetness: { sweet: '달콤함', plain: '담백함' } as Record<Sweetness, string>,
}

export interface ComboCheck {
  /** '커피 · 시원함 · 진하게' 처럼 사람이 읽는 이름 */
  label: string
  answers: Answers
  /** 조건을 하나도 풀지 않고 딱 맞는 메뉴 수 */
  exactCount: number
  /** 실제로 추천되는 메뉴 (조건 완화까지 거친 최종 결과) */
  recommended: Menu[]
  /** 추천 3개가 모두 '딱 맞는 메뉴' 로만 채워졌는지 */
  ok: boolean
}

/**
 * 식사 장소를 뺀 모든 질문 조합.
 *
 * 세 번째 질문이 종류에 따라 갈리므로 조합 수도 종류마다 다르다.
 *   커피: 온도 2 x 맛 3 = 6
 *   음료: 온도 2 x 당도 2 = 4
 * 모두 10가지.
 */
export function listCombos(): Answers[] {
  const combos: Answers[] = []
  for (const category of CATEGORIES) {
    for (const temp of TEMPS) {
      if (category === 'coffee') {
        for (const coffeeTaste of COFFEE_TASTES) {
          combos.push({ category, temp, coffeeTaste, sweetness: null })
        }
      } else {
        for (const sweetness of SWEETNESSES) {
          combos.push({ category, temp, sweetness, coffeeTaste: null })
        }
      }
    }
  }
  return combos
}

/** 조합 하나의 이름표를 만든다. */
export function comboLabel(answers: Answers): string {
  const parts = [
    answers.category ? LABELS.category[answers.category] : '전체',
    answers.temp ? LABELS.temp[answers.temp] : '전체',
    answers.coffeeTaste
      ? LABELS.coffeeTaste[answers.coffeeTaste]
      : answers.sweetness
        ? LABELS.sweetness[answers.sweetness]
        : '전체',
  ]
  return parts.join(' · ')
}

/**
 * 모든 조합에 대해 '딱 맞는 메뉴가 최소 3개 확보되는지' 를 확인한다.
 *
 * ok 가 false 인 조합은 조건을 풀어서 다른 조합과 같은 메뉴를 끌어다 쓴다는 뜻이다.
 * 그런 조합이 보이면 그 조합에 맞는 메뉴를 data/menus.ts 에 더 넣어야 한다.
 */
export function checkCombos(menus: Menu[]): ComboCheck[] {
  return listCombos().map((answers) => {
    const exact = exactMatches(answers, menus)
    const recommended = recommendMenus(answers, menus)
    return {
      label: comboLabel(answers),
      answers,
      exactCount: exact.length,
      recommended,
      ok: exact.length >= RECOMMEND_COUNT,
    }
  })
}
