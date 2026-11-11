# La date en une saisie

Faite le 2026-11-02, sur la base `4dfd4c3`. Priorité P0 n° 2 du [panel](panel-synthese.md) ; mesure d'Edison dans [panel-edison.md](panel-edison.md) (48 clics sur 84 pour remplir le CV allaient aux listes Mois et Année).

## Ce qui change
Les deux listes Mois et Année de `DatePick` (`src/ui/Form.tsx`, début et fin des expériences et formations) sont remplacées par un seul champ texte. Le stockage ne change pas : `AAAA-MM` ou `AAAA`. Le seul usage de `DatePick` est ce formulaire ; la lettre n'a pas de sélecteur de date de ce type.

- Le parseur pur est `parseMonthInput(text, lang)` dans `src/model/dates.ts` (tests : `src/model/dates.test.ts`). `formatMonthInput` réaffiche `AAAA-MM` en `MM/AAAA`.
- Libellés (placeholder, erreurs) en 7 langues : `src/i18n/dates.ts`.
- Test e2e : `tests/e2e/dates.spec.ts` (saisie, erreur, règles, arabe, mobile).

## Formats acceptés
- Numériques : `03/2021`, `3/2021`, `03-2021`, `03 2021`, `3.21`, `032021`, `32021`, `202103`, `2021-03`, `2021/3`, `2021` (année seule).
- Noms de mois, longs, courts ou abrégés à 3 lettres, avec ou sans accent ni point, avant ou après l'année : « mars 2021 », « Mar 2021 », « März 2021 », « marzo de 2021 », « março 2021 », « مارس 2021 ».
- Les noms de la langue de l'interface sont cherchés d'abord, puis ceux des six autres.
- Chiffres arabes-indiens (٠-٩) et persans (۰-۹).
- Champ vide : date vide.

## Choix
- **Année à 2 chiffres** : jusqu'à l'année courante + 10, on lit 20xx ; au-delà, 19xx (en 2026 : `3.36` donne 2036, `3.37` donne 1937). La règle est écrite dans `fullYear`.
- **6 chiffres** : `AAAAMM` si les quatre premiers chiffres forment une année de 1900 à 2100 et les deux derniers un mois ; sinon `MMAAAA`.
- **Années** : de 1900 à 2100.
- **Un nombre seul** n'est une date que s'il a 4 chiffres (année), 5 ou 6 (compact). `03` ou `21` seuls sont refusés : on ne devine pas l'année.
- **Validation en sortie de champ ou à Entrée**, pas à chaque frappe : sinon l'aperçu PDF se recalcule sur des dates intermédiaires (`03/20` lu comme 2020). La valeur est alors réaffichée en `MM/AAAA` (chiffres latins, aussi en arabe, champ forcé en `dir="ltr"`).
- **Erreur** : texte en clair sous le champ (`aria-invalid`, `aria-describedby`), bordure `danger`. La saisie reste affichée, la valeur enregistrée ne bouge pas, l'erreur disparaît dès qu'on retape.
- **Fin avant début** : la fin est refusée avec un message. Cette règle n'existait pas dans le code à `4dfd4c3` (aucune comparaison) ; elle est ajoutée ici, sur la précision commune (année, ou année et mois). La case « En cours » désactive toujours la fin.
- **Pas d'`inputmode="numeric"`** : le clavier numérique n'a pas de lettres, donc il empêcherait « mars 2021 ». Le champ reste un champ texte.
- Placeholder : `MM/AAAA`, `MM/YYYY`, `MM/JJJJ`, et `شهر/سنة` en arabe.

## Retour sur la ronde 2 v3
La ronde 2 v3 avait choisi des listes (`DatePick` en deux `<select>`) pour obtenir un format constant et éviter les dates mal saisies. Cette décision est reprise. Pourquoi : les listes coûtent 2 clics chacune, soit 8 par élément daté (Edison), 57 % des clics pour remplir le CV, et sur téléphone chacune ouvre un sélecteur natif. Le format constant reste garanti, mais par la normalisation en sortie de champ et par le stockage inchangé, pas par la contrainte de saisie. Le gain attendu est de 8 clics à 2 par élément (Edison : environ 36 clics en moins).

## Limites
- Pas de saisie de jour (`12/03/2021` est refusé, 3 nombres).
- `21/03` (année puis mois à 2 chiffres) est refusé : on ne devine pas l'ordre.
- Abréviations à 3 lettres ambiguës dans une langue (« jui » en français) refusées.
- Une langue d'interface différente de la langue de saisie fonctionne grâce à la recherche dans les 7 langues, mais une abréviation commune à deux langues avec des mois différents prend le sens de la langue de l'interface.
- Un brouillon invalide reste affiché si la valeur change ailleurs (annuler, exemple chargé) : à revoir avec l'annulation de suppression.
- Les chaînes `month` et `year` de `src/i18n/ui.ts` ne sont plus utilisées ; laissées pour ne pas toucher un fichier partagé.
- Non vérifié : lecteur d'écran réel, clavier physique arabe.
