import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * GitHub Pages 는 https://<계정>.github.io/<저장소>/ 아래에 올라간다.
 * 저장소 이름이 바뀌면 이 값만 고치면 된다. (라우터·manifest·서비스 워커가 모두 이 값을 따라간다)
 */
const BASE = '/jumun-chuckchuck/'

/**
 * GitHub Pages 는 SPA 를 모르기 때문에, /result 같은 주소에서 새로고침하면
 * 서버가 파일을 찾지 못하고 404 를 돌려준다.
 * 404 응답에 index.html 과 똑같은 내용을 담아 두면 주소는 그대로 둔 채 앱이 뜨고,
 * 라우터가 알아서 해당 화면을 그린다.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index && index.type === 'asset') {
        this.emitFile({ type: 'asset', fileName: '404.html', source: index.source })
      }
    },
  }
}

// GitHub Codespaces 포트 포워딩으로 스마트폰에서 접속하기 위해 host: true 설정
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // 어르신이 업데이트를 직접 챙길 리 없으니 새 버전을 알아서 받아 둔다.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: '주문 척척',
        short_name: '주문척척',
        description: '어르신을 위한 쉬운 카페 주문 도우미',
        display: 'standalone', // 주소창 없는 전체 화면
        orientation: 'portrait', // 세로 고정 — 가로로 돌면 한 화면 레이아웃이 깨진다
        background_color: '#F7F8FA',
        theme_color: '#2563EB',
        lang: 'ko',
        // start_url 과 scope 가 base 와 어긋나면 설치는 되는데
        // 홈 화면 아이콘을 눌러도 앱이 열리지 않는다. 반드시 base 를 붙인다.
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: `${BASE}icons/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 앱 셸과 메뉴 사진을 통째로 미리 받아 둔다.
        // 카페 와이파이가 느려도 사진이 즉시 뜨고, 아예 끊겨도 메뉴를 둘러볼 수 있다.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webmanifest}'],
        // 메뉴 사진 중에 2MB 에 가까운 원본이 있어 기본 한도(2MB)를 올려 둔다.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // 오프라인에서 어느 주소로 들어와도 앱이 열리게 한다. base 를 포함해야 한다.
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
    spaFallback(),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
