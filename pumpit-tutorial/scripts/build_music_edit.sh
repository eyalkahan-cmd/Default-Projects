#!/bin/sh
# Music edit of "Paper Puppy - Stripped Version" (XiMo, Artlist), cut on the 111 BPM bar grid to the voiceover.
# film 0.00-13.07  <- src 110.17-123.24 (full section, opening)
# film 13.07-77.93 <- src 0.00-64.86 (light intro + groove from "most important"; full section lands at 77.93 = "full size!")
# film 77.93-84.42 <- src 64.86-71.35 (payoff)
# film 84.42-end   <- src 151.35-157.80 (natural ending, final hit at film ~88.82 for the logo)
set -e
IN="$1"; OUT="$2"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -filter_complex "\
[0:a]aresample=48000,asplit=4[a][b][c][d];\
[a]atrim=110.17:123.24,asetpts=PTS-STARTPTS,afade=t=out:st=11.0:d=2.07:curve=qsin[s1];\
[b]atrim=0:64.86,asetpts=PTS-STARTPTS[s2];\
[c]atrim=64.86:71.35,asetpts=PTS-STARTPTS,afade=t=out:st=6.47:d=0.02[s3];\
[d]atrim=151.35:157.80,asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=5.2:d=1.25[s4];\
[s1][s2]concat=n=2:v=0:a=1[j1];[j1][s3]concat=n=2:v=0:a=1[j2];[j2][s4]concat=n=2:v=0:a=1[out]" \
-map "[out]" -c:a pcm_s24le "$OUT"
