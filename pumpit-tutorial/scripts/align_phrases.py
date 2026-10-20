import re, json, sys
txt=open(sys.argv[1],encoding='utf-8').read().replace('\n',' ')
pauses=[tuple(map(float,l.split())) for l in open(sys.argv[2])]
total=86.67
# speech segments
segs=[];t=0.0
for s,e in pauses:
    if s-t>0.05: segs.append((t,s))
    t=e
if total-t>0.05: segs.append((t,total))
# punctuation chunks
chunks=[c.strip() for c in re.split(r'(?<=[,.!?])\s+',txt) if c.strip()]
def w(c): return len(re.sub(r'[^\w]','',c))+ (6 if 'AA' in c else 0)+(4 if 'USB' in c else 0)
W=[w(c) for c in chunks]; tot=sum(W)
speech=sum(e-s for s,e in segs)
# DP: assign chunks to consecutive segment groups; cost = squared error of predicted vs actual duration, each segment group gets >=1 chunk; gaps are boundaries
n,m=len(chunks),len(segs)
import functools
rate=speech/tot
INF=1e18
dp=[[INF]*(m+1) for _ in range(n+1)];bk={}
dp[0][0]=0
for i in range(n+1):
  for j in range(m+1):
    if dp[i][j]>=INF: continue
    for i2 in range(i+1,min(n,i+6)+1):
      for j2 in range(j+1,min(m,j+6)+1):
        pred=sum(W[i:i2])*rate; act=sum(e-s for s,e in segs[j:j2])
        c=dp[i][j]+(pred-act)**2/max(act,0.5)
        if c<dp[i2][j2]: dp[i2][j2]=c; bk[(i2,j2)]=(i,j)
out=[];i,j=n,m
while (i,j)!=(0,0):
  pi,pj=bk[(i,j)]; out.append({"start":round(segs[pj][0],2),"end":round(segs[j-1][1],2),"text":' '.join(chunks[pi:i])}); i,j=pi,pj
out.reverse()
for o in out: print(f"{o['start']:6.2f}-{o['end']:6.2f}  {o['text']}")
json.dump(out,open(sys.argv[3],'w'),ensure_ascii=False,indent=1)
