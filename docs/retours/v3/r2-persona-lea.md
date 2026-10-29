# Ronde 2, persona Léa

## Qui
Léa, 19 ans, étudiante en BTS. Premier CV pour un job d'été en restauration. iPhone (390x844, tactile, fr-FR). Un baby-sitting et un bénévolat à la banque alimentaire. Test sur http://localhost:4302, Chromium headless émulant un iPhone (pas de vrai Safari iOS). Elle avait déjà testé la ronde 1 (`r1-persona-lea.md`).

## Parcours réalisé
Accueil, filtre « Créatif » dans le catalogue, « Commencer avec ce modèle » sur Créatif · Pastel, éditeur guidé complet : Identité, Profil, Expérience (baby-sitting + bénévolat), Formation (BTS en cours), Compétences et langues, Autres sections (Centres d'intérêt ajoutés), Design (regardé), Télécharger. Aperçu (et « Agrandir l'aperçu »), PDF téléchargé (`CV-Lea-Martin.pdf`) et relu. Puis « Créer la lettre assortie » : Expéditeur, Destinataire, Objet, Corps, aperçu, PDF `Lettre-Lea-Martin.pdf` relu. Un détour par « Mes documents » (CV et lettre bien listés).

## Première impression (les 30 premières secondes)
Accueil identique à avant : titre clair, « sans compte et sans frais », gros bouton noir « Créer mon CV » (capture 01). Le CV de démo en dessous est toujours Camille Marchand, développeuse full-stack. Je ne me reconnais pas.

Mais le vrai changement vient après : en touchant un modèle du catalogue, j'arrive directement sur l'étape 2 « Identité », l'étape « Modèle » est marquée « (faite) » (capture 02). Plus de mur de 36 miniatures. Je me sens guidée. Et dès l'étape Identité, le placeholder du poste est « Vendeuse », plus « Développeuse ».

Ressenti : plus chaleureux qu'avant, mais le haut de la page d'accueil reste « outil » plutôt que « mon premier CV ». Aucun vide marquant dans l'éditeur, sauf la lettre (voir plus bas).

## Suivi des frictions de la ronde 1

| Friction r1 | Statut | Constat |
|---|---|---|
| P1-1 Placeholders de dev senior | **Corrigée** (en grande partie) | Poste « Vendeuse », entreprise « Boulangerie Martin », diplôme « Bac pro commerce », école « Lycée Jean-Moulin », description « Accueil et conseil des clients / Tenue de la caisse », compétences « Sens du contact, Excel, ponctualité », intérêt « Randonnée ». Reste : Prénom/Nom en « Camille / Marchand » et la démo de l'accueil. |
| P1-2 Aucune aide pour celle qui n'a rien à écrire | **Corrigée** | Profil : exemple « Étudiante motivée, je cherche un premier emploi dans la vente… ». Expérience : « Pas encore d'emploi ? Un baby-sitting, un job d'été, un stage ou du bénévolat comptent. » Formation : « un stage ou une formation courte y a aussi sa place ». Compétences : « Savoir-être, Outils, Langues ». Captures 03, 04. |
| P1-3 L'éditeur démarre sur la grille de 36 modèles | **Corrigée** | L'éditeur s'ouvre à l'étape 2 quand le modèle vient de l'accueil. Le récap de l'étape 9 rappelle « Créatif · Pastel ». |
| P2-1 Aperçu seulement dans un onglet | **Toujours là** | Toujours Modifier/Aperçu en onglets, pas de mini-aperçu. Ajout d'un bouton « Agrandir l'aperçu » (voir P2 ci-dessous). |
| P2-2 Défilement non remis en haut | **Corrigée** | Après chaque « Suivant », le titre de l'étape est en haut, rien de coupé (captures vues à chaque étape). |
| P2-3 « Suivant » gris foncé, presque désactivé | **Toujours là** | Après un tap, « Suivant » et « Télécharger le PDF » restent gris (#4a4a4a environ) au lieu de noir (captures 06, et étape 7). Ressemble à un survol collé sur écran tactile. |
| P2-4 Dates « mois » natifs | **Toujours là** | « September 202 » tronqué en anglais dans Chromium, pas de « AAAA-MM » visible (limite possible du navigateur de test, non vérifiable sans vrai iPhone). |
| P2-5 Catégorie et Niveau des compétences | **Améliorée** | Placeholder « Savoir-être, Outils, Langues… » et phrase d'aide. Mais la section Langues garde deux champs « Niveau » (un menu, un texte avec « Courant ») : je ne sais pas lequel remplir (capture 04). |
| P2-6 Téléchargement sans retour | **Corrigée** | Bandeau « PDF enregistré : CV-Lea-Martin.pdf » en haut, plus la même ligne en bas de l'étape (capture 06). |
| P2-7 « Masquer » et « × » inquiétants | **Toujours là** | Inchangé. La phrase « Masquer garde la section… Supprimer l'efface » est là, mais « × » seul reste ambigu. |
| P2-8 Miniature du catalogue en squelette gris | **Toujours là** (ponctuel) | En arrivant vite sur le catalogue, toutes les miniatures sont des barres grises. Après 1 seconde elles se remplissent. Chargement différé, pas de capture conservée. |
| PDF : page à 55 % utilisée, pas de niveau d'anglais | **Toujours là** | Le contenu s'arrête vers 63 % de la page (capture 08). « Anglais » sans niveau si on ne choisit rien. |

## Frictions de cette ronde

### P0
Aucun blocage : CV et lettre arrivent au PDF.

### P1
1. **Lettre : aucune aide pour un premier courrier.** Où : étape Corps de `#/lettre`. Ce qui se passe : une grande zone vide, sans placeholder, sans phrase d'exemple (capture 07). L'étape Destinataire et l'étape Objet n'ont aucune consigne non plus (pas de « Si vous ne connaissez pas le nom, écrivez Madame, Monsieur »). Le CV m'a tenue par la main, la lettre me lâche. Je ne sais pas quoi dire à un patron de brasserie. Suggestion : même traitement que le CV : un exemple « job d'été en restauration » en placeholder du corps (3 paragraphes : qui je suis, pourquoi vous, ma disponibilité), et une ligne d'aide par étape.
2. **Aperçu mobile illisible sans zoom.** Où : onglet Aperçu. Ce qui se passe : la page A4 est réduite à 390 px, le texte fait environ 4 px (capture 05). Je ne peux pas relire mon CV. Suggestion : ouvrir « Agrandir l'aperçu » d'office ou le mettre en avant.

### P2
1. **« Agrandir l'aperçu » coupe le CV à droite.** Où : onglet Aperçu, après le tap. Ce qui se passe : le texte est lisible mais la page est rognée (« Étudiante en BTS, je cherche un jo… »). Je n'ai pas vérifié si on peut faire défiler dans le sens horizontal. Suggestion : zoom ajusté à la largeur, ou indice « glissez ».
2. **Prénom et Nom pré-remplis en grisé « Camille Marchand ».** Où : étape Identité. Suggestion : un prénom neutre, ou pas de placeholder sur le nom.
3. **Section Langues : deux champs « Niveau ».** Voir tableau, P2-5. Je mets « Anglais » seul, le PDF affiche « Anglais » nu.
4. **Page d'accueil : démo Camille, développeuse.** Le catalogue ne propose pas de CV « premier emploi ». Suggestion : au moins un modèle ou une démo étudiante.
5. **Page du CV à moitié vide en bas.** Normal avec mon contenu court, mais un premier CV sera souvent dans ce cas. Suggestion : aider à remplir (« Ajoutez permis, associations, langues avec niveau »), ou une taille de texte un peu plus grande par défaut.

## Ce qui m'a plu
- L'éditeur qui démarre à « Identité » quand j'ai déjà choisi un modèle : j'avance tout de suite.
- Les aides contextuelles : « Pas encore d'emploi ? Un baby-sitting… comptent ». Ça m'a enlevé la peur.
- L'exemple de profil « Étudiante motivée, je cherche un premier emploi dans la vente ».
- Le retour « PDF enregistré : CV-Lea-Martin.pdf » (capture 06).
- « Créer la lettre assortie » : nom, titre, e-mail, téléphone, date, formules d'appel et de politesse, signature sont déjà là. Le PDF de la lettre reprend le bandeau violet du CV.
- « Mes documents » liste clairement mon CV et ma lettre.
- Pas de compte, « 0 requête vers un autre site » toujours visible.

## Qualité du PDF obtenu
**CV** (`CV-Lea-Martin.pdf`, Créatif · Pastel, accent violet, A4, 1 page) : bandeau lavande, titres en Playfair, texte net, accents corrects (Léa, Lycée, Bénévole). Dates « sept. 2023 » et « sept. 2024 – Présent » lisibles. Le contenu s'arrête vers 63 % de la page. Il correspond à l'aperçu.
**Lettre** (`Lettre-Lea-Martin.pdf`, mise en page « Latérale ») : colonne lavande avec nom, titre, e-mail, téléphone. Lieu et date, destinataire, objet en violet, trois paragraphes, formule de politesse, signature. Propre et crédible. Le haut seulement est rempli, ce qui est normal pour une lettre courte.

## Note globale : 7,5/10
Je le recommanderais à un ami parce que le CV se remplit enfin avec des exemples et des conseils qui me parlent (premier emploi, baby-sitting) et que le PDF est propre et sans inscription, mais la lettre ne donne aucune aide, l'aperçu est trop petit sur téléphone et l'accueil montre toujours une développeuse.

## Captures
01 accueil, 02 éditeur au démarrage (étape Identité), 03 étape Expérience avec l'aide « Pas encore d'emploi ? », 04 Compétences et langues (deux « Niveau »), 05 aperçu mobile (texte minuscule), 06 étape Télécharger avec « PDF enregistré », 07 lettre : corps vide, 08 page 1 du PDF du CV.
