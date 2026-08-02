/**
 * 추천 로직 (순수 함수)
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
import type { Answers, Menu } from '../types'

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

function matchesSweetness(menu: Menu, sweetness: Answers['sweetness']): boolean {
  if (!sweetness) return true
  return menu.sweetness === sweetness
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
 *   1단계: 종류 + 온도 + 당도 모두 일치
 *   2단계: 당도 조건 완화 (종류 + 온도)
 *   3단계: 온도 조건까지 완화 (종류)
 *   4단계: 전체 메뉴에서 인기순
 */
export class RuleBasedEngine implements RecommendationEngine {
  recommend(answers: Answers, menus: Menu[]): Menu[] {
    const picked: Menu[] = []

    // 1단계 — 세 조건 모두 만족
    fill(
      picked,
      menus.filter(
        (m) =>
          matchesCategory(m, answers.category) &&
          matchesTemp(m, answers.temp) &&
          matchesSweetness(m, answers.sweetness),
      ),
      RECOMMEND_COUNT,
    )

    // 2단계 — 당도 완화
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
