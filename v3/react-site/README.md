# SPOT ME React 전환 시안

브랜치: `codex/react-migration`. 2026-09-27 기본 구현으로 전환했다. Vercel 빌드 대상은 이 프로젝트이며, 실제 배포·푸시·병합은 아직 하지 않았다. 이전 정적 사이트와 원본 에셋은 보존한다.

## 실행

```powershell
cd D:\Github\spotme-site\v3\react-site
npm ci
npm run dev
```

- 사이트: http://127.0.0.1:4187/
- 비교 진입점: http://127.0.0.1:4187/lab/
- 오프닝·충전 A: http://127.0.0.1:4187/?experience=scroll&variant=a
- 충전부터: http://127.0.0.1:4187/?experience=scroll&intro=skip
- `npm run build`: 현재 React 입력만으로 `dist/` 생성. `npm run preview`: 4188에서 빌드본 확인.

## 기본 사이트 전환 기록

기존 HTML·Playwright·Figma 자료 없이도 일반 빌드가 가능하도록 자동 동기화를 제거했다. `public/` 및 `src/generated/`는 독립 빌드 입력으로 Git 제외 목록에서 해제했다. 과거 HTML 재이관은 명시적으로 `npm run sync -- --from-legacy`를 실행할 때만 가능하며 React 보정을 덮어쓸 수 있다. 아래 이관 당시 설명 중 생성물 제외 및 기존 Vercel 출력 경로 관련 내용은 이 변경으로 대체된다.

## 구조와 범위

- React 19.3.0, React DOM 19.3.0, Vite 8.3.1, GSAP 3.15.0. 상단 메뉴는 SmoothUI Animated Tabs를 Motion 기반 링크 내비게이션으로 조정해 적용했다.
- 기존 12개 경로를 React 페이지로 전환했다. `DesignNode`는 원본의 노드·속성·텍스트 데이터를 실제 React 요소로 렌더링한다. iframe, HTML 문자열 주입으로 페이지를 대체하지 않는다.
- 첫 단계는 디자인 보존형 전환이다. 절대 배치 및 데스크톱 비율 축소는 원본 그대로이며, 이를 새 반응형 레이아웃으로 재설계한 것은 아니다. 후속 단계에서 헤더·탭 등 의미 단위 컴포넌트로 추출할 수 있다.
- 페이지 데이터와 모션 코드는 지연 로딩한다. `src/generated/`는 동기화 산출물이며 직접 수정하지 않는다. `tools/sync.mjs`가 기존 정적 출력과 승인된 모션 시안을 읽어 생성한다.
- 원본 폰트 베이스라인 보정을 React 훅으로 옮겼다. 기존 상단 메뉴와 상태별 링크, 뒤로 가기, `data-keep-scroll`을 유지한다.
- 기본 `/`는 정적 시안과 비교하기 위해 오프닝을 자동 실행하지 않는다. 최신 오프닝·삼각형 안내·충전·기립은 `?experience=scroll`에서 테스트한다. 이전 `?opening=type` 실험 주소를 새 모션 주소로 자동 변경하지 않는다.
- `MotionExperience`는 효과 초기화/정리를 소유한다. AbortController로 이벤트를 정리하고, GSAP context 및 동적 요소를 해제한다. StrictMode 및 반복 진입을 검증한다. 원본 모션 스크립트를 다시 생성할 경우 변환 규칙과 테스트도 함께 확인해야 한다.
- 모션 경로 내 메뉴는 기존 로컬 시안처럼 비활성 상태이며 우측 하단 Tweak 링크로 `/lab/`에 복귀한다. 실제 React 사이트의 메뉴는 정상 라우팅한다.

## 검증

2026-09-27 Figma 보정: React 정적 페이지의 외곽선 제목, 혼합 폰트 기준선, 자간 정렬, 푸터 로고 크기를 저장된 Figma 계약에 맞춰 조정했다. `npm run verify`는 이제 해당 계약 감사와 보정 회귀 테스트를 실행한다. 이전 HTML 복사 기준은 `npm run verify:migration`으로 남겼다. 자세한 수치와 미충족 게이트는 [Mimikyu 보정 보고서](reports/mimikyu/REPORT.md)에 있다. 원본 해상도 Figma PNG 내보내기가 제한되어 전체 픽셀 99% 인증은 아직 아니다.

비교 기준 서버: `v3`에서 `$env:PORT='4190'; node tools/server.mjs`.
React 개발 서버(4187) 및 빌드 미리보기(4188)가 실행된 상태에서 `npm run verify`.

- 12개 경로의 원문·좌표·크기·폰트 크기·에셋 경로·내비게이션을 정적 기준과 비교한다.
- 첫 화면 1920×1080 스크린샷 차이를 측정한다. 전체 페이지에 대한 Figma 재검증은 이번 범위가 아니다.
- React 메뉴 이동·뒤로 가기·모션 충전·다음 섹션·반복 진입/정리·직접 경로 접근·모바일 가로 넘침을 검사한다.
- 결과: `reports/verification.json`. 생성된 에셋과 화면 데이터는 `public/`, `src/generated/`에 있으며 Git 제외 대상이다. 재생성에는 형제 경로의 기존 사이트와 모션 시안이 필요하다.

## 보존 및 배포

### 2026-09-27 SmoothUI 메뉴 적용 기록

- 원본 메뉴의 위치·크기·서체·문구·링크는 유지하고, 선택 밑줄 이동·호버 강조·눌림 반응을 추가했다. Tailwind 전역 스타일은 추가하지 않았다.
- 키보드 방향키는 포커스만 이동하며 Enter로 페이지를 연다. 모션 감소 설정에서는 이동 효과를 제거한다. 기존 오프닝·충전 비교 경로에는 적용하지 않았다.
- 적용본은 `/`, 원본 메뉴 비교는 `/?ui=original`이다. 비교 옵션은 해당 URL에만 적용된다.
- `npm run build` 및 `node tools/verify-navigation.mjs` 통과. 메뉴 좌표·스타일 보존, 페이지 이동·뒤로 가기·키보드·모션 감소·모바일 가로 넘침을 확인했다. 결과는 `reports/navigation-verification.json`이다. 빌드에는 Motion의 클라이언트 지시문 관련 경고가 있으나 빌드는 성공했다.
- 출처와 MIT 라이선스는 `THIRD_PARTY_NOTICES.md`에 기록했다. 로컬 브랜치만 수정했으며 푸시·배포하지 않았다.

현재 원본 사이트와 최신 모션 작업 상당 부분은 원래부터 Git 미추적 상태였다. 브랜치 생성만으로 이 파일들이 커밋되거나 백업되는 것은 아니다. 이번 작업은 기존 변경을 유지했고 일괄 커밋·푸시·배포하지 않았다.
배포 전에는 원본 입력 파일의 추적 범위를 정리하고 React 출력 디렉터리 및 SPA 경로 fallback 설정을 별도로 검토해야 한다. 현재 Vercel은 여전히 기존 `v3/public`을 가리킨다.
