# Retour persona : Youssef (v2)

**Qui** : Youssef, 29 ans, ingénieur à Casablanca, arabophone et francophone. Ordinateur 1440x900 puis téléphone 390x844. Exigeant sur l'arabe et sur le miroir RTL.

**Parcours réalisé** : accueil (interface détectée en arabe, bien) > éditeur guidé (9 étapes) > CV arabe (identité, expérience avec React/TypeScript/PostgreSQL, formation) > 12 modèles téléchargés en PDF et comparés > lettre de motivation arabe > Mes documents, copie du CV > copie passée en français > mobile (accueil, éditeur, aperçu, étape par menu).
Captures : `docs/retours/v2/captures/youssef/` (scripts : `.personas/youssef/`).

## Frictions
**P0**
1. **Copie passée en français = texte arabe illisible** (étape CV > Identité > « Langue du CV » = Français). Le PDF et l'aperçu montrent des signes sans sens (`1E9F( A3HJ`) pour tout mon texte arabe, seuls les titres changent. C'est exactement le scénario promis par la spec (« jamais le contenu saisi »). Capture 08. Suggestion : enregistrer Noto Sans Arabic comme police de repli dans tous les modèles et toutes les langues (fontFamily en liste), et ajouter un cas arabe-sous-FR à `check:pdf`.
2. **Paragraphes arabe + mots latins qui s'enroulent = phrases mélangées** (profil, descriptions, corps de la lettre). Sur 2 lignes, la 2e phrase passe devant la 1re : « وقد خفّضتُ … React … أعمل منذ 5 سنوات … يسعدني أن أتقدم » à la place de l'ordre réel. Captures 06 et 07. Un ingénieur écrit toujours ainsi : c'est le cas courant, pas un cas limite. Suggestion : appliquer l'algorithme bidi après le découpage en lignes (ou insérer des marques U+200F/U+202B autour des segments latins et résoudre par ligne), tester avec un paragraphe de 3 lignes.
3. **Objet de la lettre brouillé** : « الموضوع: طلب توظيف: مهندس Full-Stack (مرجع REF-2026/14) » est rendu dans le désordre (« مهندس » à droite, « الموضوع » au milieu, parenthèse du mauvais côté). Capture 07. Suggestion : libellé et valeur dans deux blocs séparés, valeur avec `direction: rtl` explicite.

**P1**
4. « و » collé à un mot latin (« وNode.js ») s'affiche « gNode.js » : le glyphe est du mauvais côté et ressemble à un g (captures 06, 07). Suggestion : même correctif bidi ; à défaut insérer une marque RLM après la lettre.
5. **Lettre : destinataire, adresse et date alignés à gauche** alors que le reste est à droite (capture 07). Suggestion : `textAlign: right` en RTL pour tout le bloc.
6. **Polices mono avec espacement de lettres sur de l'arabe** (étiquette « القوالب », « الخطوة 1 من 9 », méta de Mes documents) : les lettres ne se lient plus (« ا ل ق و ا ل ب »). Captures 02, 09, 10. Suggestion : `letter-spacing: 0` et police arabe quand `dir=rtl`.
7. **Noms de modèles en français dans l'interface arabe** (« كلاسيكي · Académique », « Chancellerie », « Marginalia »…) : mélange visuel et sans sens pour moi ; le point médian saute du mauvais côté sur mobile (capture 09). Suggestion : traduire les noms ou n'afficher que « كلاسيكي 1/2/3 ».
8. **Données d'exemple de Laila gardées** : son site, son téléphone et sa date de naissance restent dans mon CV si je ne les remplace pas, et rien ne me le dit (capture 02). Risque d'envoyer le CV avec un faux numéro. Suggestion : bandeau « Données d'exemple » + bouton visible « Partir d'une page vide ».
9. **Mobile : l'en-tête collant prend 340 px sur 844** (logo, Guidé/Complet, langue, Modifier/Aperçu). Il reste peu de place pour saisir (capture 09). Suggestion : regrouper en une seule ligne, langue dans un menu.
10. **Modèle Pavé : 2 pages** avec la seule section « الاهتمامات » seule sur la page 2, alors que les autres tiennent sur 1. Suggestion : réduire les marges de ce modèle ou garder la section avec la précédente.

**P2**
11. Champs date (mois) en anglais (« March 2021 », « --------- ---- ») dans une interface arabe : c'est le contrôle du navigateur, mais le libellé « مستمر » à côté n'aide pas. Capture 03. Suggestion : deux listes mois/année en arabe.
12. Les documents s'appellent « CV » et « CV 2 », sans mon nom ; la copie n'est pas distinguée par sa langue (capture 10). Suggestion : nommer « CV يوسف بنعمر » et ajouter la langue dans la ligne.
13. Filtres de la galerie et boutons de Mes documents à 36-40 px de haut sur mobile (cible < 44 px, spec).
14. Modèle Bandeau plein : les barres de niveau chevauchent l'étiquette de la compétence (non capturé).
15. Zone de texte « Description » trop petite : la 1re ligne est coupée en haut (capture 03).

## Avis DA
Sobre, clair, rassurant : le look Vercel (filets, noir/blanc) inspire confiance, « sans compte » et « tout sur votre appareil » se comprennent tout de suite. Le miroir RTL de l'interface est correct (formulaire, pastilles d'étapes, boutons, menus) et l'arabe de l'interface est naturel, mis à part les points 6 et 7. Contraste bon, boutons lisibles. Le texte en bas « Geist Mono » est joli en latin mais abîme l'arabe.

## Conformité du rendu
- Aperçu = PDF : comparaison pixel à pixel de l'aperçu (canvas) et de la page 1 du PDF converti avec pdfjs : 0,8 % de pixels différents (anti-aliasing). Identité confirmée.
- Nom de fichier correct : `CV-يوسف-بنعمر.pdf`, `Lettre-…pdf`.
- Miroir RTL des 12 modèles testés (Académique, Bandeau, Frise, Marginalia, Dense, Doublé, Pavé, Registre, Bandeau plein, Aplat, Nuit, Cartouche) : colonnes latérales et bandeaux bien inversés, titres à droite, dates à gauche (captures 04, 05). Chiffres latins partout (cohérent avec le Maroc), dates « مارس 2021 - حتى الآن » justes et dans le bon ordre.
- Courtes lignes mixtes (« React و TypeScript و Node.js ») : correctes. Paragraphes longs : cassés (P0 2). Copie FR : cassée (P0 1).

## Ce qui m'a plu
Interface arabe détectée toute seule ; navigation par 9 étapes claire ; 36 modèles bien différents ; copie du CV en un clic ; PDF léger de 1 page, texte sélectionnable ; privacy visible ; pas de débordement horizontal sur mobile.

## Note : 5/10
Très bon socle, mais je ne peux pas envoyer un CV dont le résumé est mélangé, ni une copie française lisible.

## Recommandations prioritaires
1. Police arabe de repli dans tous les modèles + test « CV arabe passé en FR/EN » (P0 1).
2. Corriger le bidi des paragraphes qui s'enroulent et l'objet de la lettre, avec tests de paragraphes mixtes (P0 2 et 3, P1 4).
3. Corriger l'arabe de l'interface : `letter-spacing` sur les étiquettes mono, noms de modèles traduits, bloc destinataire/date aligné à droite.
