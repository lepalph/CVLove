# L'arabe (Tajawal, TTF statiques OFL) est copié tel quel depuis google/fonts : voir pdf/fonts.ts.
# Génère les TTF statiques 400 + 700 (react-pdf ne gère pas les axes variables) à partir des polices
# variables OFL de google/fonts (dossier ofl/). Usage : uv run --with fonttools scripts/make-fonts.py <dossier-sources> public/fonts
# Les familles qui déclarent un Reserved Font Name (Lora, Source Sans 3, Playfair Display) sont renommées (exigence OFL).
# Licences : copier OFL.txt de chaque famille dans public/fonts/OFL-<famille>.txt.
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


src, out = sys.argv[1], sys.argv[2]
WEIGHTS = {400: "Regular", 700: "Bold"}
# (fichier source, nom de base du fichier de sortie, axes fixés, nouveau nom de famille ou None)
jobs = [
  ("Inter[opsz,wght].ttf", "Inter", {"opsz": 14}, None),
  ("Lora[wght].ttf", "CVLoveSerif", {}, "CVLove Serif"),
  ("SourceSerif4[opsz,wght].ttf", "SourceSerif4", {"opsz": 16}, None),
  ("SourceSans3[wght].ttf", "CVLoveText", {}, "CVLove Text"),
  ("PlayfairDisplay[wght].ttf", "CVLoveDisplay", {}, "CVLove Display"),
  ("Montserrat[wght].ttf", "Montserrat", {}, None),
]
for f, name, pins, rename in jobs:
    for w, style in WEIGHTS.items():
        font = instantiateVariableFont(TTFont(f"{src}/{f}"), {**pins, "wght": w})
        if rename:
            for r in font["name"].names:
                if r.nameID in (1, 16): r.string = rename
                elif r.nameID in (2, 17): r.string = style
                elif r.nameID == 4: r.string = f"{rename} {style}"
                elif r.nameID == 6: r.string = f"{rename.replace(' ', '')}-{style}"
                elif r.nameID == 3: r.string = f"{rename.replace(' ', '')}-{style};cvlove"
        font.save(f"{out}/{name}-{style}.ttf")
        print("ok", name, style)
