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
        // 값이 var(--fs-*) 인 것은 화면 세로 길이에 따라 줄어드는 글자다.
        // 실제 숫자는 src/index.css 의 토큰에 적혀 있다.
        // 휴대폰 세로 화면에서는 아래 주석에 적힌 px 값 그대로 나온다. (줄어드는 것은 데스크톱뿐)
        //
        // question — 여쭙는 글. 질문 3개 · 드실 곳이 쓴다.
        // (추천 결과 제목은 크기가 갈라져 아래 result-title 로 나갔다)
        // 56px 로도 아직 작다고 하셔서 64px 로 올렸다. 줄간격은 1.25배(80px).
        // 64px 에서 한 줄에 들어가는 한글은 390px 화면 기준 다섯 자다.
        // 질문을 끊는 자리(QuestionTitle 의 lines)도 그 폭에 맞춰 다시 나눴다.
        question: ['var(--fs-question)', { lineHeight: 'var(--lh-question)', letterSpacing: '-0.02em' }],
        // screen-title — 여쭙는 글이 아닌 화면 제목 (장바구니 · 주문 확인 · 주문 완료 · 잔 수).
        // question 이 46px 로 올라가면서 갈라져 나온 예전 크기 그대로다. (34px)
        'screen-title': ['var(--fs-screen-title)', { lineHeight: 'var(--lh-screen-title)', letterSpacing: '-0.02em' }],
        // 버튼 라벨 (시작하기 · 다음 · 다시 고를래요 …) — 34px -> 40px
        btn: ['var(--fs-btn)', { lineHeight: 'var(--lh-btn)', letterSpacing: '-0.02em' }],
        // 좌측 상단 뒤로가기 — 30px -> 34px
        back: ['var(--fs-back)', { lineHeight: 'var(--lh-back)', letterSpacing: '-0.02em' }],
        // 26px
        'card-title': ['var(--fs-card-title)', { lineHeight: 'var(--lh-card-title)', letterSpacing: '-0.02em' }],
        // 드실 곳 카드 — 아이콘까지 걷어내고 라벨만 남겼다. (36px -> 44px)
        // 여기만 52px 이 아닌 것은 '매장에서 마시기' 가 일곱 글자라서다.
        // 44px 이 375px 화면에서 한 줄에 들어가는 상한이다. (269px / 카드 안쪽 폭 281px)
        // 46px 이면 284px 라 '매장에서 / 마시기' 로 접힌다.
        'choice-title': ['var(--fs-choice-title)', { lineHeight: 'var(--lh-choice-title)', letterSpacing: '-0.02em' }],
        // 질문 화면 선택 카드 라벨 — 52px 도 작다고 하셔서 60px 로 올렸다.
        // 가장 긴 라벨이 '달콤하게'(네 글자)라 360px 화면에서도 한 줄에 들어간다.
        'choice-label': ['var(--fs-choice-label)', { lineHeight: 'var(--lh-choice-label)', letterSpacing: '-0.02em' }],
        // 아래 넷은 접근성 최소 크기(본문 20px)에 걸려 있어 어떤 화면에서도 줄이지 않는다.
        //
        // 카드 안의 한 줄 설명 — 지금은 쓰는 곳이 없다.
        // (추천 카드·선택 카드의 보조 설명을 모두 걷어냈다. 24px 아래 글씨를 없애기 위해서다)
        caption: ['22px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        body: ['20px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        sub: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        price: ['22px', { lineHeight: '30px', letterSpacing: '-0.01em' }],
        // 추천 카드의 값 — 32px 도 작다고 하셔서 38px 로 올렸다.
        // 다른 화면(장바구니·주문 확인 등)의 값은 price 그대로 두고 여기만 키운다.
        'card-price': ['var(--fs-card-price)', { lineHeight: 'var(--lh-card-price)', letterSpacing: '-0.01em' }],
        // 추천 카드의 메뉴 이름 — menu(잔 수 화면과 함께 쓰던 것)에서 갈라져 나왔다.
        // 이 이름만 사진 옆 좁은 폭에서 두 줄에 들어가야 해서 기기마다 크기가 다르다.
        // 시연 기기(390x844)에서 42px, 아이폰 SE(375x667)에서만 30px 이다.
        'recommend-name': ['var(--fs-recommend-name)', { lineHeight: 'var(--lh-recommend-name)', letterSpacing: '-0.02em' }],
        // 추천 결과 화면의 제목 — question(64px) 에서 갈라져 나왔다.
        // 한 줄에 들어가야 카드 셋이 자리를 얻는다. 폭이 385px 이 안 되면 56px 로 내려간다.
        'result-title': ['var(--fs-result-title)', { lineHeight: 'var(--lh-result-title)', letterSpacing: '-0.02em' }],
        // 잔 수 화면에서 고른 메뉴 이름 (36px -> 42px)
        // (추천 결과의 이름은 위 recommend-name 으로 갈라져 나갔다)
        menu: ['var(--fs-menu)', { lineHeight: 'var(--lh-menu)', letterSpacing: '-0.02em' }],
        // 24px
        amount: ['var(--fs-amount)', { lineHeight: 'var(--lh-amount)', letterSpacing: '-0.01em' }],
        // 잔 수 카드의 큰 숫자 (48px)
        count: ['var(--fs-count)', { lineHeight: 'var(--lh-count)', letterSpacing: '-0.02em' }],
        // 장바구니 총 금액 (32px)
        total: ['var(--fs-total)', { lineHeight: 'var(--lh-total)', letterSpacing: '-0.02em' }],
        // 대기번호 (96px)
        waiting: ['var(--fs-waiting)', { lineHeight: 'var(--lh-waiting)', letterSpacing: '0.02em' }],
        // 주문 완료 화면의 3단계 안내 (40px) — body(20px) 에서 갈라져 나왔다.
        // 이 화면에는 이제 이 글과 제목뿐이라, 매장 기계 앞에서 읽을 이 글을 가장 크게 둔다.
        // 한 줄에 담기지 않아 두 줄로 접힌다 — break-keep 으로 낱말은 쪼개지지 않게 한다.
        step: ['var(--fs-step)', { lineHeight: 'var(--lh-step)', letterSpacing: '-0.02em' }],
        // 그 앞 번호 배지 안의 숫자 (32px)
        'step-num': ['var(--fs-step-num)', { lineHeight: 'var(--lh-step-num)', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        card: '28px',
        cta: '24px',
      },
      spacing: {
        // 화면이 짧으면 줄어들되 72px 아래로는 내려가지 않는다. (src/index.css 토큰)
        touch: 'var(--h-touch)', // 최소 터치 영역 높이 (휴대폰 88px)
        cta: 'var(--h-cta)', // 하단 CTA 버튼 높이 (휴대폰 96px)
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
