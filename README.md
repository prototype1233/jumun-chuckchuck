# 주문 척척 (JumunChuckChuck)

> 줄에서 벗어나, 내 손 안에서 천천히.
> 질문 세 개에만 답하면 메뉴가 정해지는 **고령자 전용 카페 주문 도우미**입니다.

초고령사회 한국에서 어르신들은 키오스크의 작은 글씨, 영어 메뉴명, 뒷사람 눈치 때문에 주문을 포기합니다.
주문 척척은 **줄에서 벗어나 스마트폰으로 메뉴를 정하고, 키오스크에서는 카드 결제만** 하도록 도와줍니다.

- 회원가입 없음 · 계좌 연동 없음 · **앱에서는 결제하지 않음**
- 매장은 GPS로 자동 인식 (매장 선택 단계 자체가 없음)
- 백엔드 없이 혼자 완결되게 동작하는 시연용 MVP

---

## 1. 실행 방법

```bash
npm install
npm run dev
```

- 실행되면 터미널에 `Local` / `Network` 주소가 뜹니다.
- Codespaces에서는 `vite.config.ts`에 `server: { host: true }`가 설정돼 있어 **포트 5173이 자동으로 포워딩**됩니다.

### 스마트폰에서 접속하기 (시연 준비)

1. VS Code 아래쪽 **포트(PORTS)** 탭을 엽니다.
2. `5173` 포트의 표시 여부(Visibility)를 **Public** 으로 바꿉니다.
   (기본값 Private 상태로는 휴대폰에서 열리지 않습니다.)
3. 주소(Forwarded Address)를 복사해 휴대폰 브라우저에 붙여 넣습니다.
4. 휴대폰에서 **무음 모드를 해제**해야 음성 안내가 들립니다.

### 빌드 확인

```bash
npm run build     # 타입 검사 + 프로덕션 빌드
npm run preview   # 빌드 결과 확인
```

---

## 2. 이미지 넣기

### 로고

로고는 `public/logo.png` 하나만 교체하면 앱 전체에 반영됩니다.

- 파일이 없으면 같은 모양의 파란 그라데이션 워드마크가 대신 표시됩니다.
- 로고는 **시작 화면(폭 70%) · 주문 완료 화면(폭 30%, opacity 0.5) · 파비콘** 세 곳에만 씁니다.
  다른 화면 헤더에는 넣지 않습니다.

### 메뉴 사진

메뉴마다 사진을 따로 두지 않고, 비슷한 종류끼리 **사진 묶음(imageGroup)** 을 함께 씁니다.

```
public/menu/coffee-ice.jpg   coffee-hot.jpg
            latte-ice.jpg    latte-hot.jpg
            tea-ice.jpg      tea-hot.jpg
```

사진을 찾는 순서는 이렇습니다.

1. `menu.image` — 그 메뉴만 쓰는 사진 (선택 입력)
2. `/menu/{imageGroup}.jpg` — 묶음 사진
3. 둘 다 없으면 **파란 그라데이션 + 메뉴 첫 글자** 로 대체 (사진이 없어도 앱이 깨지지 않습니다)

사진 위에 글씨를 얹거나 어둡게 덮지 않습니다.
원본 고해상도 사진은 `assets-original/` 에 백업해 두었고, `public/menu/` 에는
640×640 정사각으로 줄인 파일이 들어 있습니다. (합계 9.6MB → 220KB, 휴대폰 로딩 속도용)

원본을 다시 줄이려면:

```bash
npm i --no-save sharp
node --input-type=module -e "
import sharp from 'sharp'; import { readdir } from 'node:fs/promises'
for (const f of await readdir('assets-original'))
  await sharp('assets-original/'+f).rotate()
    .resize(640,640,{fit:'cover'}).jpeg({quality:82,mozjpeg:true})
    .toFile('public/menu/'+f)
"
```

---

## 3. 화면 흐름 (8개)

| 순서 | 화면      | 주소       | 내용                                         |
| ---- | --------- | ---------- | -------------------------------------------- |
| 1    | 시작      | `/`        | 로고 + "오늘도 편하게 주문하세요" + 시작하기 |
| 2    | 드실 곳   | `/dine`    | 매장에서 마시기 / 포장하기                   |
| 3    | 질문 1    | `/q/1`     | 커피 / 음료                                  |
| 4    | 질문 2    | `/q/2`     | 시원함 / 따뜻함                              |
| 5    | 질문 3    | `/q/3`     | 달콤함 / 담백함                              |
| 6    | 추천 결과 | `/result`  | 메뉴 3개 추천(사진 120px), 하나 선택         |
| 7    | 주문 확인 | `/confirm` | 고른 메뉴 사진 240px + [이걸로 할게요]       |
| 8    | 주문 완료 | `/done`    | 네 자리 대기번호 + 키오스크 3단계 안내       |

질문 화면에서는 답을 고르면 0.4초 뒤 자동으로 다음 질문으로 넘어갑니다.
**자동 타임아웃은 어디에도 없습니다.** 화면은 사용자가 누를 때만 움직입니다.

---

## 4. 심사위원 앞 시연 시나리오 (약 90초)

> 준비: 휴대폰 세로 화면, 소리 켬, 앱은 시작 화면(`/`)에 둔 상태

**① 문제 제기 (15초)**
"카페 키오스크 앞에서 어르신이 주문을 포기하는 이유는 세 가지입니다.
글씨가 작고, 메뉴가 영어이고, 뒷사람 눈치가 보입니다.
주문 척척은 **줄에 서기 전에** 메뉴를 정해 드립니다."

**② 시작 (10초)**
시작 화면을 보여 주며 — "가입도, 계좌 연동도 없습니다. 누르면 바로 시작합니다."
→ **[시작하기]** 터치.

**③ 질문 3개 (30초)**
"매장은 GPS로 이미 인식돼 있어서 매장을 고르는 단계가 없습니다."
→ **[매장에서 마시기]** → **[다음]**
→ **[커피]** → **[따뜻함]** → **[담백함]**

이때 강조할 점:
- 한 화면에 **질문 하나, 선택지 둘**. 스크롤이 필요 없습니다.
- 화면에 들어올 때마다 질문을 **음성으로 읽어 줍니다**. (우측 상단에서 끌 수 있습니다)
- 하단 **자막 바**에 지금 무엇을 하면 되는지 항상 떠 있습니다.
- 좌측 상단 **뒤로가기**는 항상 같은 자리에 있고, 시간이 지나도 화면이 저절로 넘어가지 않습니다.

**④ 추천 결과 (15초)**
"세 가지 답변으로 17개 메뉴 중 세 개를 골라 드립니다. 첫 번째가 가장 인기 있는 메뉴입니다.
글씨를 못 읽으셔도 사진으로 고르실 수 있습니다."
→ **[따뜻한 아메리카노]** 터치.

**⑤ 주문 확인 (10초)**
"고른 메뉴를 사진으로 크게 한 번 더 보여 드립니다. 잘못 눌렀어도 여기서 되돌릴 수 있습니다."
→ **[이걸로 할게요]** 터치.

**⑥ 주문 완료 — 핵심 차별점 (20초)**
"여기서 **결제하지 않습니다.** 대기번호만 드립니다.
어르신은 이 번호를 키오스크에 누르고 카드만 넣으시면 됩니다.
개인정보도, 카드 등록도 필요 없습니다. 그래서 자녀 도움 없이 혼자 쓸 수 있습니다."
→ 96px 대기번호와 3단계 안내를 보여 주며 마무리.

**보조 시연 (질문이 나오면)**
- 우측 상단 **[소리 켬]** 을 눌러 음성이 즉시 멈추는 것 시연
- **[다시 고를래요]** 로 언제든 질문부터 다시 할 수 있음
- 데스크톱 브라우저에서 열면 가운데 정렬로 보인다는 점

---

## 5. 폴더 구조

```
src/
├─ components/     Button, ChoiceCard, ScreenLayout, ProgressDots, SubtitleBar,
│                  Logo, MenuImage, Icons, InstallGuide, OfflineNotice
├─ screens/        Welcome, DineOption, Question, Result,
│                  Quantity, Cart, OrderConfirm, OrderComplete
├─ context/        OrderContext.tsx   — Context + useReducer (외부 상태 라이브러리 없음)
├─ logic/          recommend.ts       — 추천 규칙 (순수 함수)
│                  cart.ts            — 잔 수·금액 계산
├─ data/           menus.ts (17종), stores.ts
├─ hooks/          useSpeech.ts       — Web Speech API (ko-KR)
│                  useAutoAdvance.ts  — 선택 후 자동 전환 (400ms)
│                  useOnline.ts       — 인터넷 연결 상태
├─ constants.ts    AUTO_ADVANCE_MS
├─ assetUrl.ts     public/ 자산 경로에 base 를 붙임 (GitHub Pages 대응)
├─ types.ts
├─ App.tsx         라우팅 + 200ms 전환
└─ index.css

scripts/
├─ gen-icons.mjs   npm run icons — PWA 아이콘 생성
└─ gen-qr.mjs      npm run qr    — 배포 주소 QR 생성

.github/workflows/
└─ deploy.yml      main 푸시 시 GitHub Pages 자동 배포
```

## 6. 추천 로직

`src/logic/recommend.ts` 의 `recommendMenus(answers, menus)` 순수 함수입니다.

조건을 단계적으로 완화해 **결과가 0개가 되는 경우가 없도록** 보장합니다.

1. 종류 + 온도 + 당도 모두 일치
2. 부족하면 **당도** 조건 완화
3. 그래도 부족하면 **온도** 조건까지 완화
4. 최후에는 전체 메뉴 인기순

정렬은 인기순, 같으면 저렴한 순입니다. (부담이 적은 쪽 우선)

### 나중에 LLM 추천으로 바꾸려면

`RecommendationEngine` 인터페이스를 구현한 `LlmEngine`을 만들고,
파일 아래쪽 `defaultEngine` 한 줄만 교체하면 됩니다. 화면 코드는 고칠 필요가 없습니다.
자세한 방법은 `recommend.ts` 상단 주석에 적어 두었습니다.

## 7. 접근성 원칙 (코드에 강제되어 있음)

- 모든 터치 영역 **최소 높이 88px**, 요소 간 간격 **20px 이상**
- 한 화면에 **선택지 최대 3개**, 390×844 기준 **모든 화면 스크롤 없음** (헤드리스 브라우저로 실측)
- 좌측 상단 **뒤로가기**(아이콘+글씨 24px) 고정, **자동 타임아웃 없음**
- 우측 상단 **소리 켜기/끄기** — 끄면 읽던 문장을 즉시 중단
- 하단 **자막 바** 고정 (음성 안내와 같은 내용을 글로 제공)
- **영어·외래어 금지** ('뒤로가기' O / 'BACK' X)
- 본문 `#16233D`, 보조 `#5B6B84` — 이보다 연한 회색 텍스트를 쓰지 않음 (WCAG AAA)
- 하단 탭바 · 햄버거 메뉴 · 드롭다운 · 모달 사용 안 함

## 8. 기술 스택

React 18 · TypeScript · Vite · Tailwind CSS · react-router-dom · Web Speech API
(백엔드 없음, 외부 상태관리 라이브러리 없음)

---

## 9. 배포 (GitHub Pages)

배포 주소는 **https://prototype1233.github.io/jumun-chuckchuck/** 입니다.

### 9-1. 처음 한 번만 하는 설정

GitHub 저장소 화면에서 **Settings → Pages → Build and deployment → Source** 를
**`GitHub Actions`** 로 바꿔 주세요. (기본값인 `Deploy from a branch` 로 두면 배포가 되지 않습니다.)

이 설정은 웹에서만 할 수 있고, 한 번만 해 두면 됩니다.

### 9-2. 배포하기

`main` 브랜치에 푸시하면 끝입니다.

```bash
git add -A
git commit -m "메시지"
git push origin main
```

`.github/workflows/deploy.yml` 이 자동으로 돌면서 `npm ci` → `npm run build` →
Pages 업로드까지 처리합니다. 진행 상황은 저장소의 **Actions** 탭에서 볼 수 있고,
초록색 체크가 뜨면 1분 안에 주소에 반영됩니다.

수동으로 다시 배포하려면 Actions 탭에서 **Run workflow** 를 누르면 됩니다.

### 9-3. 저장소 이름을 바꾼다면

`vite.config.ts` 맨 위의 `BASE` 한 줄만 고치면 됩니다.

```ts
const BASE = '/jumun-chuckchuck/'   // ← 저장소 이름
```

라우터 basename, PWA manifest 의 `start_url`·`scope`, 서비스 워커 등록 경로,
메뉴 사진 경로가 모두 이 값을 따라가므로 다른 곳은 고칠 필요가 없습니다.

### 9-4. 배포 후 확인 목록

브라우저에서 주소를 연 뒤 아래를 확인하세요.

| 확인할 것 | 정상이면 |
|---|---|
| 시작 화면 | 로고와 [시작하기] 가 보임 |
| **메뉴 사진** | 추천 화면에서 사진 3장이 보임 (파란 네모에 글자 하나만 나오면 경로가 깨진 것) |
| **새로고침** | 질문 화면에서 F5 를 눌러도 404 가 아니라 그 화면이 다시 뜸 |
| **홈 화면에 추가** | 추가한 아이콘을 눌렀을 때 앱이 열림 |
| 오프라인 | 비행기 모드로 바꿔도 앱이 열리고 메뉴를 볼 수 있음 |

개발자 도구로 더 정확히 보려면 **Application** 탭에서

- **Manifest** — `start_url` 과 `scope` 가 둘 다 `/jumun-chuckchuck/` 인지
- **Service Workers** — `.../jumun-chuckchuck/sw.js` 가 `activated` 인지
- **Console** — 빨간 오류가 없는지 (`logo.png` 404 는 9-6 참고)

> **왜 start_url 과 scope 를 확인해야 하나요?**
> 이 값이 base 와 어긋나면 설치는 정상적으로 되는데
> **홈 화면 아이콘을 눌러도 앱이 열리지 않습니다.** 증상이 조용해서 놓치기 쉽습니다.

### 9-5. 새로고침 404 대응

GitHub Pages 는 SPA 를 몰라서 `/result` 같은 주소를 새로고침하면 파일을 못 찾습니다.
그래서 빌드할 때 `index.html` 과 **똑같은 내용의 `404.html`** 을 함께 만들어 둡니다
(`vite.config.ts` 의 `spa-404-fallback` 플러그인).

Pages 는 없는 주소에 404.html 을 **주소를 바꾸지 않고** 돌려주므로,
앱이 뜬 뒤 라우터가 해당 화면을 그립니다. 서비스 워커가 설치된 뒤에는
`navigateFallback` 이 같은 일을 오프라인에서도 해 줍니다.

### 9-6. 아이콘과 로고

PWA 아이콘은 **로컬에서 만들어 커밋**합니다. CI 에서는 다시 만들지 않습니다.

```bash
npm run icons     # public/icons/*, public/apple-touch-icon.png 생성
```

> GitHub Actions 러너에는 한글 폰트가 없을 수 있어서, CI 에서 아이콘을 만들면
> 글자가 깨진(네모로 나오는) 아이콘이 배포될 수 있습니다. 그래서 일부러 CI 에서 제외했습니다.
> **로고를 바꿨다면 로컬에서 `npm run icons` 를 돌리고 결과를 꼭 커밋하세요.**

현재 `public/logo.png` 는 없고 `public/logo.svg` 만 있습니다.

- 아이콘 생성기는 `logo.png` 를 먼저 찾고, 없으면 `logo.svg` 로 만듭니다.
- 화면의 로고(`Logo.tsx`)도 `logo.png` 를 먼저 찾고, 없으면 같은 모양의 SVG 를 그립니다.
  그래서 **로고는 정상으로 보이지만 콘솔에 `logo.png` 404 가 한 줄 남습니다.**
- 진짜 로고 파일을 `public/logo.png` 로 넣고 `npm run icons` 를 다시 돌리면
  404 도 사라지고 아이콘도 함께 갱신됩니다.

### 9-7. 현장 시연용 QR 코드

어르신 휴대폰에 주소를 타이핑하게 할 수는 없으니 QR 로 준비합니다.

```bash
npm run qr                  # 기본 배포 주소
npm run qr -- <다른 주소>   # Codespaces 미리보기 주소 등
```

- 터미널에 QR 이 바로 찍혀 그 자리에서 확인할 수 있습니다.
- `public/qr.png` (1024px) — 화면에 띄우거나 문서에 붙일 때
- `public/qr.svg` (벡터) — 크게 인쇄할 때

인쇄해서 쓸 것을 고려해 오류 보정 수준을 가장 높게(H) 잡았습니다.
종이가 조금 구겨지거나 가려져도 읽힙니다.
