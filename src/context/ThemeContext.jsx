import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'nathalia_tema'

function leerTemaInicial() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch {}
  return 'oscuro'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(leerTemaInicial)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', tema === 'oscuro')
    root.classList.toggle('light', tema === 'claro')
    try {
      localStorage.setItem(STORAGE_KEY, tema)
    } catch {}
  }, [tema])

  const alternar = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))

  return (
    <ThemeContext.Provider value={{ tema, setTema, alternar }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}

export default ThemeProvider