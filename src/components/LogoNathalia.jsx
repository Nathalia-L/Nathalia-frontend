import { useId } from 'react'
import { cargarContenido } from '../utils/contenido'

// LogoNathalia — Identidad de marca editable.
// El texto (nombre + eslogan), los colores y la forma se toman del contenido
// editable (localStorage) para que el admin pueda cambiar todo desde el panel.
// Formas: anillo (doble anillo dorado), rombo (diamante), flor (pétalos).

function MonogramaN({ forma = 'anillo', colores, size = 44 }) {
  const id = useId()
  const g1 = `${id}-grad`
  const g2 = `${id}-gold`
  const g3 = `${id}-bg`
  const c = { anilloDe: '#E9CD8A', anilloA: '#D4AF37', letra: '#C77A9C', fondoDe: '#3A1E2E', fondoA: '#1A0E13', ...colores }

  const contorno = (
    <linearGradient id={g1} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor={c.anilloDe} />
      <stop offset="45%" stopColor={c.anilloA} />
      <stop offset="100%" stopColor={c.letra} />
    </linearGradient>
  )

  const fondo = (
    <radialGradient id={g3} cx="0.35" cy="0.3" r="1" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor={c.fondoDe} />
      <stop offset="100%" stopColor={c.fondoA} />
    </radialGradient>
  )

  const destello = (
    <linearGradient id={g2} x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor={c.anilloDe} />
      <stop offset="100%" stopColor={c.anilloA} />
    </linearGradient>
  )

  const letraN = (
    <>
      <path
        d="M15.2 33V15l17.6 18V15"
        stroke={`url(#${g1})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15.2 33h4.1" stroke={`url(#${g1})`} strokeWidth="2" strokeLinecap="round" />
    </>
  )

  const chispa = (
    <>
      <path
        d="M38.6 8.6 L39.7 12 L43.1 13.1 L39.7 14.2 L38.6 17.6 L37.5 14.2 L34.1 13.1 L37.5 12 Z"
        fill={`url(#${g2})`}
      />
      <circle cx="12.8" cy="14.5" r="1.15" fill={c.anilloDe} opacity="0.85" />
    </>
  )

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>{contorno}{destello}{fondo}</defs>

      {forma === 'rombo' && (
        <>
          <path d="M24 2.5 L45.5 24 L24 45.5 L2.5 24 Z" fill={`url(#${g3})`} stroke={`url(#${g1})`} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M24 8.5 L39.5 24 L24 39.5 L8.5 24 Z" fill="none" stroke={`url(#${g1})`} strokeWidth="0.6" opacity="0.55" />
          {letraN}
          {chispa}
        </>
      )}

      {forma === 'flor' && (
        <>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="24"
              cy="10.8"
              rx="4.4"
              ry="13.6"
              transform={`rotate(${a} 24 24)`}
              fill={`url(#${g1})`}
              opacity="0.9"
            />
          ))}
          <circle cx="24" cy="24" r="12.5" fill={`url(#${g3})`} stroke={`url(#${g1})`} strokeWidth="0.8" />
          {letraN}
          {chispa}
        </>
      )}

      {forma === 'anillo' && (
        <>
          <circle cx="24" cy="24" r="23" fill={`url(#${g3})`} stroke={`url(#${g1})`} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="20.2" fill="none" stroke={`url(#${g1})`} strokeWidth="0.6" opacity="0.55" />
          {letraN}
          {chispa}
        </>
      )}
    </svg>
  )
}

export function LogoNathalia({
  size = 40,
  showText = true,
  tagline = true,
  dark = false,
  className = '',
  config,
  esEdicion = false,
  onCambiar,
}) {
  const cfg = { nombre: 'Nathalia', eslogan: 'Moda & Belleza', ...(config || cargarContenido().logo) }

  return (
    <span className={`inline-flex items-center ${tagline ? 'gap-2.5' : 'gap-2.5'} ${className}`}>
      <MonogramaN forma={cfg.forma || 'anillo'} colores={cfg} size={size} />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className="font-display tracking-tight text-ink"
            style={{
              fontSize: size * 0.46,
              fontWeight: 650,
              color: dark ? '#3A2430' : undefined,
            }}
          >
            <EditableNombre
              valor={cfg.nombre}
              clave="logo.nombre"
              esEdicion={esEdicion}
              onCambiar={onCambiar}
            />
          </span>
          {tagline && (
            <span
              className="font-sans uppercase tracking-[0.28em] text-gold"
              style={{ fontSize: Math.max(6.5, size * 0.13), fontWeight: 600, marginTop: size * 0.1 }}
            >
              <EditableNombre
                valor={cfg.eslogan}
                clave="logo.eslogan"
                esEdicion={esEdicion}
                onCambiar={onCambiar}
              />
            </span>
          )}
        </span>
      )}
    </span>
  )
}

function EditableNombre({ valor, clave, esEdicion, onCambiar }) {
  if (!esEdicion || !onCambiar) return valor
  return (
    <input
      value={valor}
      onChange={(e) => onCambiar(clave, e.target.value)}
      onBlur={(e) => onCambiar(clave, e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
      className="bg-transparent border-b border-dashed border-accent focus:border-solid focus:outline-none w-auto min-w-[2ch] px-0.5"
      title="Clic para editar el logo"
    />
  )
}

export default LogoNathalia