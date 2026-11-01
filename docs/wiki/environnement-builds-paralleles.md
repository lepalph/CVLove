# Builds parallèles

- Le 2026-11-02, avant `lepalph/CVLove@fd3c8c1`, `pnpm build` écrivait toujours dans `dist/` et `test:e2e` servait `dist/` sur 4173 : deux agents ne pouvaient pas construire ou tester en même temps (consigne de [REPRISE.md](../REPRISE.md)).
- Le 2026-11-02, le chief of staff a ajouté `OUT_DIR` (lu par `vite.config.ts` et `playwright.config.ts`) et `.frozen/` au `.gitignore`. Usage :
  - build figé : `OUT_DIR=.frozen/<nom> pnpm build && pnpm exec vite preview --outDir .frozen/<nom> --port <port> --strictPort`
  - e2e isolés : `OUT_DIR=.frozen/<nom> E2E_PORT=<port> pnpm test:e2e`
- Ports réservés le 2026-11-02 : 4311 vérification, 4312 audit boutons, 4321-4324 panel, 4331-4332 agents de fonctions.
- Voir [Règles des agents](regles-agents.md).
