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
        //
        // question — 여쭙는 글. 질문 3개 · 드실 곳 · 추천 결과 제목이 쓴다.
        // 34px 로는 멀리서 안 읽힌다고 하셔서 46px 로 올렸다. 줄간격은 1.3배(60px).
        // 46px 이면 '준비해 드릴까요?' 한 덩어리가 390 화면 폭을 넘으므로,
        // 질문을 끊는 자리(QuestionTitle 의 lines)도 함께 잘게 나눠 두었다.
        question: ['46px', { lineHeight: '60px', letterSpacing: '-0.02em' }],
        // screen-title — 여쭙는 글이 아닌 화면 제목 (장바구니 · 주문 확인 · 주문 완료 · 잔 수).
        // question 이 46px 로 올라가면서 갈라져 나온 예전 크기 그대로다.
        'screen-title': ['34px', { lineHeight: '46px', letterSpacing: '-0.02em' }],
        btn: ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'card-title': ['26px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        // 드실 곳 카드 — 아이콘까지 걷어내고 라벨만 남겼다.
        // 여기만 44px 이 아닌 것은 '매장에서 마시기' 가 일곱 글자라서다.
        // 44px 이면 375px 화면에서 두 줄로 접힌다. (한 줄에 들어가는 상한이 36px)
        'choice-title': ['36px', { lineHeight: '46px', letterSpacing: '-0.02em' }],
        // 질문 화면 선택 카드 라벨 — 아이콘을 걷어낸 자리를 전부 글씨에 줬다 (28px -> 44px).
        // 가장 긴 라벨이 '달콤하게'(네 글자, 172px)라 375px 화면에서도 넉넉하다.
        'choice-label': ['44px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        // 카드 안의 한 줄 설명 — 지금은 쓰는 곳이 없다.
        // (추천 카드·선택 카드의 보조 설명을 모두 걷어냈다. 24px 아래 글씨를 없애기 위해서다)
        caption: ['22px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        body: ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        sub: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        price: ['22px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        // 추천 카드의 값 — 설명을 걷어낸 자리를 글씨 크기로 돌려준다 (22px -> 26px).
        // 다른 화면(장바구니·주문 확인 등)의 값은 price 그대로 두고 여기만 키운다.
        'card-price': ['26px', { lineHeight: '34px', letterSpacing: '-0.01em' }],
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
        // 같은 자리의 내용만 갈아 끼울 때 (추천 결과에서 [다른 메뉴 보기]).
        // 자리는 그대로 두고 색만 스며들게 한다. 움직이면 화면이 바뀐 것처럼 보인다.
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
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
        fade: 'fade 200ms ease-out both',
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
