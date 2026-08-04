import type { Menu, Sweetness, Temp } from '../types'

/**
 * 말로 주문하기 — 어르신이 하신 말씀에서 메뉴를 찾아낸다.
 *
 * 어르신은 메뉴판에 적힌 이름 그대로 말씀하시지 않는다.
 * '따신 커피', '아메리카노요', '달달한 거 하나 주세요' 처럼 말씀하시므로
 * 아래 순서로 넓게 훑는다.
 *
 *   1) 붙여쓰기로 만들고 조사·어미를 떼어 낸다  ('아메리카노 주세요' → '아메리카노')
 *   2) 메뉴 이름과 통째로 같은지 먼저 본다        ('따뜻한 아메리카노' → 한 개로 확정)
 *   3) 온도·당도 같은 조건 말을 뽑아내고 지운다   ('따신' → hot)
 *   4) 남은 말에서 메뉴 낱말을 찾는다             ('라떼' → 카페 라떼)
 *
 * 못 찾으면 빈 배열을 돌려준다. 화면이 '잘 못 알아들었어요' 로 안내한다.
 */

/** 띄어쓰기와 문장부호를 없애고 소문자로 맞춘다. 어르신 말씀은 띄어쓰기가 일정하지 않다. */
function squash(text: string): string {
  return text.toLowerCase().replace(/[\s.,!?~·'"]/g, '')
}

/**
 * 뒤에 붙는 조사·어미. 긴 것부터 떼어 낸다.
 * ('아메리카노 한 잔 주세요' → '아메리카노한잔주세요' → '아메리카노한잔' → '아메리카노')
 */
const TAILS = [
  '주시겠어요',
  '주시겠습니까',
  '부탁드립니다',
  '부탁드려요',
  '부탁해요',
  '마시고싶어요',
  '먹고싶어요',
  '마실래요',
  '먹을래요',
  '주실래요',
  '주세요',
  '줄래요',
  '할게요',
  '할래요',
  '드릴게요',
  '으로',
  '한잔',
  '한개',
  '하나',
  '주라',
  '줘요',
  '어요',
  '이요',
  '이랑',
  '하고',
  '요',
  '로',
  '좀',
  '만',
  '도',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
]

/** 더 떼어 낼 것이 없을 때까지 조사·어미를 벗긴다. */
function stripTails(text: string): string {
  let current = text
  // 무한히 돌지 않게 횟수를 제한한다. 실제로는 두세 번이면 끝난다.
  for (let round = 0; round < 6; round++) {
    const tail = TAILS.find((t) => current.length > t.length && current.endsWith(t))
    if (!tail) break
    current = current.slice(0, -tail.length)
  }
  return current
}

/** 온도를 가리키는 말. 긴 말부터 찾아야 '따뜻한' 이 '따뜻' 보다 먼저 걸린다. */
const TEMP_WORDS: { temp: Temp; words: string[] }[] = [
  {
    temp: 'hot',
    words: ['따뜻한', '따듯한', '뜨거운', '뜨끈한', '따뜻', '따듯', '뜨거', '뜨신', '따신', '더운', '핫'],
  },
  {
    temp: 'ice',
    words: ['시원한', '차가운', '차거운', '아이스', '시원', '차가', 'ice', '냉', '찬'],
  },
]

/**
 * 당도를 가리키는 말.
 * '안 달게' 처럼 부정하는 말이 먼저 걸려야 하므로 plain 을 앞에 둔다.
 */
const SWEET_WORDS: { sweetness: Sweetness; words: string[] }[] = [
  {
    sweetness: 'plain',
    words: ['안달달', '안달콤', '안달게', '덜달게', '안단', '덜단', '담백', '싱거운', '쓴', '플레인'],
  },
  {
    sweetness: 'sweet',
    words: ['달달', '달콤', '단거', '달게', '설탕', '시럽', '단'],
  },
]

/**
 * 메뉴를 가리키는 낱말.
 * 위에서부터 먼저 걸린 것을 쓴다. '바닐라 라떼' 가 '라떼' 보다,
 * 구체적인 메뉴가 뭉뚱그린 '커피' 보다 앞에 와야 한다.
 */
const MENU_WORDS: { words: string[]; matches: (menu: Menu) => boolean }[] = [
  // '연한 커피' 도 id 가 -americano 로 끝나므로, 아메리카노는 id 두 개만 콕 집는다.
  // (그냥 endsWith 로 두면 '아메리카노' 라고만 하셔도 연한 커피까지 딸려 나온다)
  {
    words: ['아메리카노', '아메리까노', '아매리카노', '아메'],
    matches: (m) => m.id === 'ice-americano' || m.id === 'hot-americano',
  },
  { words: ['에스프레소', '에스프레쏘', '에스프레'], matches: (m) => m.id.endsWith('espresso') },
  { words: ['콜드브루', '콜드브류', '콜드'], matches: (m) => m.id.includes('cold-brew') },
  { words: ['드립커피', '드립'], matches: (m) => m.id.includes('drip') },
  { words: ['연한커피', '연커피', '순한커피'], matches: (m) => m.id.includes('mild-americano') },
  { words: ['바닐라라떼', '바닐라라테', '바닐라'], matches: (m) => m.id.endsWith('vanilla-latte') },
  { words: ['카라멜라떼', '카라멜라테', '카라멜'], matches: (m) => m.id.endsWith('caramel-latte') },
  { words: ['카페모카', '모카'], matches: (m) => m.id.endsWith('cafe-mocha') },
  {
    words: ['카페라떼', '카페라테', '카페라뗴', '라떼', '라테', '라뗴'],
    matches: (m) => m.id.endsWith('cafe-latte'),
  },
  { words: ['우유커피', '밀크커피'], matches: (m) => m.id.endsWith('milk-coffee') },
  { words: ['자몽에이드', '자몽', '에이드'], matches: (m) => m.id.includes('grapefruit') },
  { words: ['유자차', '유자'], matches: (m) => m.id.includes('yuja') },
  { words: ['매실차', '매실'], matches: (m) => m.id.includes('plum') },
  { words: ['녹차'], matches: (m) => m.id.includes('green-tea') },
  { words: ['보리차', '보리'], matches: (m) => m.id.includes('barley') },
  { words: ['옥수수차', '옥수수'], matches: (m) => m.id.includes('corn') },
  { words: ['대추차', '대추'], matches: (m) => m.id.includes('jujube') },
  { words: ['생강차', '생강'], matches: (m) => m.id.includes('ginger') },
  { words: ['캐모마일', '카모마일'], matches: (m) => m.id.includes('chamomile') },
  { words: ['둥굴레차', '둥굴레'], matches: (m) => m.id.includes('dungulle') },
  { words: ['현미차', '현미'], matches: (m) => m.id.includes('brown-rice') },
  // '커피' 만 말씀하신 경우. 커피 전체가 아니라 아메리카노만 보여 드린다.
  // 열여덟 가지를 늘어놓는 것보다 가장 흔한 것 두 개(시원한·따뜻한)를 보여 드리는 편이 고르기 쉽다.
  { words: ['커피'], matches: (m) => m.id === 'ice-americano' || m.id === 'hot-americano' },
  { words: ['음료', '음료수', '마실것', '마실거'], matches: (m) => m.category === 'beverage' },
  { words: ['차'], matches: (m) => m.category === 'beverage' },
]

/** 말 속에 있는 낱말을 찾아 지우고, 무엇이 걸렸는지 알려 준다. */
function takeWord<T>(text: string, groups: { words: string[]; value: T }[]): { rest: string; value: T | null } {
  for (const group of groups) {
    const hit = group.words.find((word) => text.includes(word))
    if (hit) return { rest: text.replace(hit, ''), value: group.value }
  }
  return { rest: text, value: null }
}

/** 인기 있는 것부터. 같으면 이름 순으로 두어 결과 순서가 늘 같게 한다. */
function byPopularity(a: Menu, b: Menu): number {
  return b.popularity - a.popularity || a.name.localeCompare(b.name, 'ko')
}

/**
 * 어르신이 하신 말씀에서 메뉴를 찾는다.
 *
 * @returns 인기 순으로 정렬된 후보들. 한 개면 바로 그 메뉴로, 여러 개면 골라 달라고 여쭙는다.
 *          찾지 못하면 빈 배열.
 */
export function matchMenuByVoice(text: string, menus: Menu[]): Menu[] {
  const cleaned = stripTails(squash(text))
  if (!cleaned) return []

  // 1) 메뉴 이름을 통째로 말씀하신 경우 — 가장 확실하므로 바로 확정한다.
  const exact = menus.find((menu) => squash(menu.name) === cleaned)
  if (exact) return [exact]

  // 2) 조건이 되는 말(온도·당도)을 뽑아내고 남은 말로 메뉴를 찾는다.
  const afterTemp = takeWord(
    cleaned,
    TEMP_WORDS.map((t) => ({ words: t.words, value: t.temp })),
  )
  const afterSweet = takeWord(
    afterTemp.rest,
    SWEET_WORDS.map((s) => ({ words: s.words, value: s.sweetness })),
  )
  const temp = afterTemp.value
  const sweetness = afterSweet.value

  const afterMenu = takeWord(
    afterSweet.rest,
    MENU_WORDS.map((m) => ({ words: m.words, value: m.matches })),
  )
  const menuFilter = afterMenu.value

  // 메뉴도, 조건도 못 알아들었으면 여기서 끝. 화면이 다시 여쭤 본다.
  if (!menuFilter && !temp && !sweetness) return []

  // 3) 메뉴 이름의 일부만 말씀하신 경우까지 훑는다. ('아메리카' 처럼 끝을 흐리신 경우)
  const byName = (menu: Menu): boolean => {
    const name = squash(menu.name)
    return afterSweet.rest.length >= 2 && name.includes(afterSweet.rest)
  }

  let candidates = menus.filter((menu) => (menuFilter ? menuFilter(menu) : byName(menu)))
  // 조건만 말씀하신 경우 ('달달한 거', '따뜻한 거') 는 조건에 맞는 것을 모두 후보로 둔다.
  if (!candidates.length && !menuFilter) candidates = [...menus]

  const narrow = (list: Menu[]): Menu[] => {
    let result = list
    if (temp) result = result.filter((m) => m.temp === temp)
    if (sweetness) result = result.filter((m) => m.sweetness === sweetness)
    return result
  }

  const narrowed = narrow(candidates)
  if (narrowed.length) return narrowed.sort(byPopularity)

  // 조건까지 다 맞추면 남는 게 없는 경우가 있다. ('따뜻한 자몽에이드' — 따뜻한 것이 없다)
  // 아무것도 못 찾았다고 하는 것보다, 이름이 맞는 것을 보여 드리고 고르시게 하는 편이 낫다.
  return candidates.sort(byPopularity)
}
