import type { CVLabels } from '../i18n/labels'
import { isRtl } from '../model/dates'
import type { Design, Lang } from '../model/types'
import { fontFor } from '../pdf/fontPairs'

const MARGIN_FACTOR = { compact: 0.75, normal: 1, large: 1.3 } as const
const RADIUS_FACTOR = { circle: 0.5, rounded: 0.16, square: 0 } as const

/** Design -> valeurs prêtes pour react-pdf. Voir le contrat dans types.ts. */
export function makeTheme({ lang }: { lang: Lang }, design: Design, labels: CVLabels) {
  const rtl = isRtl(lang)
  const body = fontFor(lang, 'body', design.fontPair)
  const head = fontFor(lang, 'head', design.fontPair)
  const s = (n: number) => +(n * design.fontScale).toFixed(2)
  const m = (n: number) => +(n * MARGIN_FACTOR[design.margins]).toFixed(1)
  const pageStyle = (padV: number, padH: number) => ({
    fontFamily: body,
    fontSize: s(9.5),
    lineHeight: lang === 'ar' ? Math.max(design.lineHeight, 1.5) : design.lineHeight, // l'arabe a de grands jambages et des diacritiques
    color: '#1f1b16',
    paddingVertical: m(padV),
    paddingHorizontal: m(padH),
    ...(rtl ? { direction: 'rtl' as const, textAlign: 'right' as const } : {}),
  })
  return {
    lang, rtl, labels, design, accent: design.accent, head, body, s, m,
    row: (rtl ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    start: (rtl ? 'right' : 'left') as 'left' | 'right',
    end: (rtl ? 'left' : 'right') as 'left' | 'right',
    pageProps: { size: design.pageSize } as const,
    pageStyle,
    photo: (size: number) => ({
      width: size, height: size, borderRadius: size * RADIUS_FACTOR[design.photoShape], objectFit: 'cover' as const,
    }),
  }
}
export type Theme = ReturnType<typeof makeTheme>
