"""Prepare the two delivered Remi illustrations without changing the artwork."""
from pathlib import Path
from hashlib import sha256
from PIL import Image
import json

site = Path(__file__).resolve().parents[1]
repo = site
source = repo / '스팟미_웹사이트_260925_v1/03_오브젝트/@_캐릭터/01_레미'
output = site / 'public/home-story'
output.mkdir(exist_ok=True)
manifest = []
for key, name in [('support', '레미_운동서포트_02.png'), ('reward', '레미_게이미피케이션.png')]:
    original = source / name
    target = output / f'{key}.webp'
    image = Image.open(original).convert('RGBA')
    size = image.size
    image.thumbnail((900, 1080), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=94, method=6)
    manifest.append({
        'id': key, 'source': original.relative_to(repo).as_posix(),
        'sourceSha256': sha256(original.read_bytes()).hexdigest(),
        'sourceSize': size, 'output': target.relative_to(site).as_posix(),
        'outputSha256': sha256(target.read_bytes()).hexdigest(),
        'outputSize': image.size,
        'transform': 'Proportional resize to max 900 x 1080, WebP quality 94; transparency preserved, no crop or substitution',
    })
(repo / 'v3/reports/home-phone/story-assets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print('Prepared 2 delivered illustrations with source/output hashes.')
