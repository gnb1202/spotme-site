from pathlib import Path
import cv2, numpy as np, json, hashlib, math
root=Path(__file__).resolve().parents[1]
source=root/'스팟미_웹사이트_260925_v1/03_오브젝트/@_캐릭터/01_레미/레미_홈A_01B.png'
raw=source.read_bytes()
im=cv2.imdecode(np.frombuffer(raw,np.uint8),cv2.IMREAD_UNCHANGED)
# Trace the delivered silhouette, including its transparent inner openings.
# No raster repainting: output is unfilled SVG geometry for the existing stroke animation.
contours,hierarchy=cv2.findContours((im[:,:,3]>127).astype(np.uint8)*255,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
contours=sorted(contours,key=cv2.contourArea,reverse=True)
scale=1080/im.shape[0]
def path_for(contour):
    points=cv2.approxPolyDP(contour,2.0,True).reshape(-1,2).astype(float)*scale
    n=len(points)
    tangents=[]
    for i,p in enumerate(points):
        prev=points[(i-1)%n]; nex=points[(i+1)%n]
        a=p-prev; b=nex-p
        cosine=np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b))
        tangents.append((nex-prev)/6 if cosine>.5 else np.zeros(2))
    fmt=lambda p:f'{p[0]:.3f},{p[1]:.3f}'
    d='M'+fmt(points[0])
    for i,p in enumerate(points):
        j=(i+1)%n
        d+='C'+fmt(p+tangents[i])+' '+fmt(points[j]-tangents[j])+' '+fmt(points[j])
    return d+'Z'
paths=[path_for(c) for c in contours if cv2.contourArea(c)>100]
data={'width':im.shape[1]*scale,'height':1080,'paths':paths}
out=root/'src/integration/remi-home-a-01b-outline.json'
out.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s 1080">'%data['width']+''.join('<path d="'+p+'" fill="none" stroke="#5eefd3" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>' for p in paths)+'</svg>'
asset=root/'public/motion-assets/remi-home-a-01b-outline.svg'
asset.write_text(svg,encoding='utf-8')
record={'source':str(source),'sourceSHA256':hashlib.sha256(raw).hexdigest(),'dimensions':[im.shape[1],im.shape[0]],'method':'Alpha contour at 127; closed contour approximation within 2 source pixels; local cubic interpolation, sharp turns retained; no fill. Existing animation colors and stroke widths preserved.','paths':len(paths),'output':str(asset),'outputSHA256':hashlib.sha256(asset.read_bytes()).hexdigest(),'geometrySHA256':hashlib.sha256(out.read_bytes()).hexdigest()}
(root/'reports/remi-outline/provenance.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
