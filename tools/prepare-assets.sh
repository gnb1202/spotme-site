#!/usr/bin/env bash
# SPOT ME 소개 사이트 — 에셋 준비 스크립트
#
# 레포에 이미 있는 원본 에셋(frontend/assets, _design_ref)에서 사이트에 쓸
# 것만 web/assets/ 로 복사하고, 용량이 큰 레미 GIF는 알파를 유지한 채
# 애니메이션 WebP 로 변환한다. 원본은 건드리지 않는다.
#
# 사용법:  bash web/tools/prepare-assets.sh   (레포 루트에서 실행)
# 요구사항: ffmpeg (GIF -> animated WebP 변환용)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

SRC_FE="frontend/assets"
SRC_REF="_design_ref/screens"
OUT="web/assets"

# RIFF 헤더의 선언 길이(오프셋 4, 리틀엔디안 4바이트) + 8 == 실제 파일 크기인지 본다.
# 변환이 중간에 끊기면 이 값이 어긋난다.
riff_size_ok() {
  [ -f "$1" ] || return 1
  python -c "
import struct, sys, os
p = sys.argv[1]
with open(p,'rb') as f:
    head = f.read(12)
if len(head) < 12 or head[:4] != b'RIFF' or head[8:12] != b'WEBP':
    sys.exit(1)
sys.exit(0 if struct.unpack('<I', head[4:8])[0] + 8 == os.path.getsize(p) else 1)
" "$1" 2>/dev/null
}

mkdir -p "$OUT/brand" "$OUT/remi" "$OUT/monsters" "$OUT/screens"

echo "==> 브랜드"
cp "$SRC_FE/brand/logo/logo-a-01.png"  "$OUT/brand/logo-wordmark.png"   # 민트 배지형 (내비/푸터)
cp "$SRC_FE/brand/logo/logo-a-02.png"  "$OUT/brand/logo-hero.png"       # 말풍선 꼬리형 (히어로, 포스터와 동일)
cp "$SRC_FE/brand/logo-default.png"    "$OUT/brand/logo-mark.png"
cp "$SRC_FE/app-icon/icon.png"         "$OUT/brand/app-icon.png"
cp "$SRC_FE/app-icon/favicon.png"      "$OUT/brand/favicon.png"

echo "==> 레미 (정지 이미지)"
for n in key-visual lobby fighting report stage voice-active \
         workout-ready workout-rest workout-standing \
         onboarding-01 onboarding-02 app-intro-grayscale; do
  cp "$SRC_FE/characters/remi-$n.png" "$OUT/remi/remi-$n.png"
done

echo "==> 몬스터 5종 x 4상태"
copy_monster() { # $1=번호-이름  $2=출력이름
  for st in "" "-damage" "-lowhp" "-fainted"; do
    src="$SRC_FE/characters/monster-$1$st.png"
    dst="$OUT/monsters/$2${st:--idle}.png"
    [ -z "$st" ] && dst="$OUT/monsters/$2-idle.png"
    cp "$src" "$dst"
  done
}
copy_monster "01-motivation" "motivation"
copy_monster "02-record"     "record"
copy_monster "03-routine"    "routine"
copy_monster "04-fatigue"    "fatigue"
copy_monster "05-goal-loss"  "goal-loss"

echo "==> 앱 화면"
copy_screen() { cp "$SRC_REF/$1" "$OUT/screens/$2"; }
copy_screen "초기설정/01_스플래시화면.png"            "splash.png"
copy_screen "초기설정/07_앱소개1.png"                  "intro.png"
copy_screen "홈-운동/07_운동_메인1.png"                "home.png"
copy_screen "홈-운동/18_운동_자유운동1.png"            "routine.png"
copy_screen "홈-운동/17_운동_AI추천운동.png"           "routine-ai.png"
copy_screen "홈-운동/23_운동_운동진행1.png"            "battle-01.png"
copy_screen "홈-운동/30_운동_운동진행3_1.png"          "battle-02.png"
copy_screen "홈-운동/45_운동_운동결과1A_1.png"         "reward.png"
copy_screen "홈-운동/06_운동_gym.png"                  "tycoon.png"
copy_screen "홈-운동/01_운동_퀘스트_주간퀘스트.png"     "quest.png"
copy_screen "홈-운동/28_운동_도움모드1.png"            "help-mode.png"
copy_screen "홈-운동/27_운동_음성활성화.png"           "voice.png"
copy_screen "레미AI/01_레미AI_채팅_01A.png"            "remi-ai.png"
copy_screen "랭킹/01_랭킹_이번달.png"                  "ranking.png"
copy_screen "리포트/01_리포트1.png"                    "report.png"
copy_screen "리포트/03_리포트_상세근육부하.png"         "report-muscle.png"
copy_screen "프로필/01_프로필1.png"                    "profile.png"

echo "==> 레미 GIF -> 애니메이션 WebP (알파 유지)"
if command -v ffmpeg >/dev/null 2>&1; then
  # 갤러리 표시 크기가 ~128px 이라 긴 변 320px 로 줄이고, 50fps 원본은 25fps 로 낮춘다.
  # (원본 720x720 x 151프레임을 그대로 넣으면 한 컷에 2.5MB 를 넘는다)
  # 사이트가 실제로 쓰는 6종만 변환한다.
  for n in greet dumbbell punch professor listening rest; do
    src="$SRC_FE/common/remi/remi-$n.gif"
    [ -f "$src" ] || { echo "   (건너뜀: $src 없음)"; continue; }
    ffmpeg -y -loglevel error -i "$src" \
      -vf "scale='if(gt(iw,ih),320,-2)':'if(gt(iw,ih),-2,320)':flags=lanczos,fps=25" \
      -vcodec libwebp -lossless 0 -q:v 50 -compression_level 6 \
      -loop 0 -an -fps_mode passthrough "$OUT/remi/remi-$n.webp"
    # 잘린 파일이 남지 않도록 확인한다.
    # ffprobe 는 애니메이션 WebP 를 "image data not found" 로 보면서도 exit 0 을
    # 내므로 쓸 수 없다. RIFF 헤더가 선언한 길이와 실제 크기를 비교한다.
    if ! riff_size_ok "$OUT/remi/remi-$n.webp"; then
      echo "   !! remi-$n.webp 변환 실패(잘림) — 삭제"; rm -f "$OUT/remi/remi-$n.webp"; continue
    fi
    echo "   remi-$n.webp  $(du -k "$OUT/remi/remi-$n.webp" | cut -f1)KB  (원본 $(du -k "$src" | cut -f1)KB)"
  done
else
  echo "   ffmpeg 없음 — GIF 변환 건너뜀"
fi

echo
echo "완료. 총 용량:"
du -sh "$OUT"
