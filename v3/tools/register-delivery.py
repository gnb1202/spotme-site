"""Measure export-canvas differences, without changing the source PNGs."""
import json
from pathlib import Path
import cv2
import numpy as np

m=json.loads(Path('designs/assets.json').read_text(encoding='utf8'))
def gray(path):
    im=cv2.imdecode(np.frombuffer(Path(path).read_bytes(),np.uint8),cv2.IMREAD_UNCHANGED)
    if im.shape[2]==4:
        a=im[:,:,3:4]/255
        im=(im[:,:,:3]*a+85*(1-a)).astype(np.uint8)
    return cv2.resize(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY),(512,512)).astype(np.float32)/255
for d in m['delivery']:
    if not d['match'].startswith('inspected'): continue
    f=next(f for f in m['fills'] if f['imageRef']==d['imageRef'])
    if f.get('kind')=='local-delivery': continue
    warp=np.eye(2,3,dtype=np.float32)
    try:
        score,warp=cv2.findTransformECC(gray('public/'+f['path']),gray('public/'+d['path']),warp,cv2.MOTION_AFFINE,(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,200,1e-7))
        inverse=cv2.invertAffineTransform(warp);inverse[:,2]/=512
        print(json.dumps({'ref':d['imageRef'],'file':d['path'].split('/')[-1],'correlation':score,'normalizedTransform':inverse.tolist()},ensure_ascii=False))
    except cv2.error as e: print(d['path'],str(e).splitlines()[-1])
