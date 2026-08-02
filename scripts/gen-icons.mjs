/**
 * PWA 아이콘 생성기 — npm run icons
 *
 * 로고가 가로로 긴 워드마크(720x200)라 정사각형에 그대로 넣으면 아주 작게 보인다.
 * 그래서 흰 정사각 캔버스를 만들고 그 가운데에 로고를 크게 앉힌다.
 *
 * maskable 아이콘은 기기마다 원/둥근사각 등으로 잘라내므로
 * 가장자리 20%를 비워 두어(= 가운데 60%만 사용) 어떻게 잘려도 로고가 온전히 보이게 한다.
 *
 * 원본은 public/logo.png 를 먼저 찾고, 없으면 public/logo.svg 를 쓴다.
 * 나중에 진짜 로고 파일을 public/logo.png 로 넣고 다시 실행하면 그대로 반영된다.
 */
import sharp from 'sharp'
import { access, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')

/** 아이콘 배경 — 로고가 파란 워드마크라 흰 바탕이 가장 또렷하다. */
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }

const TARGETS = [
  { file: 'icons/icon-192.png', size: 192, ratio: 0.78, note: '안드로이드 홈 화면' },
  { file: 'icons/icon-512.png', size: 512, ratio: 0.78, note: '스플래시 / 스토어' },
  // 가장자리 20%씩을 비워 둔다 (가운데 60%만 사용)
  { file: 'icons/icon-maskable-512.png', size: 512, ratio: 0.6, note: 'maskable (잘림 대비)' },
  { file: 'apple-touch-icon.png', size: 180, ratio: 0.78, note: '아이폰 홈 화면' },
]

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function findSource() {
  const png = resolve(PUBLIC, 'logo.png')
  if (await exists(png)) return { path: png, kind: 'logo.png' }

  const svg = resolve(PUBLIC, 'logo.svg')
  if (await exists(svg)) return { path: svg, kind: 'logo.svg (logo.png 이 없어 대신 사용)' }

  throw new Error('public/logo.png 도 public/logo.svg 도 찾을 수 없습니다.')
}

async function build(source, target) {
  const logoWidth = Math.round(target.size * target.ratio)

  // density 는 SVG 를 넉넉한 해상도로 먼저 그린 뒤 줄이기 위한 값이다.
  const logo = await sharp(source.path, { density: 600 })
    .resize({ width: logoWidth, fit: 'inside' })
    .png()
    .toBuffer()

  const out = resolve(PUBLIC, target.file)
  await mkdir(dirname(out), { recursive: true })

  await sharp({
    create: {
      width: target.size,
      height: target.size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(out)

  const { size: bytes } = await stat(out)
  return bytes
}

const source = await findSource()
console.log(`원본: ${source.kind}\n`)

for (const target of TARGETS) {
  const bytes = await build(source, target)
  const margin = Math.round(((1 - target.ratio) / 2) * 100)
  console.log(
    `  ${target.file.padEnd(30)} ${String(target.size).padStart(3)}px` +
      `  여백 ${String(margin).padStart(2)}%  ${(bytes / 1024).toFixed(1)}KB  — ${target.note}`,
  )
}

console.log(`\n아이콘 ${TARGETS.length}개를 public/ 에 만들었습니다.`)
