# Ronde 2 : persona Tom

## Qui
Tom, 27 ans, Britannique à Lyon, ingénieur qualité. Navigateur en anglais (en-GB), 1440×900. Il veut deux CV : un en anglais au format Letter pour les États-Unis, un en français (A4) pour la France. Il lit l'interface en anglais, son français est moyen.

## Parcours réalisé
1. Accueil : l'interface s'ouvre directement en anglais (la langue suit bien le navigateur).
2. Mode Complet : identité, deux champs personnalisés (LinkedIn, GitHub), profil, 2 expériences avec dates, formation, compétences, 2 langues. Format Letter.
3. Téléchargement du PDF : `CV-Tom-Whitaker.pdf`, 612×792 pt (Letter confirmé).
4. Export JSON du document.
5. Mes documents : Dupliquer, Renommer en « Tom Whitaker FR », passage de la langue du CV en Français, A4, traduction de mon texte, téléchargement du PDF.
6. Export de tous les documents, puis import des deux fichiers dans un contexte vide.
7. Parcours rapide des 9 étapes du mode Guidé pour relire l'anglais.

Test d'import : les données importées sont identiques au fichier source (comparaison champ par champ, hors identifiants et dates). Seul l'ordre des clés change. Rien n'est perdu (personnalisés, dates, design, langue du CV).

## Première impression (les 30 premières secondes)
Page d'accueil en anglais sans que j'aie rien fait. Titre clair : « Your CV as a PDF, no account, no fees ». L'aperçu à droite montre un vrai CV, pas une maquette vague. Le bandeau « 0 request to another site » rassure. Anglais naturel, pas de traduction mot à mot visible. J'ai tout de suite compris la promesse. La seule chose qui accroche : « Create my CV » alors que le sélecteur de langue du CV dira « Résumé » plus loin. (capture r2-tom-01)

## Frictions

### P0
Aucun. Le parcours aboutit, les deux PDF sont corrects.

### P1
1. **Typographie française dans l'anglais.** Où : aperçu et PDF, partout où il y a un deux-points. Ce qui se passe : « Quality tools : FMEA », « English : Native »« LinkedIn : linkedin.com/in/… » : espace avant le deux-points. Dans le PDF américain, un recruteur y voit une faute. Aussi dans l'interface : « Leave empty for the standard title: « Profile » » avec guillemets français « », et les libellés d'accessibilité « Open : Tom Whitaker ». Captures : r2-tom-04 (aperçu), r2-tom-08. Suggestion : espace insécable avant « : » seulement pour fr (et es/it si besoin), pas pour en/de ; guillemets “ ” en anglais.
2. **Champ personnalisé : les deux zones s'appellent « Label ».** Où : Détails personnels, « + Custom field ». Ce qui se passe : la première zone est le nom (LinkedIn), la seconde la valeur (l'URL), mais les deux sont étiquetées « Label ». La zone valeur est étroite : l'URL est tronquée. Capture r2-tom-03. Suggestion : « Label » et « Value » (ou « Link »), valeur sur toute la largeur. Il n'y a pas de champ LinkedIn dédié, alors que c'est un champ courant d'un CV américain.
3. **Import JSON : la copie vide reste « en cours d'édition ».** Où : Mes documents, Import. Ce qui se passe : après import, un « Untitled résumé » vide reste en tête et reste le document actif. En cliquant « Edit », je retombe sur une page vide en croyant avoir tout perdu. Le document importé est en dessous, sans mise en avant. Capture r2-tom-07. Suggestion : supprimer le document vide intact avant d'importer, ou ouvrir le document importé.

### P2
4. **Changer la langue du CV ne change pas le format de page.** Passage en français : Letter reste sélectionné. Je dois penser à repasser en A4 moi-même. Pas de rappel. Suggestion : un indice discret (« A4 is the French standard ») ou un réglage automatique proposé.
5. **Les deux PDF ont le même nom** (`CV-Tom-Whitaker.pdf`). Avec deux versions, je dois renommer à la main. Suggestion : ajouter la langue ou le nom du document (`CV-Tom-Whitaker-en.pdf`). Le préfixe « CV » pour un résumé américain est aussi étrange.
6. **Deux sélecteurs de langue côte à côte, un seul étiqueté.** Le sélecteur de l'interface (en haut à droite) n'a pas de libellé visible ; celui de « Résumé language » en a un. Le texte d'aide « Changes section titles and dates, never your text » est clair et m'a évité de croire que mon texte serait traduit. Mais quelqu'un qui ne lit pas le sélecteur du haut peut hésiter. Suggestion : libellé visible « Interface » ou icône globe. Capture r2-tom-05.
7. **« Résumé » et « CV » dans la même interface.** Accueil : « Create my CV ». Éditeur : « Résumé language », « New résumé ». Pour un Britannique, « CV » partout est plus naturel ; pour un Américain, « résumé » partout. Il faudrait choisir selon en-GB / en-US, ou au moins rester cohérent.
8. **Dates dans Mes documents au format américain.** « Edited Oct 29, 2026, 12:04 AM » alors que mon navigateur est en-GB. J'attends « 29 Oct 2026, 00:04 ». Les dates du CV (« Sep 2021 – Dec 2024 ») sont, elles, acceptables pour les deux pays.
9. **« 1 document(s) imported. »** Paresse de pluriel. Suggestion : pluriel correct.
10. **Orthographe mêlée : « Accent color » et « Custom colour ».** Mélange US et UK dans le même panneau.
11. **Le ton des aides vise un public junior** : « Babysitting, a summer job… », exemple « Motivated student looking for a first job in retail », placeholders « Sales assistant », « Martin's Bakery ». Pour un ingénieur de 27 ans, ça refroidit un peu. Rien de grave, les textes sont modifiables.
12. **Champs utiles à un CV anglo-saxon.** Date de naissance et photo sont proposées par défaut, deux choses à éviter pour une candidature américaine. Le champ date de naissance est vide, donc non imprimé, mais Tom devrait le masquer. Un petit avertissement « Not usual on a US résumé » serait utile. Pas de rubrique « Certifications » ni « Publications » prête à l'emploi (pour un qualiticien : Green Belt, ISO). La section personnalisée existe, mais je ne l'ai pas testée.

## Ce qui m'a plu
- L'interface suit le navigateur sans demander.
- La séparation langue du CV / langue de l'interface est claire grâce à la phrase d'aide : les titres de section et les dates changent, pas mon texte. Le PDF français a bien « Expérience professionnelle », « Formation », « sept. 2021 – déc. 2024 ».
- Dupliquer, renommer en ligne, ouvrir la copie : 4 clics, aucune hésitation.
- Letter donne bien un PDF 612×792.
- Export/import fiables.
- « 0 request to another site » : confiance immédiate.

## Qualité du PDF obtenu
- EN (Letter) : propre, lisible, hiérarchie nette, dates alignées à droite, Lora + Inter bien choisis. Défauts : « : » précédé d'une espace, bas de page vide (normal, CV court). Ça tient sur une page.
- FR (A4) : titres de section et dates correctement francisés (« févr. », « août »), pas de gros problème.
- Les champs personnalisés s'affichent en texte simple « LinkedIn : … » (je n'ai pas vérifié si le lien est cliquable dans le PDF).

## Note globale : 7,5/10
Je le recommanderais à un ami parce qu'il est gratuit, privé, et que dupliquer un CV pour le passer en français prend deux minutes, mais je lui dirais de vérifier les « : » espacés dans le PDF anglais et de changer lui-même le format A4/Letter.
