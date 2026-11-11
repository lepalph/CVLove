# Panel P1 : glisser, guidé allégé, sommaire

Écrit le 2026-11-11, base `lepalph/CVLove@21d928e`. Trois P1 de la [synthèse du panel](panel-synthese.md). La convention de l'auteur ne change pas (chevron › à droite, poignée ⋮⋮ à droite, actions en bas de la section ouverte : voir [Audit UX](audit-ux-editeur.md) et [Sections](sections-glisser-replier.md)). Test : `tests/e2e/panel-p1.spec.ts`.

## 1. Sections repliées pendant le glisser
- `SectionsCard` passe `dragging` à chaque `SectionEditor` tant que `useSectionDrag` a un glisser en cours. L'éditeur affiche alors la section repliée (`hidden` sur le corps, résumé d'une ligne) **sans toucher à `Section.collapsed`** : au lâcher ou sur Échap, chacune retrouve seule l'état qu'elle avait, et rien n'est écrit dans le stockage ni relancé dans le PDF.
- Conséquence dans `sectionDrag.ts` : la mise en page change pendant le geste. Le décalage de la section tenue part maintenant de sa place naturelle (position à l'écran moins le `translateY` déjà posé) et de l'endroit où la poignée la tient ; trois recalculs dans les premières images laissent le repli se poser. Le défilement automatique du panneau reste en place (il recalcule à chaque image).
- Les tests de glisser existants mesurent désormais la cible après la prise (les hauteurs ont changé).

## 2. Mode guidé allégé
Décidé à partir de [Rams 1](panel-rams.md) et de la synthèse, qui a écarté « Masquer seul » (une section masquée reste dans le JSON exporté) : on garde donc Masquer et ×.
- **Chevron et repli : retirés en guidé** (`lean`). Une étape montre ses sections, pas de repli utile ; une section repliée dans le mode complet s'affiche ouverte, sinon elle serait fermée sans moyen de la rouvrir. Le titre ne replie plus au clic, « Tout replier » n'apparaît plus.
- **Section seule dans l'étape** (Profil, Expérience, Formation) : plus de ↑ ni de ↓, plus de poignée (elle ne sert à rien à une seule section). Reste : Masquer et ×.
- **Étapes à plusieurs sections** (Compétences et langues, Autres sections) : poignée et ↑↓ gardées, c'est leur seul usage.
- Non fait : le champ « Titre de la section » et la phrase d'aide restent (ils sont dans le corps de `SectionEditor`, hors de ce périmètre). À reprendre si l'auteur veut aller jusqu'au bout de Rams 1.

## 3. Sommaire collant (mode complet)
- `src/ui/Toc.tsx`, monté par `Editor.tsx` avant `Form` : une barre de pastilles collée en haut du panneau (une par section, dans l'ordre du CV, masquées comprises). Un clic fait défiler jusqu'à la section et met le focus sur son titre ; rien ne se replie ni ne s'ouvre (pas d'accordéon exclusif, écarté par le panel). `scroll-mt-16` sur la section pour ne pas passer sous la barre.
- Discret : mode Opérer, niveau Sobre. Texte 13 px gris, bordure seulement au survol, un filet dessous, pas d'animation hors défilement doux (désactivé si `prefers-reduced-motion`). Ligne unique qui défile en largeur si elle déborde.
- **Masqué sous 1024 px** (mise en page à une colonne, page déjà longue, la barre collante mangerait de la hauteur utile). Visible dès `lg`.
- Libellé de la navigation dans `src/i18n/toc.ts` (7 langues). Arabe : vérifié en test (RTL, pas de débordement) ; la barre suit le sens de lecture.
- Pas de pastille « section courante » : un suivi du défilement coûte un observateur pour un gain faible ; à ajouter si le panel le demande.

## Non vérifié
Vrai téléphone et vrai tactile (émulé), glisser de sections très hautes avec défilement sur un long CV, rendu du sommaire à plus de 10 sections.

## Reprise par le chief of staff (2026-11-11, après `lepalph/CVLove@3ce1500`)
- Captures à 1440 px : le sommaire mordait sur l'encart d'exemple, il collait 2rem sous le bord du panneau (le collant se cale sur la boîte de contenu, donc après le padding), et les sections au-delà de la 4e étaient cachées dans un défilement horizontal sans indice.
- Corrigé : le sommaire passe avant l'encart d'exemple, `-top-8` pour coller au bord, retour à la ligne au lieu du défilement, `scroll-mt-28` sur les sections.
- Tests : les glissers font défiler la poignée au centre (en haut, elle passait sous le sommaire), et le test du sommaire attend la fin du défilement doux.
