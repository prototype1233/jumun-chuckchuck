/**
 * 조합 점검 (개발용)
 *
 *   npm run check:combos
 *
 * 식사 장소를 뺀 모든 질문 조합(종류 × 온도 × 맛)을 돌면서
 *   1) 조건을 하나도 풀지 않고 딱 맞는 메뉴가 3개 이상인지
 *   2) 조합이 다른데 추천 결과가 똑같지는 않은지
 * 를 확인하고 결과를 콘솔에 찍는다.
 *
 * 하나라도 걸리면 1번으로 끝난다. (메뉴를 지우거나 옮긴 뒤에 꼭 한 번 돌려 볼 것)
 *
 * Node 22.6+ 는 .ts 파일을 그대로 읽을 수 있어서 따로 빌드하지 않는다.
 * (화면 코드와 같은 로직·같은 데이터를 그대로 쓰기 위해서다)
 */
import { MENUS } from '../src/data/menus.ts'
import { RECOMMEND_COUNT, checkCombos } from '../src/logic/recommend.ts'

const results = checkCombos(MENUS)

console.log(`\n메뉴 ${MENUS.length}개 · 조합 ${results.length}가지 · 조합마다 ${RECOMMEND_COUNT}개 추천\n`)

for (const combo of results) {
  const mark = combo.ok ? '✅' : '⚠️ '
  const names = combo.recommended.map((menu) => menu.name).join(', ')
  console.log(`${mark} ${combo.label.padEnd(20)} 딱 맞는 메뉴 ${combo.exactCount}개`)
  console.log(`   → ${names}`)
}

// ── 1) 3개가 안 되는 조합 ──────────────────────────────
const short = results.filter((combo) => !combo.ok)

// ── 2) 결과가 똑같은 조합 ──────────────────────────────
// 추천 메뉴 셋이 같으면 고르신 것이 결과에 반영되지 않은 것처럼 보인다.
const seen = new Map()
const duplicates = []
for (const combo of results) {
  const key = combo.recommended
    .map((menu) => menu.id)
    .sort()
    .join('|')
  if (seen.has(key)) duplicates.push([seen.get(key), combo.label])
  else seen.set(key, combo.label)
}

console.log('')
if (short.length === 0) {
  console.log(`✅ 모든 조합에서 딱 맞는 메뉴가 ${RECOMMEND_COUNT}개 이상 확보됩니다.`)
} else {
  console.log(`⚠️  딱 맞는 메뉴가 ${RECOMMEND_COUNT}개에 못 미치는 조합 ${short.length}가지:`)
  for (const combo of short) {
    console.log(`   - ${combo.label} (${combo.exactCount}개) → 이 조합에 맞는 메뉴를 더 넣어야 합니다.`)
  }
}

if (duplicates.length === 0) {
  console.log('✅ 조합마다 추천 결과가 모두 다릅니다.')
} else {
  console.log(`⚠️  추천 결과가 겹치는 조합 ${duplicates.length}쌍:`)
  for (const [first, second] of duplicates) {
    console.log(`   - ${first} 와(과) ${second}`)
  }
}
console.log('')

process.exit(short.length === 0 && duplicates.length === 0 ? 0 : 1)
