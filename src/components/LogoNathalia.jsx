// LogoNathalia — Identidad de marca Nathalia (moda y belleza).
// Monograma "N" en degradado rosa→dorado + wordmark en serif elegante.
// Se usa en el landing, catálogo, login/register y panel admin.

function MonogramaN({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nathalia-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C77A9C" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#E9CD8A" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#nathalia-grad)" />
      <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      <path
        d="M15 33V15l18 18V15"
        stroke="#FFF9F4"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogoNathalia({ size = 40, showText = true, dark = false, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <MonogramaN size={size} />
      {showText && (
        <span
          className="font-display tracking-tight leading-none"
          style={{
            fontSize: size * 0.55,
            fontWeight: 600,
            color: dark ? '#3A2430' : '#FFF6FA',
          }}
        >
          Nathalia
        </span>
      )}
    </span>
  )
}

export default LogoNathalia
