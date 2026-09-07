# SPOT ME 소개 웹사이트

공모전 양식(포스터)의 내용을 인터랙티브 웹사이트로 옮긴 것. 앞부분은 서비스 랜딩,
뒷부분은 디자인 케이스 스터디다.

빌드 스텝도 프레임워크도 없다. `index.html` 하나로 동작한다.

## 로컬에서 보기

```bash
python -m http.server 8931 -d web
```

그다음 <http://localhost:8931> 을 연다.
(`file://` 로 직접 열어도 대부분 동작하지만, 브라우저에 따라 폰트 CDN 이 막힐 수 있다.)

## 구조

```
web/
  index.html            전체 마크업
  css/tokens.css        디자인 토큰 — 포스터의 Design System 값 그대로
  css/style.css         레이아웃 + 섹션 스타일
  js/main.js            리빌 · 커서 글로우 · 내비 · Core Loop · 스테이지 맵
                        · 티어 스크러버 · 스와치 복사 · 아카이브 · 라이트박스
  js/battle.js          배틀 데모 (핵심 인터랙션)
  assets/               사이트용으로 복사·변환한 에셋
  tools/prepare-assets.sh   에셋 준비 스크립트 (재현용)
```

### 섹션

| # | 섹션 | 내용 |
|---|---|---|
| 1 | Hero | 로고 · 태그라인 · 레미 키비주얼 |
| 2 | Background | 정체기 그래프(스크롤 연동 SVG) · 헬스인 8명 인터뷰 |
| 3 | Concept | `Spot me` 어원 · 운동 × 게이미피케이션 · 레퍼런스 3사 |
| 4 | How it works | sticky 폰 목업으로 4단계 핵심 루프 |
| 5 | Try it | **배틀 데모** — 눌러서 몬스터 공격 |
| 6 | Features | 벤토 그리드 6종 |
| 7 | Ranking | 티어 스크러버 |
| 8 | Character | 레미 애니메이션 갤러리 |
| 9 | Brand Identity | 앱 아이콘 · 로고 3종 |
| 10 | Design System | 컬러 스와치(클릭 복사) · 타입 스케일 · 캐릭터/몬스터 시트 |
| 11 | Screens | 화면 아카이브 + 라이트박스 |

다크(랜딩) → 라이트(케이스 스터디)로 중간에 전환된다. 토큰의 의미 레이어만
`.is-light` 로 뒤집는 구조라 색상 값은 한 곳(`tokens.css`)에만 있다.

## 디자인 토큰

포스터의 Design System 값을 그대로 옮겼다. `Ink` 계열만 다크 섹션용으로 파생한 것.

| 역할 | 값 |
|---|---|
| Main Primary | `#5EEFD3` |
| Main Secondary | `#EF5E7A` |
| Text Primary / Secondary | `#343A40` / `#919EA5` |
| Background Primary / Secondary | `#F2F4F6` / `#FAFAF8` |

폰트는 Pretendard (jsDelivr 동적 서브셋 CDN + 시스템 폰트 폴백).

## 에셋

`assets/` 는 전부 레포의 기존 에셋에서 복사·변환한 것이다. 원본은 건드리지 않는다.

- 앱 화면 ← `_design_ref/screens/`
- 레미 · 몬스터 · 로고 ← `frontend/assets/`
- 레미 애니메이션은 GIF 원본(최대 14MB)을 알파 유지한 채 애니메이션 WebP 로 변환

다시 만들려면 **이 레포(SpotMe) 루트에서**:

```bash
bash web/tools/prepare-assets.sh
```

ffmpeg 이 필요하다. 없으면 GIF 변환만 건너뛴다.
원본 에셋이 이 레포에만 있으므로, 공개 레포 사본에서는 이 스크립트가 동작하지 않는다.

## 배포

공개 주소: <https://gnb1202.github.io/spotme-site/>

사이트만 공개하려고 레포를 분리했다. **소스는 언제나 이 레포의 `web/`** 이고,
공개 레포 [`gnb1202/spotme-site`](https://github.com/gnb1202/spotme-site) 는 배포용 사본이다.
공개 레포를 직접 고치지 말 것 — 다음 배포 때 덮어써진다.

```bash
bash web/tools/deploy.sh "무엇을 바꿨는지"
```

`web/` 을 복사해 커밋·푸시하고, 1~2분 뒤 Pages 에 반영된다.
배포 사본이 다른 경로에 있으면 `SPOTME_SITE_DIR` 로 지정한다.

### 왜 레포를 나눴나

SpotMe 레포는 비공개이고 백엔드·Supabase 설정·전체 커밋 히스토리가 들어 있다.
비공개 레포에서 Pages 를 쓰려면 GitHub Pro 가 필요하고, 레포를 공개로 돌리면
그게 전부 같이 공개된다. 사이트에 필요한 건 `web/` 뿐이라 그것만 따로 공개한다.

## 접근성

- `prefers-reduced-motion: reduce` 를 지키면 모든 애니메이션이 꺼지고 콘텐츠는 즉시 보인다
- 배틀 데모 · 스테이지 맵 노드는 키보드(Enter / Space)로 조작된다
- 라이트박스는 Esc 로 닫히고 포커스를 원래 자리로 되돌린다
