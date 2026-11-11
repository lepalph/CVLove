// En dev seulement : le runtime de React Refresh (/@react-refresh, importé par chaque .tsx) écrit dans `window` au chargement,
// absent d'un worker. Importé en premier par render.worker.ts ; rien en build (pas de React Refresh).
if (import.meta.env.DEV) (globalThis as { window?: unknown }).window ??= globalThis
