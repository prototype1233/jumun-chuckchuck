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
        dot: '#D4DAE3', // 진행 점 중 지나간·안 지난 점 (텍스트에 쓰지 말 것)
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
        // 드실 곳 카드처럼 선택지가 둘뿐이라 더 크게 보여 줄 수 있는 자리 (28px -> 32px)
        'choice-title': ['32px', { lineHeight: '42px', letterSpacing: '-0.02em' }],
        // 카드 안의 한 줄 설명 — 18px 는 작아서 안 읽힌다고 하셔서 22px 로 올렸다.
        caption: ['22px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
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
        // 말소리를 듣고 있는 동안 마이크가 통통 뛴다. '지금 듣고 있어요' 를 글 없이 알린다.
        'mic-bounce': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-14px) scale(1.06)' },
        },
        // 마이크 뒤로 퍼지는 물결
        'mic-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.45' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        // ── 아래 셋은 키오스크 시연 화면(screens/Kiosk.tsx) 전용 ──
        // 스캔 영역을 위아래로 훑는 빛. '지금 읽고 있다' 를 글 없이 알린다.
        'scan-line': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(var(--scan-travel, 200px))' },
        },
        // 카드가 아래 투입구로 쑥 들어갔다가 다시 나온다.
        // 사라지는 것은 opacity 가 아니라 부모의 overflow-hidden 이 잘라 주는 것이다.
        // (투명해지는 것보다 '경계 아래로 들어갔다' 로 보여야 투입구처럼 읽힌다)
        'card-insert': {
          '0%': { transform: 'translateY(0) rotate(-2deg)' },
          '45%': { transform: 'translateY(132px) rotate(0deg)' },
          '78%': { transform: 'translateY(132px) rotate(0deg)' },
          '100%': { transform: 'translateY(0) rotate(-2deg)' },
        },
        // 투입구 둘레가 천천히 밝아졌다 어두워진다
        'slot-glow': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        enter: 'enter 200ms ease-out both',
        'rise-in': 'rise-in 200ms ease-out both',
        'mic-bounce': 'mic-bounce 1s ease-in-out infinite',
        'mic-ring': 'mic-ring 1.6s ease-out infinite',
        'scan-line': 'scan-line 2.4s ease-in-out infinite',
        'card-insert': 'card-insert 2.2s ease-in-out infinite',
        'slot-glow': 'slot-glow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
