import sys,glob,os,json
import numpy as np
from PIL import Image, ImageFilter
rows=[]
for f in sorted(glob.glob(sys.argv[1]+'/**/*.png',recursive=True)):
    im=Image.open(f); mode=im.mode; w,h=im.size
    a=np.array(im.convert('RGBA')); alpha=a[...,3]
    transp=float((alpha<250).mean())
    g=np.array(im.convert('L'),dtype=float)
    lap=np.abs(g[1:-1,1:-1]*4-g[:-2,1:-1]-g[2:,1:-1]-g[1:-1,:-2]-g[1:-1,2:])
    mask=alpha[1:-1,1:-1]>250
    sharp=float(lap[mask].var()) if mask.any() else 0
    # partial alpha edge fraction
    edge=float(((alpha>5)&(alpha<250)).mean())
    rows.append(dict(f=os.path.relpath(f,sys.argv[1]),w=w,h=h,mode=mode,transp=round(transp,3),edge=round(edge,4),sharp=round(sharp,1),scale_to_1080=round(1080/h,2)))
for r in rows: print(r)
json.dump(rows,open(sys.argv[2],'w'),indent=1)
