# Audit UX de l'éditeur

Fait le 2026-11-02 avec le skill `ui-ux-director` (verbes critique, distill et polish), sur les captures de `lepalph/CVLove@429cecb` en 1440 px et 390 px. Il répond au retour de l'utilisateur, le même jour : « c'est pas beau », « trop d'information », « ça perd en beauté ». L'utilisateur a imposé la convention : chevron à droite, qui passe de › à ⌄ à l'ouverture, et poignée de glisser à droite.

## Calibrage
Mode Opérer, niveau Sobre. C'est un outil qu'on remplit, donc la charte reste celle de `src/index.css`. La seule animation est la rotation du chevron, en 150 ms, coupée par `prefers-reduced-motion`.

## Constat sur les captures d'avant
- **1 seconde.** Dans la colonne de gauche, l'œil ne trouve pas d'objet principal. Chaque section repliée aligne 6 contrôles de même poids : poignée, chevron, ↑, ↓, Masquer et ×. Sur 5 sections, ça fait 30 contrôles pour 5 titres.
- **Mobile, 390 px.** La ligne de titre passe sur deux lignes : Masquer et × tombent sous le titre, si bien que chaque section repliée occupe 3 lignes au lieu d'une.
- **Collision.** Le témoin « Enregistré sur cet appareil » était posé en absolu sous l'en-tête. Il recouvrait le haut des champs pendant le défilement (captures 1, 5 et 7 du premier envoi).
- **Conventions.** Le chevron était à gauche et pointait vers le bas quand la section était ouverte. Dans un accordéon on l'attend à droite, et il pivote.
- **Texte en trop.** La phrase « Masquer garde la section… » et les deux boutons « Tout replier » et « Tout déplier » remplissaient l'en-tête de la carte, avant même la première section.
- **État trompeur.** Une date de début changée après la date de fin ne donnait aucune erreur, et le PDF imprimait « mars 2021 – juin 2018 ».

Heuristiques de Nielsen, avant : 26/40 (65 %, acceptable).

| Heuristique | Note | Pourquoi |
|---|---|---|
| Visibilité de l'état | 3 | Aperçu en direct. Le témoin recouvrait les champs. |
| Correspondance avec le monde réel | 3 | Vocabulaire du CV. |
| Contrôle et liberté | 3 | Il y a Annuler, mais on ne peut ni mettre en pause ni rétablir. |
| Cohérence et standards | 2 | Chevron à gauche, qui ne suit pas la convention de l'accordéon. |
| Prévention des erreurs | 2 | Ordre des dates contrôlé dans un seul sens. |
| Reconnaissance plutôt que rappel | 3 | Résumé d'une ligne pour chaque section repliée. |
| Flexibilité | 3 | Glisser, ↑↓ et clavier. |
| Esthétique et minimalisme | 1 | 6 contrôles par ligne, une phrase d'aide, deux boutons globaux. |
| Récupération après erreur | 3 | Erreurs de date en clair. |
| Aide | 3 | Exemples et indications sous les champs. |

## Ce qui a été changé
- **En-tête de section.** À gauche, le titre, avec dessous le résumé quand la section est repliée. Cliquer sur le titre replie ou déplie la section. À droite, la poignée ⋮⋮ (en gris), puis le chevron › qui pivote en ⌄. En arabe, le chevron replié pointe vers la gauche.
- **Actions de la section.** ↑, ↓, Masquer et Supprimer (en texte rouge à la place du ×) sont descendus en bas de la section ouverte. Une section repliée ne les montre plus.
  - Les noms accessibles n'ont pas changé, par exemple « Monter la section X » ou « Supprimer la section X ».
  - ↑ et ↓ restent, à cause de WCAG 2.5.7 : il faut une alternative au glisser sans geste de déplacement (veille du skill du même jour).
- **En-tête de la carte.** Il n'y a plus qu'un bouton discret à droite du titre « Sections ». Il affiche « Tout déplier » si au moins une section est repliée, et « Tout replier » sinon. La phrase d'aide sur Masquer a été retirée. Le skill Rams l'avait déjà relevé : l'annulation rend la suppression sûre.
- **Témoin.** Il a rejoint le pied de l'éditeur, à droite du compteur « 0 requête vers un autre site », avec une coche. Les deux disent la même chose : tout reste sur l'appareil. Il ne recouvre plus rien.
- **Dates.** Le champ Fin vérifie l'ordre sur la valeur gardée, pas seulement quand on le quitte. Si on change le début après coup, l'erreur s'affiche sous la fin.

Heuristiques après : 31/40 (78 %, bon). Cohérence passe de 2 à 4, esthétique de 1 à 3, prévention des erreurs de 2 à 3.

## Ce qui reste (P1)
- **Champs de contact.** Chaque ligne a encore « Masquer » et « × » en texte. On pourrait passer « Masquer » en icône œil, avec son nom accessible, comme on l'a fait pour les sections.
  - Fait le 2026-11-02 (base `lepalph/CVLove@7237ec5`) : un œil, barré quand le champ est masqué. Le nom accessible n'a pas changé (« Masquer … », « Afficher … »), la cible fait toujours 44 px.
- **Panneau Design dans le formulaire.** Les trois rangées de filtres du catalogue (catégorie, colonnes, photo) prennent un écran entier avant les modèles.
- **Doubles traits.** Les entrées ont un trait à gauche et les sections un trait en haut : il y a 2 types de séparateurs dans la même colonne.
- **Dark mode et 768 px.** Ni l'un ni l'autre n'a été capturé pendant cet audit.

## Preuves
- Captures d'après : `scratchpad/shots2/` de la session, envoyées à l'utilisateur.
- Tests : `tests/e2e/sections.spec.ts` (repli, glisser, arabe), `tests/e2e/undo.spec.ts` (Supprimer la section, pris en bas de la section), `tests/e2e/dates.spec.ts` (« changer le début après la fin »), `tests/e2e/p0s.spec.ts` (témoin).
- Liens : [sections](sections-glisser-replier.md), [corrections S](corrections-s.md), [date](date-une-saisie.md), [synthèse du panel](panel-synthese.md).
