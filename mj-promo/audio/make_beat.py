"""Original royalty-free 15s funk/pop beat at 120 BPM (beat = 0.5s)."""
import numpy as np, wave, sys
SR=44100; BPM=120; BEAT=60/BPM; DUR=15.0
N=int(SR*DUR); out=np.zeros((N,2))
rng=np.random.default_rng(7)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig))
    if i>=N: return
    s=sig[:j-i]*g
    out[i:j,0]+=s*(1-pan)/1; out[i:j,1]+=s*(1+pan)/1
def env(n,a=0.002,d=0.2):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
def kick():
    n=int(.35*SR);t=np.arange(n)/SR
    f=45+110*np.exp(-t*35); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*env(n,.001,.18)*1.1
def snare():
    n=int(.25*SR);t=np.arange(n)/SR
    return (rng.standard_normal(n)*env(n,.001,.07)*.6+np.sin(2*np.pi*190*t)*env(n,.001,.05)*.5)
def clap():
    n=int(.2*SR); e=np.zeros(n)
    for o in (0,.01,.02): k=int(o*SR); e[k:]+=env(n-k,.0005,.03)
    x=rng.standard_normal(n); x=np.diff(x,prepend=0)
    return x*e*.35
def hat(open_=False):
    n=int((.18 if open_ else .05)*SR); x=np.diff(rng.standard_normal(n),prepend=0)
    return x*env(n,.0005,.06 if open_ else .012)*.25
def bass(freq,len_):
    n=int(len_*SR);t=np.arange(n)/SR
    saw=2*((t*freq)%1)-1; sq=np.sign(np.sin(2*np.pi*freq*t))
    x=.6*saw+.4*sq
    # simple lowpass
    a=.08; y=np.zeros(n); acc=0
    for i in range(n): acc+=a*(x[i]-acc); y[i]=acc
    return y*env(n,.003,.25)*.9
def stab(freqs,len_=.18):
    n=int(len_*SR);t=np.arange(n)/SR
    x=sum(np.sign(np.sin(2*np.pi*f*t))*.5+np.sin(2*np.pi*f*2.005*t)*.3 for f in freqs)/len(freqs)
    return x*env(n,.002,.09)*.35
def riser(t0,t1):
    n=int((t1-t0)*SR);t=np.arange(n)/SR
    x=rng.standard_normal(n); a=t/t[-1]
    return x*a**2*.25
# notes (F# minor funk)
B=lambda m:440*2**((m-69)/12)
bassline=[(0,42),(0.75,42),(1.5,45),(2,47),(2.5,42),(3,49),(3.5,47)]  # in beats within a 4-beat bar
chords=[[B(66),B(69),B(73)],[B(64),B(68),B(71)]]
nbeats=int(DUR/BEAT)
intro_beats=2
for b in range(nbeats):
    t=b*BEAT
    full=b>=intro_beats
    if full or b%1==0: add(kick(),t,0,1.0 if full else .8)
    if full and b%2==1: add(snare(),t); add(clap(),t,.1)
    if full and b%4==3: add(kick(),t+BEAT*0.5,0,.7)
    for s in range(4):
        if full or b>=1: add(hat(open_=(s==2 and b%2==1)),t+s*BEAT/4,-.3 if s%2 else .3)
for bar in range(nbeats//4+1):
    if bar*4<intro_beats: continue
    for (bt,m) in bassline:
        tt=bar*4*BEAT+bt*BEAT
        add(bass(B(m-12),BEAT*0.45),tt,0,1)
    ch=chords[bar%2]
    for off in (0.5,1.75,2.5,3.5):
        add(stab(ch),bar*4*BEAT+off*BEAT,.2 if off<2 else -.2)
# risers into each section change (clips change every 3s = 6 beats)
for t in (2.5,5.5,8.5,11.5):
    add(riser(t-0.5,t),t-0.5,0,.6)
# final hit
add(kick(),14.0,0,1.3); add(stab([B(54),B(61),B(66),B(69)],.9),14.0,0,1.6)
out=np.tanh(out*1.2); out/=np.max(np.abs(out))*1.05
fade=int(.4*SR); out[-fade:]*=np.linspace(1,0,fade)[:,None]
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((out*32767).astype('<i2').tobytes())
