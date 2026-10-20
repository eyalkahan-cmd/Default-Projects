import sys
from PIL import Image, ImageDraw
files=sys.argv[2:]; out=sys.argv[1]
cw,ch=640,400; cols=3; rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cw*cols,(ch+24)*rows),(40,40,40)); d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGBA'); bg=Image.new('RGBA',im.size,(200,200,200,255)); bg.alpha_composite(im); im=bg.convert('RGB')
    im.thumbnail((cw,ch)); x=(i%cols)*cw; y=(i//cols)*(ch+24)
    sheet.paste(im,(x+(cw-im.width)//2,y+(ch-im.height)//2)); d.text((x+6,y+ch+4),f.split('/')[-1],fill=(255,255,0))
sheet.save(out,quality=88)
