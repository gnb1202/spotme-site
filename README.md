# SPOT ME — Rail

승인된 rail 버전의 정적 웹사이트입니다. 별도의 설치·빌드·환경 변수·백엔드는 필요하지 않습니다.

## 구성

- `public/`: 실제 배포되는 HTML, CSS, JavaScript, 이미지 51개와 로컬 폰트
- `vercel.json`: Vercel 정적 배포 설정 (`public` 디렉터리만 제공)
- `.vercelignore`: 배포 파일 허용 목록

기본 내비게이션은 rail이며, 화면 폭 1440px 이상에서 표시됩니다. 좁은 화면에서도 같은 콘텐츠를 연속 스크롤로 읽을 수 있습니다.

## 로컬 확인

`public/`을 루트로 정적 HTTP 서버를 실행합니다. 프로젝트 루트 전체를 웹 루트로 사용하지 않습니다.

## Vercel 배포

이 저장소를 연결한 뒤 프로젝트 루트는 저장소 루트, Framework Preset은 **Other**, Output Directory는 **public**으로 설정합니다. 설치와 빌드는 실행하지 않습니다. 관련 설정은 `vercel.json`에 포함되어 있습니다.

계정·프로젝트 연결 및 실제 배포는 별도로 진행합니다. 비밀 키나 환경 변수를 추가할 필요가 없습니다.

### 현재 준비 상태

로컬 폴더는 `gnb1202-navercoms-projects/spotme-site` 프로젝트에 연결되어 있습니다. 배포는 CLI로 수행하며, GitHub 자동 배포 연동은 해제되어 있습니다. 미리보기와 프로덕션 배포는 별도로 진행합니다.

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
npx --yes vercel@59.15.1 deploy
```

프로덕션 배포는 미리보기 확인 후 별도로 진행합니다. CLI 인증 정보와 `.vercel/` 연결 정보는 저장소에 커밋하지 않습니다.

GitHub 연동으로 배포하려면 먼저 승인된 변경을 커밋·푸시해야 합니다. 로컬에서만 수정된 상태로 GitHub 저장소를 가져오면 원격의 이전 사이트가 배포됩니다.

rail 전환 작업은 `codex/rail-vercel` 브랜치에서 관리합니다. 기존 `main`은 GitHub Pages의 루트 게시에 사용되고 있으므로, Pages의 게시 방식이나 종료 방침을 정하기 전에는 이 브랜치를 그대로 병합하지 않습니다.

명령 설명: [로그인](https://vercel.com/docs/cli/login), [프로젝트 연결](https://vercel.com/docs/cli/link), [CLI 배포](https://vercel.com/docs/cli/deploying-from-cli).

## 관리 주의

이전 배틀 데모와 개발용 파일은 저장소 밖에 백업한 뒤 제거했습니다. 기존 Git 이력은 보존했습니다.

이 저장소는 더 이상 이전 `web/` 배포 사본이 아닙니다. 과거의 `web/tools/deploy.sh`를 실행하면 rail 버전이 덮어써질 수 있으므로 사용하지 마세요.

이 구성은 Vercel용입니다. 기존 GitHub Pages 루트 배포 방식과는 디렉터리 구조가 다르며, Pages를 다시 사용하려면 별도의 게시 설정이 필요합니다.

폰트 라이선스는 `public/assets/fonts/LICENSE.txt`에 포함되어 있습니다.
