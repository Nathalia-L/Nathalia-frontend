import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle({ className = '', size = 18 }) {
  const { tema, alternar } = useTheme()
  const esOscuro = tema === 'oscuro'

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={esOscuro ? 'Tema claro' : 'Tema oscuro'}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full border border-line bg-elevated px-3 py-2 text-ink-2 hover:text-ink hover:border-accent transition-all duration-300 ${className}`}
    >
      <span className="relative flex items-center justify-center overflow-hidden">
        <Sun
          size={size}
          className={`text-gold transition-all duration-500 ${esOscuro ? 'opacity-0 -rotate-90 scale-50 absolute' : 'opacity-100 rotate-0 scale-100'}`}
        />
        <Moon
          size={size}
          className={`text-accent-soft transition-all duration-500 ${esOscuro ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50 absolute'}`}
        />
      </span>
      <span className="text-xs font-semibold hidden sm:inline">{esOscuro ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

export default ThemeToggle