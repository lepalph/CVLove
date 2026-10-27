# L'arabe (Tajawal, TTF statiques OFL) est copié tel quel depuis google/fonts : voir pdf/fonts.ts.
# Génère les TTF statiques (react-pdf ne gère pas les axes variables) à partir des polices
# variables OFL de google/fonts. Usage : uv run --with fonttools scripts/make-fonts.py <dossier-sources> public/fonts
# Lora déclare un Reserved Font Name : les instances sont renommées « CVLove Serif » (exigence OFL).
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


src, out = sys.argv[1], sys.argv[2]
jobs = [
  ("Inter[opsz,wght].ttf", "Inter", {"opsz": 14}, {400: "Regular", 600: "SemiBold"}, None),
  ("Lora[wght].ttf", "Lora", {}, {400: "Regular", 700: "Bold"}, "CVLove Serif"),
]
for f, base, pins, weights, rename in jobs:
    for w, style in weights.items():
        font = instantiateVariableFont(TTFont(f"{src}/{f}"), {**pins, "wght": w})
        if rename:
            fam = rename
            for r in font["name"].names:
                if r.nameID in (1, 16): r.string = fam
                elif r.nameID in (2, 17): r.string = style
                elif r.nameID in (4,): r.string = f"{fam} {style}"
                elif r.nameID == 6: r.string = f"{fam.replace(' ', '')}-{style}"
        name = (rename or base).replace(" ", "")
        font.save(f"{out}/{name}-{style}.ttf")
