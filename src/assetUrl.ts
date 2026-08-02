/**
 * public/ 아래 파일의 실제 주소를 만든다.
 *
 * GitHub Pages 는 저장소 이름이 주소 앞에 붙기 때문에
 * '/menu/hot-yuja.jpg' 를 그대로 쓰면 저장소 밖(도메인 최상위)을 찾아가 404 가 난다.
 * 화면에서 사진을 그릴 때는 반드시 이 함수를 거친다.
 *
 *   assetUrl('/menu/hot-yuja.jpg')
 *     → 개발 중        : '/menu/hot-yuja.jpg'
 *     → GitHub Pages   : '/jumun-chuckchuck/menu/hot-yuja.jpg'
 *
 * BASE_URL 은 vite 의 base 값이고 항상 '/' 로 끝난다.
 */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
