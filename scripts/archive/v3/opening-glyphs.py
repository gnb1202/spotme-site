"""Extract real Strelka outlines for stroke-dash animation, not a wipe mask."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
font=TTFont('public/assets/fonts/Strelka Ultra.otf')
glyphs=font.getGlyphSet();cmap=font.getBestCmap();result={}
for char in set('SPOT ME MY\nWORKOUT')-{'\n'}:
    name=cmap[ord(char)];pen=SVGPathPen(glyphs);glyphs[name].draw(pen)
    bounds=BoundsPen(glyphs);glyphs[name].draw(bounds)
    result[char]={'d':pen.getCommands(),'advance':font['hmtx'][name][0],'bounds':bounds.bounds}
Path('public/opening-glyphs.js').write_text('window.SPOTME_GLYPHS='+json.dumps({'upm':font['head'].unitsPerEm,'glyphs':result})+';',encoding='utf8')
