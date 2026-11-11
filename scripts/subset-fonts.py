# Allège les TTF de public/fonts : on garde les écritures utiles (latin, latin étendu, vietnamien, grec, cyrillique, ponctuation,
# monnaies) et les fonctions OpenType utilisées par react-pdf (crénage, ligatures, composition, marques), sans les instructions
# de hinting (inutiles dans un PDF vectoriel). L'arabe (Tajawal) n'est pas touché.
# Usage : uv run --with fonttools --with brotli scripts/subset-fonts.py <entrée> <sortie>   (après scripts/make-fonts.py)
import sys, os
from fontTools import subset
from fontTools.ttLib import TTFont

src, out = sys.argv[1], sys.argv[2]
UNICODES = "U+0020-007E,U+00A0-024F,U+0259,U+1E00-1EFF,U+0370-03FF,U+0400-052F,U+2010-2027,U+2030-205E,U+20A0-20C0,U+2100-2122,U+2190-2193,U+2212,U+2215,U+2248,U+2260-2265,U+25CF,U+2022,U+FB00-FB06"
FEATURES = "kern,liga,calt,ccmp,locl,mark,mkmk,case,frac,numr,dnom,sups,init,medi,fina,isol,rlig,rclt"
for f in sorted(os.listdir(src)):
    if not f.endswith(".ttf") or f.startswith("Tajawal"):
        continue
    opts = subset.Options()
    opts.layout_features = FEATURES.split(",")
    opts.hinting = False
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.glyph_names = False
    font = TTFont(f"{src}/{f}")
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    font.save(f"{out}/{f}")
    print(f, os.path.getsize(f"{src}/{f}"), "->", os.path.getsize(f"{out}/{f}"))
