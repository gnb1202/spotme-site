import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
raw=json.loads(Path('designs/figma-data.json').read_text(encoding='utf-8'))
characters=set()
def walk(n):
    characters.update(n.get('characters',''))
    for child in n.get('children',[]):walk(child)
for entry in raw['nodes'].values():walk(entry['document'])
result={}
for path in Path('public/assets/fonts').iterdir():
    if path.suffix not in ('.otf','.ttf','.woff2'):continue
    font=TTFont(path);family='Strelka' if 'Strelka' in path.name else 'Pretendard'
    weight=800 if family=='Strelka' else font['OS/2'].usWeightClass
    upm=font['head'].unitsPerEm;cmap=font.getBestCmap();glyphs=font.getGlyphSet();metrics={}
    for char in characters:
        name=cmap.get(ord(char))
        if not name:continue
        pen=BoundsPen(glyphs);glyphs[name].draw(pen)
        if pen.bounds:metrics[char]=[v/upm for v in pen.bounds]
    result[f'{family}:{weight}']=metrics
Path('public/font-metrics.js').write_text('window.FONT_METRICS='+json.dumps(result,ensure_ascii=False)+';',encoding='utf-8')
