import { useStore } from '../store/useStore.js'
import { accentValue, luminance } from '../lib/accent.js'
import { seasonAccent } from '../lib/seasonal.js'
import { SeasonDeco } from './Seasonal.jsx'

/**
 * ScreenBanner: Banner compacto reutilizable para pantallas secundarias
 * (Plan, Progreso/Stats, Ejercicios/Library, Ajustes/Settings).
 *
 * Mantiene la misma estética deportiva reactiva al color de acento
 * (y contraste titanio/plata para el acento negro) que el banner de Inicio,
 * pero en un formato bajo y compacto sin logo.
 */
export default function ScreenBanner({
  title,
  subtitle = null,
  actions = null,
  back = null,
  seasonSpot = null,
  className = '',
  children = null,
}) {
  const S = useStore(s => s.S)
  const activeAccent = seasonAccent(S) || accentValue(S)
  const isDarkAccent = activeAccent === 'black' || (typeof activeAccent === 'string' && activeAccent.startsWith('#') && luminance(activeAccent) < 0.12)

  return (
    <div className={'screen-banner' + (isDarkAccent ? ' is-dark-accent' : '') + (className ? ' ' + className : '')}>
      {seasonSpot && <SeasonDeco spot={seasonSpot} />}
      <div className="screen-banner-glow" aria-hidden="true" />
      <div className="screen-banner-inner">
        {back && <div className="screen-banner-back-row">{back}</div>}
        <div className="screen-banner-main">
          <div className="screen-banner-titles">
            <h1 className="screen-banner-title">{title}</h1>
            {subtitle && <div className="screen-banner-sub">{subtitle}</div>}
          </div>
          {actions && <div className="screen-banner-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
