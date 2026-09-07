#!/usr/bin/env bash
# SPOT ME 소개 사이트 — GitHub Pages 배포
#
# 소스는 언제나 이 레포의 web/ 이다. 공개 레포(spotme-site)는 배포용 사본일 뿐이라
# 직접 고치지 말고, web/ 을 고친 뒤 이 스크립트를 돌린다.
#
# SpotMe 레포는 비공개로 두고 사이트만 공개하기 위해 레포를 분리했다.
# (비공개 레포에서 Pages 를 쓰려면 GitHub Pro 가 필요하고, 레포를 공개로 돌리면
#  백엔드·Supabase 설정·전체 커밋 히스토리까지 같이 공개된다)
#
# 사용법:  bash web/tools/deploy.sh ["커밋 메시지"]

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # .../SpotMe/web
DST="${SPOTME_SITE_DIR:-$(cd "$SRC/../.." && pwd)/spotme-site}"
MSG="${1:-Update site}"

if [ ! -d "$DST/.git" ]; then
  echo "배포 대상이 git 레포가 아니다: $DST" >&2
  echo "SPOTME_SITE_DIR 로 경로를 지정하거나, 먼저 레포를 클론해라:" >&2
  echo "  gh repo clone gnb1202/spotme-site \"$DST\"" >&2
  exit 1
fi

echo "==> $SRC  ->  $DST"

# 배포 사본에서 사이트 파일만 갈아끼운다. .git 은 건드리지 않는다.
rm -rf "$DST/css" "$DST/js" "$DST/assets" "$DST/tools"
cp -r "$SRC/css" "$SRC/js" "$SRC/assets" "$SRC/tools" "$DST/"
cp "$SRC/index.html" "$DST/index.html"
cp "$SRC/README.md"  "$DST/README.md"

cd "$DST"
if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "바뀐 게 없다. 배포 생략."
  exit 0
fi

git add -A
git commit -m "$MSG"
git push

echo
echo "배포 완료 — 반영까지 1~2분 걸린다:"
echo "  https://gnb1202.github.io/spotme-site/"
