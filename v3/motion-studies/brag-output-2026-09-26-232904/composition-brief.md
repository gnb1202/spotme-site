# HyperFrames 제작 브리프

기획서: brag-plan.md. 한국어 사용자 요청이 기본 스킬 템플릿보다 우선한다.

- 하나의 5초 paused GSAP timeline, composition id `spotme-brag`.
- composition/은 유한·seek-safe 오프닝만. web/은 같은 오프닝 + 실제 스크롤 인터랙션.
- 브랜드: 검정 #000, 납품 민트 #5eefd3, 기존 홈의 나머지 색상. Strelka Ultra/Pretendard 파일 그대로.
- 레미는 원본 알파 윤곽을 추출한 기존 파생 SVG path 사용. AI 생성 에셋 없음.
- 전환 수단: SVG stroke dash, 깊이별 윤곽 반복, 가속 확대, 결정론적 단기 strain, black opacity dissolve.
- 타이포와 홈은 흡입 중 transform하지 않는다. 타이포 오버레이만 사라지고 실제 홈의 같은 글자가 드러난다.
- 과도한 섬광, 장식 카피, 새 HUD/속도계, 음원, 포스터 첫 프레임 금지.
- 카탈로그 `outline tunnel typography` 검색: outline-draw는 사각 테두리, gallery-tunnel은 이미지 패널/별도 WebGL 무대여서 정확한 납품 윤곽에는 부적합. 기존 SVG 윤곽 메커니즘을 이 시안 안에서 확장한다. 외부 검색 피드백은 전송하지 않는다.
- 스크롤 구간은 영상 밖에 둔다. 기존 상태 머신/접근성 대안 유지, intro duration 고정 상수 대신 timeline.duration 사용.
- 비교 화면의 제목/버튼은 로컬 검토 UI이며 영상에는 포함되지 않는다.
