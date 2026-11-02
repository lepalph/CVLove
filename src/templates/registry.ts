import type { LayoutMeta, LayoutModule, TemplateDef } from './types'

/** Construit les modèles à partir des résultats de `import.meta.glob` (métadonnées et chargeurs, mêmes clés). */
export function buildTemplates(metas: Record<string, LayoutMeta>, loaders: Record<string, () => Promise<LayoutModule>>): TemplateDef[] {
  return Object.entries(metas)
    .sort(([, a], [, b]) => a.order - b.order)
    .flatMap(([path, m]) =>
      m.styles.map((s, i): TemplateDef => ({
        id: `${m.id}-${i + 1}`, layoutId: m.id, layoutName: m.name, styleName: s.name, styleNo: (i + 1) as 1 | 2 | 3, category: m.category,
        columns: m.columns, photo: m.photo, apart: m.apart, variant: s.variant, preset: s.preset, load: loaders[path],
      })),
    )
}
