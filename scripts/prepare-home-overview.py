"""Copy only the delivered 260925 UI artwork; record reproducible provenance."""
from pathlib import Path
from hashlib import sha256
from PIL import Image
import json

site = Path(__file__).resolve().parents[1]
repo = site
source = repo / 'design-reference/assets/delivery-260925' / '@_UI패턴'
output = site / 'public' / 'home-overview'
output.mkdir(exist_ok=True)
files = {
    'home': '1_운동_메인2.png',
    'routine': '1_운동_AI추천운동.png',
    'workout': '1_운동_c_01.png',
    'adjust': '1_운동 - 운동진행3-4B.png',
    'result': '1_운동_f_01b.png',
    'ai': '2_레미AI_03.png',
    'report': '3_리포트2.png',
    'quest': '1_운동_퀘스트_주간퀘스트_조건달성.png',
    'gym': '1_운동_헬스장키우기.png',
    'ranking': '4_랭킹_이번달.png',
    'profile': '5_프로필2.png',
}
manifest = []
for key, filename in files.items():
    original = source / filename
    target = output / f'{key}.webp'
    image = Image.open(original).convert('RGB')
    size = image.size
    image.thumbnail((1000, 2200), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=94, method=6)
    manifest.append({
        'id': key, 'source': original.relative_to(repo).as_posix(),
        'sourceSha256': sha256(original.read_bytes()).hexdigest(),
        'sourceSize': size, 'output': target.relative_to(site).as_posix(),
        'outputSha256': sha256(target.read_bytes()).hexdigest(),
        'outputSize': image.size, 'bytes': target.stat().st_size,
        'transform': 'Proportional resize to max 1000px wide, WebP quality 94; no cropping or replacement',
    })
report = repo / 'v3' / 'reports' / 'home-phone'
report.mkdir(exist_ok=True)
(report / 'assets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(manifest)} delivered screens prepared, {sum(item["bytes"] for item in manifest):,} bytes')
