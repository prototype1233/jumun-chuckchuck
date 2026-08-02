/**
 * 배포 주소 QR 코드 만들기 — npm run qr
 *
 * 현장 시연에서 어르신 휴대폰으로 주소를 타이핑하게 할 수는 없다.
 * 종이에 출력해 두고 카메라로 찍으면 바로 열리게 하기 위한 것이다.
 *
 *   npm run qr                     기본 배포 주소로 만든다
 *   npm run qr -- <주소>           다른 주소로 만든다 (Codespaces 미리보기 주소 등)
 *
 * 결과물
 *   public/qr.png   화면에 띄우거나 문서에 붙일 때
 *   public/qr.svg   크게 인쇄할 때 (벡터라 깨지지 않는다)
 * 터미널에도 같이 찍어 주므로 바로 확인할 수 있다.
 */
import QRCode from 'qrcode'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public')

/** GitHub Pages 기본 배포 주소 */
const DEFAULT_URL = 'https://prototype1233.github.io/jumun-chuckchuck/'

const url = process.argv[2] ?? DEFAULT_URL

// 오타로 엉뚱한 QR 을 인쇄하는 일이 없게 형식만 가볍게 확인한다.
try {
  new URL(url)
} catch {
  console.error(`주소 형식이 올바르지 않습니다: ${url}`)
  process.exit(1)
}

/**
 * 인쇄해서 멀리서도 찍히도록 여백(margin)을 넉넉히,
 * 오류 보정 수준(errorCorrectionLevel)을 높게 잡는다.
 * 종이가 조금 구겨지거나 가려져도 읽힌다.
 */
const OPTIONS = {
  errorCorrectionLevel: 'H',
  margin: 3,
  color: { dark: '#16233D', light: '#FFFFFF' },
}

await mkdir(OUT_DIR, { recursive: true })

// 터미널 미리보기 — 지금 바로 찍어 볼 수 있다.
console.log('\n' + (await QRCode.toString(url, { type: 'terminal', small: true })))

const png = resolve(OUT_DIR, 'qr.png')
const svg = resolve(OUT_DIR, 'qr.svg')

await QRCode.toFile(png, url, { ...OPTIONS, width: 1024 })
await writeFile(svg, await QRCode.toString(url, { ...OPTIONS, type: 'svg' }), 'utf8')

const kb = async (p) => ((await stat(p)).size / 1024).toFixed(1) + 'KB'

console.log(`주소: ${url}\n`)
console.log(`  public/qr.png   1024x1024  ${await kb(png)}  — 화면·문서용`)
console.log(`  public/qr.svg   벡터        ${await kb(svg)}  — 인쇄용`)
