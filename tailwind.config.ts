import type { Config } from 'tailwindcss'

/**
 * 주문 척척 디자인 토큰
 * - 색은 로고(파란 그라데이션 워드마크) 기준으로만 구성한다.
 * - ink-sub 보다 연한 회색 텍스트 토큰은 일부러 만들지 않았다. (WCAG AAA 대비 유지)
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-deep': '#1B3FA0', // 로고 그라데이션 시작
        brand: '#2563EB', // CTA·포인트 — 화면당 한 곳만
        'brand-light': '#3B7DF5', // 로고 그라데이션 끝
        'brand-tint': '#EFF4FF', // 선택 상태 배경
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        ink: '#16233D', // 본문 텍스트
        'ink-sub': '#5B6B84', // 보조 텍스트 (이보다 연한 회색 금지)
        line: '#E4E8F0', // 얇은 구분선 전용 (텍스트에 쓰지 말 것)
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        // [크기, 줄간격] — 고령자 가독성을 위해 줄간격을 넉넉히 잡는다.
        question: ['34px', { lineHeight: '46px', letterSpacing: '-0.02em' }],
        btn: ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'card-title': ['26px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        body: ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        sub: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        price: ['22px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        // 잔 수 선택 화면에서 고른 메뉴를 확인시켜 주는 크기
        menu: ['30px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        amount: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        // 잔 수 카드의 큰 숫자
        count: ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        // 장바구니 총 금액
        total: ['32px', { lineHeight: '42px', letterSpacing: '-0.02em' }],
        waiting: ['96px', { lineHeight: '104px', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        card: '28px',
        cta: '24px',
      },
      spacing: {
        touch: '88px', // 최소 터치 영역 높이
        cta: '96px', // 하단 CTA 버튼 높이
      },
      boxShadow: {
        // 테두리 대신 아주 부드러운 그림자만 사용한다.
        card: '0 2px 16px rgba(22, 35, 61, 0.06)',
        'card-selected': '0 4px 20px rgba(37, 99, 235, 0.14)',
      },
      keyframes: {
        // 화면 전환: 200ms 페이드 + 아주 짧은 슬라이드
        enter: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        enter: 'enter 200ms ease-out both',
        'rise-in': 'rise-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
