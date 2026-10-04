# SPOT ME — 토스 참고 기술 스택 전환본

## 현재 실행 위치 (2026-10-05)

Next.js 앱은 저장소 루트 `D:/Github/spotme-site`로 이동했습니다.
이 폴더에서 `npm ci`, `npm run dev`, `npm run build`, `npm run start`를 실행합니다.
개발 포트는 4189, 프로덕션 테스트 포트는 4192입니다.

- 현재 코드: `app/`, `src/`, `public/`, `scripts/`.
- 이전 루트 사이트·Vite 앱·모션 실험본은 정리했습니다. 이동 직후 커밋 `c8a4637`에서 복구할 수 있습니다.
- 원본 자료: `v3/designs/`와 `스팟미_웹사이트_260925_v1/`에 보존.
- `v3/next-site/`에는 이전 환경·Vercel 연결 설정만 남아 있습니다. 캐시·의존성은 정리했습니다.
- 이번 이동은 원격 설정 변경이나 배포를 포함하지 않습니다.

아래는 과거 기록입니다. 과거의 실행 위치 대신 현재 저장소 루트를 사용하세요.

2026-09-28. 기존 `../react-site/`는 보존하고 별도 Next.js App Router 프로젝트로 이관했다.

## 운영 배포 — 2026-10-01

- 후속 배포: 홈 브라우저 제목을 `SPOT ME | 혼자 막혔던 운동, 레미와 함께.`로 변경. 배포 `dpl_FMU8FHnjG3budtHaXJV1kWe1xHCj` (production, READY), 운영 브라우저에서 제목 및 HTTP 200 확인.

- 사용자 요청으로 현재 `v3/next-site` 작업본을 https://spotme-site.vercel.app/ 에 운영 배포했다.
- 배포 ID: `dpl_3cLScmRz9e9VBS1chZvJrcCT1zPg` (production, READY).
- 배포 주소: https://spotme-site-7h4hbnhck-gnb1202-navercoms-projects.vercel.app
- 원격 빌드 성공(20개 페이지). 운영 4개 경로의 HTTP 200, 홈 이미지 6개의 로컬/운영 SHA-256 일치, 비로그인 브라우저 접근, 최신 문구·굵은 그래프·배경색, 구간 스크롤, 레미 전환, 휴대폰 4화면 및 모바일 전체 노출을 확인했다. 브라우저 오류 0건.
- 검증 기록: `../reports/home-phone/production-checks-20261001.json` 및 `production-*-20261001.png`. Git 커밋/푸시, 루트 배포 설정 및 환경 파일 변경은 수행하지 않았다.

## 이전 운영 배포 — 2026-09-29

- 사용자 승인 후 https://spotme-site.vercel.app/ 의 홈을 현재 시안으로 교체했다. `/concept/`도 유지하며 기존 상세 페이지 경로는 그대로다.
- 배포 ID: `dpl_aA8Q8wcQdRUtaPQGeUDJ61M8tdev` (production, READY).
- 로컬 및 Vercel 빌드 성공(18개 페이지), 운영 7개 경로·51개 에셋 검사 PASS. 운영 홈의 비로그인 열람과 레미 루틴 결과 표시를 브라우저에서 확인했다. 전체 모바일/모든 인터랙션 회귀 QA를 수행한 것은 아니다.
- 기록: `reports/experience/production-home-20260929.png`. Git 커밋/푸시는 수행하지 않았다.
- 운영 배포 명령: 이 폴더에서 `npx --yes vercel@59.15.1 deploy --prod --yes --scope gnb1202-navercoms-projects`.

## 앞선 미리보기 배포 기록 — 2026-09-29

- 현재 시안: https://spotme-site-r6vmtdsnw-gnb1202-navercoms-projects.vercel.app/concept/
- Vercel 프로젝트: `spotme-site`, 배포 ID: `dpl_GcLDXh3yzVp9AGc4VF2dVdGq6t8M`.
- Preview 배포만 수행했다. `spotme-site.vercel.app` 운영 홈, 루트의 기존 Vite 배포 설정, Git 원격은 변경하지 않았다.
- Vercel의 미리보기 로그인 보호를 유지했다. 열람 시 해당 프로젝트 접근 권한이 있는 Vercel 계정 로그인이 필요하다.
- 원격 Next.js 빌드 성공(18개 페이지), 인증된 `/concept/` 응답과 주요 문구 확인. 비로그인 브라우저에서는 로그인 화면까지만 확인했으며 배포 환경 전체 브라우저 QA를 완료한 것은 아니다.
- 이 폴더의 `vercel.json`을 사용한다. `.vercelignore`에서 로컬 환경 변수, QA 보고서, 검증 스크립트 및 에셋 원본 경로가 담긴 manifest를 제외한다.

```powershell
cd D:\Github\spotme-site\v3\next-site
npx --yes vercel@59.15.1 deploy --target preview --yes --scope gnb1202-navercoms-projects
```

위 미리보기 이후 운영 홈 교체가 승인되어 배포를 완료했다. 저장소 루트에서 배포하면 이전 Vite 사이트 설정이 사용되므로 주의한다.

## 실행

```powershell
cd D:\Github\spotme-site\v3\next-site
npm ci
npm run dev
```

개발: http://127.0.0.1:4189/ . `npm run build` 후 `npm run start`는 http://127.0.0.1:4192/ 에서 빌드본을 제공한다.

## 구현한 구성과 확인 범위

| 기술 | 적용 | 토스와의 관계 |
|---|---|---|
| Next.js | 15.5.24, App Router, 서버 페이지와 12개 경로 정적 사전 렌더링 | 공개 번들에서 확인한 버전과 동일 |
| React / React DOM | 19.2.8 | 토스 번들의 19.2 canary 대신 보안 패치된 같은 계열 선택 |
| Motion | 13.4.4, 메뉴 강조·화면 전환 | 토스에서 계열 코드 확인, 정확한 버전 미확인 |
| Lenis | 1.3.26, 일반 페이지 부드러운 스크롤 | 토스의 lenis-prevent 흔적을 근거로 채택, 원본 사용/버전 확정 아님 |
| Lottie | lottie-web 5.13.0, 지연 로딩 컴포넌트 준비 | 토스에서 로더 확인, 정확한 버전 미확인 |
| GSAP | 3.15.0, 기존 승인된 모션 실험에서만 유지 | SPOT ME 기존 의존성, 토스 사용 여부 미확인 |
| PostCSS | override 8.5.28 | 설치 감사에서 발견한 하위 패키지 취약점 패치 |

토스의 내부 소스/배포 인프라/전체 의존성을 복제한 것은 아니다. 토스 영상·브랜드 에셋은 가져오지 않았다. Lottie 재생 컴포넌트는 준비됐지만 승인된 SPOT ME JSON이 없어 실제 화면에 신규 그래픽을 추가하지 않았다. MP4도 신규 제작/추가하지 않았다.

## 보존과 동작

- 기존 v3 React 버전의 정확한 데이터·폰트·에셋을 복사했다. 이전 Rail 등 다른 디자인을 가져오지 않았다.
- 브라우저 history 직접 조작 대신 Next Link와 App Router로 페이지를 이동한다.
- 상단 메뉴의 Motion 강조와 페이지 겹침 전환을 유지한다.
- 페이지 코드·이미지는 진입 후 미리 불러오며, Next 라우트도 prefetch한다.
- Lenis는 모션 감소 설정 및 `?experience=scroll` 실험에서 끈다. 경로 변경 시 인스턴스를 정리하며 터치의 기본 스크롤을 유지한다.
- 기존 오프닝은 `/?experience=scroll&variant=a`에서만 실행한다. 기본 홈 자동 실행 없음.
- 기존 전체 모션 실험의 재검증과 새 반응형 디자인 작업은 이번 기술 이관과 별개다.

## 확인 기록

- Next.js 프로덕션 빌드 성공, 12개 경로 SSR 응답 200 및 존재하지 않는 경로 404 확인.
- 복사한 에셋 156개 SHA-256이 React 원본과 일치.
- 패치 적용 후 npm audit: 취약점 0건.
- 전체 Figma 픽셀 일치·전체 모바일 QA를 새로 인증한 것은 아니다.

참조: https://toss.im/ , https://nextjs.org/docs/app , https://github.com/darkroomengineering/lenis , https://github.com/airbnb/lottie-web
