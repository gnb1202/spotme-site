# SPOT ME — 웹사이트

## 현재 운영 배포 대상 — Next.js

2026-09-29 운영 홈 교체 요청에 따라 `v3/next-site/`의 최신 시안을 `/`에 연결했습니다. AI·게임·레미·영상 상세 경로는 유지합니다. 배포는 **반드시 아래 폴더에서** 실행합니다. 루트의 Vite 설정은 이전 버전용이며 현재 운영 배포에 사용하지 않습니다.

```powershell
cd D:\Github\spotme-site\v3\next-site
npm run build
npx --yes vercel@59.15.1 deploy --prod --yes --scope gnb1202-navercoms-projects
```

운영 주소: https://spotme-site.vercel.app/ . 배포 기록과 검증 범위는 `v3/next-site/README.md`를 참고합니다.

## 이전 기본 구현 — React/Vite (보존 기록)

2026-09-28 토스 참고 기술 스택 실험은 `v3/next-site/`에 별도로 구성했습니다. Next.js App Router + React + Motion + Lenis + Lottie 기반이며 개발 포트는 4189, 빌드본 확인 포트는 4192입니다. 아래 Vite 버전과 현재 배포 설정은 비교를 위해 보존했습니다. 세부 차이와 실행 방법은 `v3/next-site/README.md`에 기록했습니다.

2026-09-27부터 기본 개발·빌드 대상은 `v3/react-site/`입니다. React + Vite에 SmoothUI 기반 메뉴와 기존 승인된 에셋을 사용합니다. 기존 정적 사이트는 비교용으로 보존하며 새 빌드에서는 사용하지 않습니다.

```powershell
npm ci --prefix v3/react-site
npm run dev
# 배포용 출력 생성 (배포하지 않음)
npm run build
```

로컬 주소는 http://127.0.0.1:4187/ 입니다. Vercel 설정은 `v3/react-site/dist`로 변경했으며 SPA 직접 경로 접근을 지원합니다. 이번 전환은 로컬 설정 변경이며 운영 배포·원격 푸시·병합은 아직 수행하지 않았습니다.

React의 `public/`과 `src/generated/`는 이제 보존해야 하는 독립 빌드 입력입니다. `sync`는 기존 HTML을 재가져오는 이관 도구이므로 일반 개발·배포에서 실행하지 않습니다. 원본 데이터의 출처 정보는 유지합니다.

## 이전 정적 사이트 기록 (아래 실행·배포 지침은 현재 구성에 적용하지 않음)

## 이전 로컬 제작 작업

2026-09-25 신규 시안 작업은 이 저장소의 `v3/`에서 진행합니다. 에셋 원본은 `스팟미_웹사이트_260925_v1/`입니다. `D:/Github/SpotMe`는 앱 저장소이며 사이트 작업 경로가 아닙니다.

```powershell
cd v3
npm run dev
```

로컬 주소: http://127.0.0.1:4184/ . 신규 작업은 아직 배포하지 않았습니다. 아래 내용과 루트 `public/`은 기존 운영 버전 기록이며 신규 초안으로 교체하지 않았습니다.

## 기존 운영 버전 — Rail

승인된 rail 버전의 정적 웹사이트입니다. 별도의 설치·빌드·환경 변수·백엔드는 필요하지 않습니다.

운영 주소: [spotme-site.vercel.app](https://spotme-site.vercel.app)

## 구성

- `public/`: 실제 배포되는 HTML, CSS, JavaScript, 이미지 51개와 로컬 폰트
- `vercel.json`: Vercel 정적 배포 설정 (`public` 디렉터리만 제공)
- `.vercelignore`: 배포 파일 허용 목록

기본 내비게이션은 번호와 제목이 함께 보이는 연결형 블록 rail이며, 폭은 168px입니다. 화면 폭 1440px 이상에서 표시되고, 좁은 화면에서도 같은 콘텐츠를 연속 스크롤로 읽을 수 있습니다. 기존 원형 rail은 `?rail=circles`로 비교할 수 있습니다.

## 로컬 확인

`public/`을 루트로 정적 HTTP 서버를 실행합니다. 프로젝트 루트 전체를 웹 루트로 사용하지 않습니다.

## Vercel 배포

이 저장소를 연결한 뒤 프로젝트 루트는 저장소 루트, Framework Preset은 **Other**, Output Directory는 **public**으로 설정합니다. 설치와 빌드는 실행하지 않습니다. 관련 설정은 `vercel.json`에 포함되어 있습니다.

운영 소스는 `main` 브랜치이며, GitHub Pages는 중단했습니다. 사이트 실행을 위한 비밀 키나 환경 변수를 추가할 필요가 없습니다.

### 운영 및 검증

로컬 폴더는 `gnb1202-navercoms-projects/spotme-site` 프로젝트에 연결되어 있습니다. 배포는 CLI로 수행하며, GitHub 자동 배포 연동은 해제되어 있습니다. GitHub에 푸시하는 것만으로 사이트가 갱신되지는 않습니다.

Vercel CLI 로컬 빌드 결과의 정적 파일 62개가 승인된 rail 원본과 SHA-256 기준으로 모두 일치함을 확인했습니다. 인증 파일과 빌드 결과는 `.gitignore` 및 `.vercelignore`로 공개 대상에서 제외합니다.

이 PC에서는 재연결 없이 저장소 루트에서 로컬 빌드를 검증할 수 있습니다.

```powershell
npx --yes vercel@59.15.1 build --yes --scope gnb1202-navercoms-projects
```

빌드는 로컬 `.vercel/output`을 생성하며 사이트를 배포하지 않습니다. [공식 빌드 안내](https://vercel.com/docs/cli/build)

### 로컬 파일로 배포 준비

다른 PC에서 처음 설정할 때는 저장소 루트에서 다음 명령으로 로그인하고, 사용할 계정·팀과 프로젝트를 선택합니다. 아래 두 명령은 사이트 배포를 실행하지 않습니다. 연결 도구가 GitHub 연동을 추가할 수 있으므로 자동 배포 사용 여부를 확인합니다.

```powershell
npx --yes vercel@59.15.1 login
npx --yes vercel@59.15.1 link
```

연결이 끝난 뒤 실제 미리보기 배포를 진행할 때만 다음 명령을 실행합니다.

```powershell
npx --yes vercel@59.15.1 deploy --target preview --scope gnb1202-navercoms-projects
```

프로덕션 배포는 `main`에서 검증한 뒤 아래 명령으로 진행합니다. 빌드 결과가 `.vercel/output/static`에 실제로 포함되어 있는지 확인한 뒤 배포합니다. CLI 인증 정보와 `.vercel/` 연결 정보는 저장소에 커밋하지 않습니다.

```powershell
npx --yes vercel@59.15.1 build --prod --yes --scope gnb1202-navercoms-projects
npx --yes vercel@59.15.1 deploy --prebuilt --prod --scope gnb1202-navercoms-projects
```

GitHub 연동으로 배포하려면 먼저 승인된 변경을 커밋·푸시해야 합니다. 로컬에서만 수정된 상태로 GitHub 저장소를 가져오면 원격의 이전 사이트가 배포됩니다.

rail 전환 변경사항은 `codex/rail-vercel`에서 `main`으로 병합했습니다. 기존 GitHub Pages 주소 대신 Vercel 운영 주소를 사용합니다.

명령 설명: [로그인](https://vercel.com/docs/cli/login), [프로젝트 연결](https://vercel.com/docs/cli/link), [CLI 배포](https://vercel.com/docs/cli/deploying-from-cli).

## 관리 주의

이전 배틀 데모와 개발용 파일은 저장소 밖에 백업한 뒤 제거했습니다. 기존 Git 이력은 보존했습니다.

이 저장소는 더 이상 이전 `web/` 배포 사본이 아닙니다. 과거의 `web/tools/deploy.sh`를 실행하면 rail 버전이 덮어써질 수 있으므로 사용하지 마세요.

GitHub Pages 게시 설정은 비활성화했습니다. 저장소와 Git 이력은 유지되며, 현재 구성은 Vercel 전용입니다.

폰트 라이선스는 `public/assets/fonts/LICENSE.txt`에 포함되어 있습니다.
