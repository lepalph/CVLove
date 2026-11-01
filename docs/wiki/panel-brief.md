# Brief du panel d'inventeurs

Rédigé le 2026-11-02 par le chief of staff. Lu par les 4 agents du panel, qui écrivent chacun `panel-<methode>.md` dans ce dossier.

## La question
Comment rendre l'éditeur de CVLove plus maniable : prise en main, vitesse pour remplir un vrai CV, contrôle de la mise en page, confiance (« mon travail est gardé »), sur bureau et sur téléphone ?

## Le produit (contraintes fixes)
- Gratuit, open source, 100 % local : pas de compte, pas de serveur, pas d'IA en ligne. Le PDF est fait dans le navigateur (react-pdf) et l'aperçu est ce PDF (pdf.js).
- Public : grand public, pas des designers. 7 langues dont l'arabe (RTL).
- À lire avant : [REPRISE.md](../REPRISE.md) (fait et reste à faire), [vérification](verification-reprise.md), [audit des boutons](audit-boutons.md), [sections](sections-glisser-replier.md), [aperçu multipage](apercu-multipage.md), et `docs/retours/v3/SYNTHESE.md` (ce que les personas ont déjà dit, et ce qu'on a écarté exprès).

## Méthode de chacun
- **TRIZ** : nommer les contradictions de l'éditeur (guidé contre libre, dense contre lisible, aperçu fidèle contre aperçu rapide…) et les résoudre par un principe inventif plutôt qu'un compromis.
- **Edison** : faire de vrais parcours chronométrés (remplir un CV réel de 2 pages, changer de modèle, réordonner, exporter), compter clics, temps et erreurs, et proposer ce qui gagne le plus de temps mesuré.
- **Engelbart** : manipulation directe et augmentation : agir sur l'aperçu lui-même, raccourcis, retour immédiat, ce que l'outil pourrait faire que le papier ne fait pas.
- **Rams** : retirer jusqu'à l'essentiel : ce qui est en trop, redondant ou confus, et ce qu'on gagnerait à enlever.

## Livrable de chacun (`panel-<methode>.md`)
- Date et commit testé.
- 5 idées au plus. Pour chacune : le problème observé, la preuve (étape reproductible ou capture dans `docs/wiki/captures/<methode>/`), l'idée, l'effort (S, M, L), et le risque pour le produit.
- Une section « Débat » ajoutée à la ronde 2, avec la réponse aux pages des trois autres : accord, désaccord argumenté, fusion d'idées.
