# Figma 재현본

파일: https://www.figma.com/design/j0mzoDGkhAoaqR6tJ3Dyik
페이지: `Website — Desktop` / 루트 프레임 `SPOT ME — 소개 웹사이트 (1440)`

웹사이트(https://gnb1202.github.io/spotme-site/)를 Figma 로 옮긴 것.
**12개 섹션 전부 완료.** 1440 × 15750 으로 라이브 사이트 실측 높이와 일치한다.

## 구성

| 노드 | 섹션 | 높이 |
|---|---|---|
| 4:3  | 01 Hero           | 1013 |
| 4:4  | 02 Background     | 1241 |
| 4:5  | 03 Concept        | 1429 |
| 4:6  | 04 How it works   | 1648 |
| 4:7  | 05 Battle         | 1124 |
| 4:8  | 06 Features       | 2074 |
| 4:9  | 07 Ranking        | 1252 |
| 4:10 | 08 Character      |  804 |
| 4:11 | 09 Divider        |  324 |
| 4:12 | 10 Design System  | 2917 |
| 4:13 | 11 Screen Archive | 1650 |
| 4:14 | 12 Footer         |  274 |

## 토큰

- **컬러 변수** `SPOT ME` 컬렉션 14개.
  Main / Text / Background 8개는 포스터 원본값 그대로,
  Ink 4단계 + On Dark 2개는 다크 섹션용으로 파생한 것.
  디자인 시스템 섹션의 스와치 칩은 값이 아니라 **변수에 바인딩**돼 있어,
  변수를 바꾸면 스와치도 같이 바뀐다.
- **텍스트 스타일** 10개 — `Headline/H1·H2`, `Title/T1·T2`,
  `Body/B1·B2·B2 Semi`, `Caption/C1`, `Label/Eyebrow·Stat`.
  타입 스케일 표도 이 스타일들로 렌더돼 있어 스타일을 고치면 표가 따라 바뀐다.
- **이미지** 44장 업로드 완료 (해시는 `figma-image-hashes.json`)

## 알려진 차이

1. **폰트 — Gothic A1 (Pretendard 아님)**
   Figma 환경에 Pretendard 가 없다(폰트 1938종 확인). 한글 후보 중
   시안이 쓰는 웨이트 램프(Regular/Medium/SemiBold/Bold/**ExtraBold**)를
   전부 갖춘 건 Gothic A1 뿐이라 이걸로 대체했다.
   **텍스트 스타일 10개만 바꾸면 전체가 Pretendard 로 따라온다.**
   Gothic A1 이 자폭이 더 넓어 히어로 태그라인 알약은 고정폭 → 하깅으로 바꿨다.

2. **인터랙션은 정적**
   배틀 데모·스크롤 연동 그래프 드로잉·커서 글로우·호버는 Figma 로 안 넘어간다.
   전부 기본 상태 한 컷으로 표현했다. 배틀에 `피격 / 처치 / 보상` 상태를
   더 넣고 싶으면 몬스터 스프라이트 4상태(idle/damage/lowhp/fainted)가
   이미 업로드돼 있으니 프레임만 복제해서 스프라이트를 갈아끼우면 된다.

3. **배경 그리드 텍스처 생략** — 노드 수가 과해져 뺐다.

## 좌표를 얻은 방법

눈대중이 아니라 라이브 사이트에서 실측해 옮겼다. 수정·추가할 때도 같은 방식이 안전하다.

1. 사이트를 **1440×900 뷰포트**로 연다 (이게 중요 — 다른 폭에서 재면 전부 어긋난다)
2. `getBoundingClientRect()` + `scrollY` 로 문서 절대좌표를 구한다
3. 섹션 상단 offset 을 빼고, **x 에 +8** 한다
   (측정은 스크롤바 때문에 1425px 폭에서 이뤄지고 프레임은 1440px)

섹션 상단 offset: Hero 0 / Background 1013 / Concept 2254 / Loop 3683 /
Battle 5331 / Features 6456 / Ranking 8530 / Character 9782 / Divider 10586 /
Design System 10909 / Archive 13826 / Footer 15476

## 작업하며 겪은 함정

- **쓰려는 폰트 웨이트를 전부 `loadFontAsync` 해야 한다.** 텍스트 스타일이
  내부적으로 쓰는 웨이트까지 포함 — `Body/B2 Semi`(SemiBold)와 연산자
  글리프(Light)를 빼먹어 두 번 실패했고, 그게 무료 플랜 한도 20회 중 2회를 먹었다.
  이후로는 9개 웨이트를 전부 선로드하는 방식으로 바꿔 한 번도 실패하지 않았다.
- `use_figma` 는 **원자적**이라 실패한 스크립트는 아무것도 만들지 않는다. 고쳐서 다시 돌리면 된다.
- 이모지(🐭)는 Gothic A1 에 글리프가 없어도 Figma 폴백으로 정상 렌더된다.
- **MCP 호출 한도는 시트 종류가 결정한다.** Starter+View = 월 20회,
  Professional/Education+Full = 하루 200회. 교육 플랜(무료)로 풀었다.
- `whoami` / `create_new_file` 은 한도 면제라 상태 확인은 공짜로 할 수 있다.
