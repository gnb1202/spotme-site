# SPOT ME v3 — 2026-09-25 initial local preview

작업 경로는 `D:/Github/spotme-site/v3`입니다. 새 Figma 파일 `9gPp2ja89DZnz9q9Xr74wT`의 레이아웃과 같은 저장소의 `../스팟미_웹사이트_260925_v1/` 에셋 원본을 사용합니다. 기존 사이트 코드·이미지·RAIL·스크롤 효과·배포 설정을 가져오지 않았습니다. 배포하거나 원격에 올리지 않았습니다.

사용자 제공 PNG 57개 중 Figma imageRef/파일 또는 픽셀 해시로 일치가 확인된 37개를 매핑했습니다. 빌드할 때 해당 로컬 파일에서 `public/assets/delivery-260925/`로 복사합니다. 기기 프레임·합성 이미지 등 정확히 일치하는 로컬 파일을 찾지 못한 항목은 같은 버전의 Figma 에셋으로 유지하며 `designs/assets.json`의 `fallbacks`에 기록합니다. 추측으로 비슷한 그림을 대입하지 않습니다.

## 실행

```powershell
npm ci
npm run dev
```

미리보기: http://127.0.0.1:4184/

상단의 홈 / AI 운동 서포트 / 게임처럼 즐기는 운동 / 파트너 레미 / 홍보 영상 탭을 연결했습니다. 몬스터 화살표와 ‘운동으로 공격’은 시안에 있는 다른 상태로 즉시 이동합니다. 추가 애니메이션·자동 재생·새 문구·새 버튼은 없습니다. 시안에 포함된 정적인 그림자·블러·외곽선은 유지합니다.

기본 경로: `/`, `/ai/`, `/game/`, `/characters/`, `/video/`.
시안 변형: `/home-02/`, `/game-02/`, `/game-03/`, `/characters-b/`, `/characters-c/`, `/characters-d/`, `/characters-e/`.
홈 두 번째 시안에는 전환 버튼을 새로 만들지 않았으므로 직접 주소로 확인합니다.

## 보존 규칙과 구조

- `AGENTS.md`: 시안 밖 요소 추가 금지, 최신 에셋 출처, 로컬 전용 계약.
- `designs/figma-data.json`: 한 번 취득 후 동결한 원본 데이터. SHA-256은 `designs/source.json`에 기록.
- `designs/assets.json`: 로컬 에셋 원본 경로·해시·Figma 매핑과 필요한 Figma 보완 에셋 목록.
- `public/`: 실제 사이트에 필요한 정적 파일만 제공. 디자인 참조 PNG와 QA 자료는 제공하지 않음.
- `tools/build.mjs`: 소스 좌표·색상·타이포·실제 에셋으로 HTML 생성. 텍스트는 HTML이며 페이지 전체 이미지를 배경으로 사용하지 않음.
- `tools/check.mjs`: 원문/노드 출처/파일 해시/상단 탭/키보드 이동/추가 애니메이션 금지 검사.
- `reports/`: 전체 화면 캡처, 비교 진단, 원본 Mimikyu 검사 결과.

화면 폭에 따라 1920px 시안 전체를 비례 축소하는 초기 버전입니다. 모바일 전용 재배열이나 신규 메뉴는 시안에 없어 추가하지 않았습니다. 좁은 화면에서의 독립적인 가독성 설계는 아직 하지 않았습니다.

폰트는 현재 Figma가 지정한 Strelka Ultra 및 Pretendard입니다. 사용자 제공 Strelka 파일과 로컬의 동일 서체 파일을 사용했으며, 글꼴 해시는 `designs/fonts.json`에 있습니다. 사이트 구현과 이미지 자산은 신규입니다.

## 재생성·확인

```powershell
npm run build
npm run check
npm run capture
node tools/thumbnail-diagnostic.mjs
node tools/native-verify.mjs
```

빌드에는 Python/fontTools가 필요합니다. QA에는 Playwright Chromium, Pillow 및 로컬 Mimikyu 도구가 필요합니다. 이미 확보한 에셋과 원본 데이터로 동작하므로 다시 Figma를 호출할 필요가 없습니다. 네트워크 취득 스크립트는 이력용이며 다시 실행하지 않습니다. `sync-delivery.mjs`는 네트워크 없이 저장소의 에셋 폴더만 사용합니다.

## 검증 상태

초기 로컬 검토용이며 **Mimikyu 완료 판정은 아직 아닙니다**. 상세 내용은 `reports/STATUS.md`를 참조하세요. Figma MCP와 고해상도 노드 내보내기 할당량 제한 때문에 원본 해상도 전체 PNG를 확보하지 못했습니다. 썸네일 진단 수치를 원본 해상도 정확도로 주장하지 않습니다.
