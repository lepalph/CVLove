# Reprise du travail (état au 2 novembre 2026)

Note pour reprendre CVLove sur un autre poste ou dans une nouvelle session Claude. À lire avec `SPEC.md` et `CONTRIBUTING.md`.

## Contexte

**Le projet.** CVLove est un générateur de CV gratuit et open source, sans serveur et sans compte. Tout reste dans le navigateur (`localStorage`). Le PDF est généré côté client avec react-pdf et affiché avec pdf.js. Il existe 36 modèles, 7 langues (dont l'arabe, écrit de droite à gauche) et une lettre de motivation assortie au CV. Pile : React 19, Vite 8, Tailwind 4, zustand 5, TypeScript, pnpm 12. Tests : Vitest, Playwright et `check:pdf`. Déploiement sur Vercel à chaque push sur `main`.

**Ce qui a été demandé dans la session du 30 octobre au 2 novembre 2026** (demandes de l'auteur, dans l'ordre) :
1. « Déployé, on a les fichiers de tout le monde en commun, le système de documents local ne marche pas. » Diagnostic : rien n'est partagé (aucun serveur). C'est le CV vierge recréé d'office, identique pour tout le monde, qui faisait illusion.
2. Montrer une photo dans les modèles « avec photo ».
3. À la fin du formulaire, un seul bouton « Ajouter une section » au lieu des boutons pour des sections déjà présentes.
4. Affichage des niveaux en « Texte » : rien ne s'affichait.
5. Pouvoir enregistrer ou supprimer le CV créé d'office, et rendre l'export et l'import JSON visibles (ils étaient cachés en bas de page).
6. Voir les pages suivantes de l'aperçu quand le CV en a plusieurs.
7. À l'import : choisir entre écraser le document en cours et en créer un nouveau.
8. Un audit complet (normes des sites du même genre et logique), puis les corrections, puis un second audit.
9. Pour plus tard : davantage de CV créatifs, et un MCP pour que Claude utilise le site pour générer des CV rapidement.

**Décisions prises et pourquoi**
- *Enregistrement automatique plutôt qu'un bouton « Enregistrer ».* L'auteur avait d'abord choisi le bouton manuel. Trois audits indépendants ont mesuré des pertes de saisie : sur mobile quand l'onglet est déchargé, sur iOS qui n'avertit jamais à la fermeture, et avec plusieurs onglets. Le vrai besoin, ne plus avoir de CV fantôme impossible à supprimer, est couvert autrement : un CV vierge n'est ni listé ni enregistré, et tout se supprime. L'auteur a validé ce changement.
- *Import : « Ajouter » proposé par défaut*, parce qu'il ne fait rien perdre. « Remplacer » n'est proposé que si le fichier contient un seul document du même type et que le document en cours n'est pas vide.
- *Photo importée : on refuse tout ce qu'on ne sait pas lire*, plutôt que de tout accepter. Un PNG forgé de 54 caractères figeait le décodeur de react-pdf. Les photos ajoutées depuis l'éditeur sont toujours ré-encodées en JPEG et passent donc sans souci.
- *Le site reste 100 % local* : aucun compte, aucun backend. Des comptes iraient contre la promesse « Everything stays on your device » du README.

**Environnement de l'auteur.** Ubuntu 24.04 sous WSL2, zsh, projets dans `~/code`. Compte `gh` actif : `palphconsultant`. Le dépôt appartient à `lepalph` : préfixer les commandes `gh` par `GH_TOKEN=$(gh auth token --user lepalph)`. Réponses en français, concises.

## Où on en est

- Branche **`fix/sections-niveaux-photo`**, poussée sur GitHub. **PR #1 ouverte, pas encore mergée** : https://github.com/lepalph/CVLove/pull/1
- Le site en ligne (https://cv-love-topaz.vercel.app) tourne encore sur `main`, sans ces changements. Il faut merger la PR pour les mettre en ligne.
- Dernière vérification complète, avant le commit `000aef6` : `pnpm build` OK, `pnpm test` 119/119, `pnpm test:e2e` 51/51, `pnpm check:pdf` 499/499 (lecture ATS comprise).

## Remettre en route sur un autre poste

```sh
GH_TOKEN=$(gh auth token --user lepalph) gh repo clone lepalph/CVLove ~/code/cvlove   # dépôt privé de lepalph
cd ~/code/cvlove && git checkout fix/sections-niveaux-photo
pnpm install
pnpm exec playwright install chromium-headless-shell   # requis par pnpm test:e2e
pnpm dev
```

## Ce que contient la PR #1 (3 commits)

1. **Corrections demandées.** Les niveaux en mode « Texte » s'affichent toujours. En mode complet, un seul bouton « Ajouter une section » ne propose que les types absents. Les vignettes des modèles « avec photo » montrent une silhouette (`src/ui/samplePhoto.ts`).
2. **Documents.**
   - Contexte : en prod, les gens voyaient un « CV sans titre » qui semblait partagé et impossible à supprimer. Il n'y a aucun serveur : c'était le CV vierge recréé d'office dans chaque navigateur.
   - Un CV s'enregistre automatiquement dès sa première saisie, photo ou choix de design. Un CV vierge (`draft: true`, voir `isBlankDraft` dans `src/store.ts`) n'est ni listé, ni exporté, ni écrit dans `localStorage`. Tout document est supprimable.
   - Le bouton « Enregistrer » manuel a été essayé puis retiré : il perdait des saisies sur mobile, sur iOS et avec plusieurs onglets ouverts (trois audits l'ont constaté).
   - Menu **Fichier** dans l'en-tête de l'éditeur (export et import JSON). L'import propose « Ajouter comme nouveau document » (par défaut), « Remplacer » ou « Annuler ».
   - Plusieurs onglets : relecture sur l'événement `storage`. Chaque document garde sa version la plus récente, et chaque onglet garde le document qu'il a ouvert (voir `merge` et `sync` dans `src/store.ts`). Limite connue, commentée `shortcut:` dans le code : deux onglets qui écrivent à moins de 500 ms d'écart peuvent perdre un document neuf.
   - Un CV ou une lettre vide ne se télécharge plus en PDF blanc. Un CV vierge suit la langue de l'interface. Depuis l'accueil, « Créer mon CV » crée un nouveau CV si le CV en cours est rempli. Bouton « Effacer toutes mes données » dans Mes documents.
3. **Corrections de deux tours d'audit** (UX, accessibilité, sécurité, performance, revue de code).
   - **Performance.** File de rendu des vignettes, debounce des couleurs et cache LRU dans `src/ui/SamplePage.tsx`. Polices préchargées par famille dans `src/pdf/render.tsx`. Clic sur une couleur : 16 s → 1,7 s ; catalogue de l'accueil : 60 s → 13,8 s (CPU ×4).
   - **Accessibilité.** Annonces aux lecteurs d'écran, focus rendu après chaque action, pas de défilement horizontal à 320 px, cibles de 44 px, contraste forcé, `autocomplete`.
   - **Sécurité.** Une photo importée doit être un PNG ou un JPEG bien formé de 4000 px de côté au plus (`imageSize` et `cleanPhoto` dans `src/model/sanitize.ts`). Le texte importé est plafonné à 300 000 caractères. Liens `mailto:` validés. `minimumReleaseAge: 4320`.

## Reste à faire, par priorité

**Court terme (petits efforts)**
- Un exemple chargé (« Remplir avec un exemple ») est enregistré et listé comme un vrai CV.
- Aucun indicateur « Enregistré », et pas de `navigator.storage.persist()` : Safari iOS peut purger le stockage après 7 jours sans visite. Attention, sous Firefox `persist()` affiche une demande d'autorisation.
- Une lettre vide ne suit pas la langue de l'interface. L'alerte « document vide » n'est pas retraduite quand on change de langue.
- Accessibilité mineure : les messages pourraient passer par des régions live persistantes ; l'échec du PDF est annoncé deux fois ; rien ne signale « exemple » aux lecteurs d'écran ; en allemand, la barre de l'éditeur dépasse de 5 px à 401 px de large.

**Lot 2 (planifié, efforts M à L)**
- Annuler une suppression : aujourd'hui un « × » efface une section entière sans confirmation.
- Niveaux : CECRL pour les langues (A1 à C2, natif), un niveau par compétence.
- Mode complet trop long : replier le Design, éléments en accordéon.
- Recadrage de la photo, et un avertissement quand le modèle ne l'affiche pas.
- Mes documents : tri par date, état vide, noms « CV » et « Lettre » traduits.
- Page « Mentions et confidentialité » (exigée par la LCEN) : éditeur, hébergeur Vercel, journaux d'accès, localStorage.
- Performance :
  - l'aperçu de l'éditeur génère un PDF à chaque pause de frappe, sur le fil principal (à sérialiser, puis à passer dans un Web Worker) ;
  - le PDF de démonstration de l'accueil est lourd ;
  - les vignettes pourraient être pré-rendues en WebP au build ;
  - les polices pourraient être allégées en sous-ensembles ;
  - les routes pourraient être chargées à la demande (`React.lazy`).
- Sections manquantes (certifications, bénévolat, publications…), `dir="auto"` sur les champs de saisie.

**Projets demandés pour la suite**
- Plus de modèles de CV créatifs (mises en page dans `src/templates/layouts/`, voir `CONTRIBUTING.md`).
- **Un serveur MCP** pour que Claude puisse générer des CV avec le site. Le site n'a pas de serveur, donc il faut d'abord choisir l'architecture : un MCP local qui rend le PDF avec le même code, ou un lien qui ouvre le site avec le CV pré-rempli. À cadrer avec `grilling` avant d'écrire du code.

## Méthode de travail retenue

- Les sous-agents se lancent en **Sonnet** (jugement : audit, revue) ou en **Haiku** (tâches mécaniques), jamais avec le modèle principal.
- Quand plusieurs agents modifient le code en parallèle, chacun reçoit des fichiers disjoints. Les agents ne lancent ni `pnpm build` ni `pnpm test:e2e` : les deux partagent `dist/` et le port 4173.
- Commits en Conventional Commits, en français, et seulement à la demande.
