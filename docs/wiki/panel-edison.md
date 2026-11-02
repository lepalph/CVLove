# Panel : Edison (parcours chronométrés)

Écrit le 2026-11-02 par l'inventeur Edison. Commit testé : `lepalph/CVLove@8b5a988`, site figé sur http://localhost:4321. Aucun fichier de code modifié.

## Comment j'ai mesuré

- Playwright (Chromium), deux écrans : bureau 1440 px, téléphone 390 px (tactile). Le téléphone est aussi mesuré avec le processeur ralenti 4 fois (comme l'audit de `REPRISE.md`) : c'est le chiffre « téléphone ».
- CV réaliste : Sophie Lambert, responsable de rayon, 4 expériences de 5 puces, 2 formations, compétences, langue, profil. L'aperçu fait **2 pages**. Mode Complet, partant d'un CV vierge.
- Clic = une action (cliquer, ou entrer dans un champ pour le remplir). Une liste déroulante compte 2 (ouvrir, choisir). Les signes tapés sont comptés à part.
- « Aperçu » = temps entre l'action et le dernier changement dans la zone d'aperçu, stable 400 ms. Sur téléphone, l'aperçu n'est fabriqué que dans l'onglet Aperçu : le temps compte donc le passage par cet onglet.
- Les temps machine n'incluent pas la frappe humaine. Estimation humaine du remplissage : 1 971 signes à 40 mots par minute (3,3 signes par seconde) = 10 min, plus 84 clics à 2 s = 3 min, soit **environ 13 min**. C'est une estimation, pas une mesure.
- Une première série sur téléphone (processeur x4) a été faussée par l'arrêt du serveur (erreurs `ERR_CONNECTION_REFUSED`). Je l'ai refaite : 0 erreur dans la série gardée.
- Scripts : `/private/tmp/claude-501/-Users-palphinho/ce48bcab-576a-446f-93bc-f8ea4d700f66/scratchpad/panel-edison/` (`p2.mjs bureau|mobile`, `fill.mjs`, `p3.mjs` pour la note qui couvre le menu).

## Mesures

| Parcours | Bureau : clics | Bureau : temps / aperçu | Téléphone : clics | Téléphone (CPU x4) : aperçu | Erreurs |
|---|---|---|---|---|---|
| Remplir le CV (84 clics, 1 971 signes) | 84 | aperçu 0,4 s après identité et profil | 84 | non fabriqué hors onglet Aperçu | 0 |
| dont les 6 dates de postes et d'études | 48 (liste Mois + Année, début + fin, 6 éléments) | | 48 | | 0 |
| Frappe réelle (120 signes, 60 ms par touche) | 1 | 0,48 s entre la dernière touche et l'aperçu | 2 | pas mesurable | 0 |
| Changer de modèle (3 essais) | 1 chacun | 0,52 à 0,69 s | 3 chacun (aperçu, retour) | 1,06 à 1,26 s | 0 |
| Changer de couleur (3 essais) | 1 chacun | 0,59 à 0,70 s | 3 chacun | 0,78 à 0,84 s | 0 |
| Ouvrir le panneau Design | 0 (ouvert) | | 1 (fermé par défaut) | | 0 |
| Réordonner : Langues de la 5e à la 2e place, boutons ↑ | 3 | 0,14 s | 3 | | 0 |
| Réordonner par glisser (sections repliées) | 1 geste + 1 pour « Tout replier » | 0,25 s | idem (tactile, CDP) | | 0 |
| Replier tout / déplier tout | 1 / 1 | replier relance l'aperçu : oui | 1 / 1 | | 0 |
| Replier puis rouvrir une section | 2 | | 2 | | 0 |
| Pages de l'aperçu : page 2, précédente, suivante | 3 (barre juste au-dessus) | page courante juste | 5 (avec les 2 changements d'onglet) | | 0 |
| Lettre : ouvrir la lettre assortie | 1 | 1,25 s, expéditeur repris du CV | 1 | | 0 |
| Lettre : passer en Complet | 1 (le mode n'est pas gardé) | 0,55 s | 1 | | 0 |
| Lettre : destinataire, entreprise, objet, corps (482 signes) | 4 | aperçu 0,42 s | 6 | | 0 |
| Export PDF du CV (137 Ko) | 1 | 0,14 s | 1 | 1,17 s | 0 |
| Export PDF de la lettre (57 Ko) | 1 | 0,08 s | 1 | | 0 |
| Export JSON (7 Ko) | 2 (menu Fichier, Exporter) | **6,25 s** juste après un PDF, 0,03 s sinon | 2 | 0,08 s | 0 |

Totaux du parcours complet : bureau 114 clics, 2 453 signes ; téléphone 134 clics. Zéro erreur de console ou de page dans les séries gardées.

Aussi mesuré : sur téléphone ralenti 4 fois, chaque changement de modèle ou de couleur bloque le fil principal 0,8 à 1,0 s au total, en tâches de 170 à 185 ms. Sur bureau : 50 à 77 ms, rien à signaler.

## Idées (5 au plus)

### 1. Date en une seule saisie (« 03/2021 ») au lieu de 4 listes par poste
- **Problème observé** : sur 84 clics pour remplir le CV, 48 vont aux dates (début et fin = Mois + Année, soit 4 listes à 2 clics, par poste ou formation). C'est 57 % des clics, pour 6 éléments. Sur téléphone, chaque liste ouvre le sélecteur natif.
- **Preuve** : `fill.mjs`, fonction `item` ; le total de la ligne « dont les 6 dates » du tableau. Reproduire : mode Complet, « Ajouter un élément » dans Expérience, compter les listes.
- **Idée** : un champ texte par date, qui accepte « 03/2021 », « mars 2021 » ou « 2021 » et garde les listes en secours (bouton ou clavier). `DatePick` garde son format AAAA-MM, seule la saisie change.
- **Effort** : M (analyse des dates dans 7 langues, dont l'arabe).
- **Gain mesuré** : de 8 clics à 2 par élément. Sur ce CV : 84 clics tombent à 48 environ, soit environ 36 clics en moins (-43 %).
- **Risque** : dates mal lues selon la langue (jour/mois). Il faut afficher ce qu'on a compris (« mars 2021 ») avant l'aperçu. Le PDF n'est pas touché.

### 2. La note « PDF enregistré » ne doit plus couvrir le menu Fichier
- **Problème observé** : après un téléchargement PDF sur bureau, la note de confirmation (6 s) est posée au même endroit que le menu Fichier. Le bouton « Exporter (JSON) » est bloqué pendant ces 6 s : mon script a attendu 6,25 s, contre 0,03 s sans le PDF. Un utilisateur clique dans la note et ne comprend pas.
- **Preuve** : `p3.mjs`, capture `docs/wiki/captures/edison/4-note-couvre-menu.png` : 0,7 s après le PDF, l'élément sous le bouton Exporter est la note (`P PDF enregistré : CV-Nadia-Perrin.pdf`). Sur téléphone : pas de recouvrement.
- **Idée** : `pointer-events: none` sur la note (elle est déjà `aria-hidden`), ou la placer sous l'en-tête à gauche.
- **Effort** : S (une classe).
- **Gain mesuré** : 6,25 s d'attente à 0,03 s, et un clic qui ne tombe plus dans le vide. Touche la confiance (« mon travail est gardé » passe par l'export JSON).
- **Risque** : très faible ; la note reste lue par les lecteurs d'écran via `role=status`.

### 3. Mobile : changer modèle et couleur depuis l'onglet Aperçu
- **Problème observé** : sur téléphone, chaque essai de modèle ou de couleur coûte 3 clics (choisir, onglet Aperçu, retour) contre 1 sur bureau. Le panneau Design est fermé au départ (+1 clic une fois) et la liste des 36 modèles est longue (capture `mobile-2-design-liste.png`). L'aperçu met ensuite 0,8 à 1,3 s (CPU x4).
- **Preuve** : lignes « Modèle … » et « Couleur … » du tableau ; `p2.mjs mobile`. Capture `docs/wiki/captures/edison/mobile-3-apercu-pages.png` pour l'onglet Aperçu.
- **Idée** : sur l'onglet Aperçu, une rangée de pastilles de couleur et un bouton « Modèle » (feuille du bas avec la liste) : on change et on voit sans changer d'onglet.
- **Effort** : M (nouveau composant mobile, mêmes données).
- **Gain mesuré** : de 3 clics à 1 par essai (-67 %). Pour un essai de 6 modèles et couleurs : 18 clics à 6.
- **Risque** : deux endroits pour le même réglage ; il faut un seul composant partagé. Écran étroit : la feuille ne doit pas cacher toute la page.

### 4. Replier une section ne doit pas refaire le PDF
- **Problème observé** : `collapsed` est dans les données du CV (voir [sections](sections-glisser-replier.md)), donc « Tout replier » relance le rendu du PDF, qui ne change pas. Mesuré : `preview_rerendered: true` sur bureau, 74 ms de fil bloqué. Sur téléphone ralenti, un rendu bloque 0,8 à 1 s.
- **Preuve** : ligne « Replier tout » du tableau ; `p2.mjs`, étape « Tout replier ». Reproduire : ouvrir l'éditeur avec un CV de 2 pages, replier, regarder l'aperçu se repeindre.
- **Idée** : retirer `collapsed` des `deps` de l'aperçu (comparer le CV sans ce champ). Pas de changement au JSON.
- **Effort** : S.
- **Gain mesuré** : un rendu complet évité à chaque repli (environ 0,6 s sur bureau avant l'aperçu stable, 0,8 à 1 s de fil bloqué sur téléphone ralenti).
- **Risque** : faible ; il faut vérifier que le PDF ne dépend pas de ce champ (il l'ignore, selon la page sections).

### 5. Glisser : replier tout seul pendant le geste
- **Problème observé** : réordonner une section de 3 places coûte 3 clics en ↑ (0,14 s) ; le glisser coûte 1 geste mais je n'ai réussi proprement qu'après « Tout replier » (1 clic de plus). Avec 4 expériences dépliées, la poignée et la cible sont à plusieurs écrans l'une de l'autre. Je n'ai pas testé le glisser avec défilement automatique sur ce CV : à confirmer.
- **Preuve** : lignes « Réordonner » du tableau ; capture `docs/wiki/captures/edison/desktop-1-cv-2-pages.png` (formulaire long) ; `p2.mjs`.
- **Idée** : au début du glisser, replier toutes les sections (aperçu d'une ligne), au lâcher remettre l'état d'avant.
- **Effort** : S à M (`sectionDrag.ts` et `setCollapsed`, état d'avant gardé en mémoire).
- **Gain mesuré** : déplacer de 4 places passe de 4 clics à 1 geste ; plus besoin du clic « Tout replier » (-1) avant de glisser.
- **Risque** : les sections qui se replient font sauter la page sous le doigt ; il faut garder la position de la poignée.

## Autres constats (hors des 5 idées)

- Le mode Guidé/Complet n'est pas gardé : 1 clic en plus à chaque nouveau CV et à chaque lettre (0,55 s).
- La lettre reprend bien l'expéditeur du CV (preuve : `sender_prefilled: Sophie Lambert`).
- La barre de pages et la page courante marchent (2, 1, 2) sur bureau et téléphone.
- Export PDF : 0,14 s sur bureau, 1,17 s sur téléphone ralenti (CV de 2 pages). Pas de blocage constaté.
- Non mesuré : arabe (RTL), modèles photo, Guidé sur tout le parcours, CV de plus de 2 pages.

## Débat (ronde 2)

- **Accords.** Annuler une suppression (Engelbart 3, TRIZ 3) : un × efface 45 champs sans retour, c'est le plus gros trou de confiance. Le témoin « gardé » (TRIZ 5) aussi, pour 1 ligne de pied de page. Rams 4 et 5 (moins de modèles d'abord, pas d'étape Télécharger en double) : moins de clics avant le premier champ, sans risque.
- **Désaccord 1 : Rams 3 (retirer le glisser sur téléphone).** Mesuré : le glisser au toucher déplace une section en 1 geste et 0,2 s ; les ↑ coûtent 1 tap par place (3 pour 3 places) et chaque tap a une cible de 44 px à retrouver. Ce qui gêne est la hauteur des sections dépliées, pas le glisser : je garde les deux et applique mon idée 5 (replier pendant le geste).
- **Désaccord 2 : Engelbart 4 (palette Ctrl+K).** Mesuré : 48 des 84 clics du remplissage sont des dates en listes. Une palette n'y change rien et ne sert pas sur téléphone. Raccourcis de saisie seuls (S) : oui ; palette : après les dates.
- **Désaccord 3 : TRIZ 1 (tiroir d'aperçu en bas).** Sur téléphone ralenti, un rendu bloque 0,8 à 1 s (tâches de 170 à 185 ms) ; un tiroir qui se repeint à chaque frappe ferait ramer le clavier. Mon idée 3 (pastilles sur l'onglet Aperçu) ne repeint qu'un clic à la fois.
- **Mesure faite pour Engelbart 5 (« tenir sur 1 page »).** Sur mon CV de 2 pages : marges Serrées seules = 2 pages (0,48 s) ; plus texte à 0,9 = 1 page (0,45 s). Il faut donc bien les deux réglages, et environ 1 s au bureau (environ 2,5 s sur téléphone ralenti, estimé à partir de 0,8 à 1,3 s par rendu). Faisable, à garder après l'annulation.
- **À fusionner.** (a) Engelbart 1 + 2 + TRIZ 2 : un seul index texte du PDF pour cliquer une ligne, allumer le champ et défiler l'aperçu. (b) TRIZ 3 + Engelbart 3 : une pile d'annulation et le bandeau « Annuler » 8 s. (c) TRIZ 1 + mon idée 3 : sur téléphone, un seul panneau Aperçu avec modèle, couleur et page courante. (d) Rams 2 (Masquer seul) + mon idée 5 : si on retire Supprimer, le replier pendant le glisser est le seul réglage de section à garder.
- **Top 3 final, toutes pages.** 1. Dates en une saisie (mon 1, M) : -36 clics sur 84, la plus grosse perte de temps mesurée. 2. Annuler + bandeau (Engelbart 3 + TRIZ 3, M) : confiance, et seul filet contre les 48 clics de dates refaits. 3. Téléphone : modèle et couleur sur l'onglet Aperçu (mon 3 + TRIZ 1, M) : 3 clics à 1. Hors podium, à faire d'abord car S : la note qui couvre le menu Fichier (6,25 s) et `collapsed` hors des deps de rendu.
