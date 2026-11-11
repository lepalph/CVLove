# Règles des agents

Décidé le 2026-11-02 (consignes de l'auteur dans le lancement du chantier, et [REPRISE.md](../REPRISE.md)).

- Sous-agents en Sonnet (jugement, code) ou Haiku (mécanique), jamais Opus.
- Un agent qui modifie le code travaille dans un worktree git isolé, ou sur des fichiers disjoints de ceux des autres.
- Chaque agent construit dans son `.frozen/<nom>` et sert sur son port : voir [Builds parallèles](environnement-builds-paralleles.md).
- Front : skill `ui-ux-director` d'abord (règles d'or pour une retouche). Tests d'abord (`test-driven-development`). Textes d'interface : `humanizer`, et les 7 langues (fr, en, de, es, it, pt, ar) pour chaque nouveau libellé, dans un fichier `src/i18n/*.ts` propre à la fonction pour éviter les conflits.
- Seul le chief of staff commit, sur `fix/sections-niveaux-photo`, en Conventional Commits français. Pas de push, de merge ni de déploiement sans l'auteur. Dépôt privé.
- L'auteur dort (nuit du 2 au 3 novembre 2026) : aucune question bloquante, décisions consignées ici.
- Ajouté le 2026-11-02 : un agent n'arrête que ses propres serveurs, par port (`lsof -ti:<port> | xargs kill`), jamais `pkill -f 'vite preview'` (ça a coupé le serveur du panel sur 4321).
- Ajouté le 2026-11-02 : les worktrees d'agents peuvent partir de `main` ; le brief demande `git log -1` et un recalage sur le sha voulu.

## Nuit du 11 au 12 novembre 2026 (autopilote)
Consignes de l'auteur le 2026-11-11 : plusieurs agents, ne pas se bloquer sur les garde-fous ; Sonnet pour le code simple, Opus pour orchestrer et planifier, Haiku pour lire et faire un compte rendu.
- Chaque agent de code travaille dans son worktree, le recale sur le sha donné dans son brief (`git reset --hard <sha>`), fait `pnpm install --frozen-lockfile --prefer-offline`, puis **commit dans son worktree** (Conventional Commits français, lignes d'attribution de la session). Le chief of staff reprend ces commits par `cherry-pick` sur `fix/sections-niveaux-photo`, relance la suite complète, puis pousse la branche. Ces règles remplacent « seul le chief of staff commit » et « pas de push » pour cette nuit uniquement.
- Restent interdits sans l'auteur : fusionner dans `main`, déployer, rendre le dépôt public, ajouter une dépendance sans justification écrite ici.
- Mac de 8 Go : un agent ne lance que les specs e2e qu'il touche, avec `--workers=2`. Le chief of staff est le seul à lancer la suite complète.
- Ports de la nuit : 4401 à 4409, un par agent, donné dans le brief.
- Rapport d'agent : 8 lignes au plus (sha des commits, tests lancés et résultat, ce qui n'est pas vérifié). Le détail va dans la page du wiki de l'agent.
