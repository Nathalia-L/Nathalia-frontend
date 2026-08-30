// URL pública del backend de Nathalia.
// - En local (`npm run dev`) el front usa SOLO http://localhost:3000, así nunca
//   se rompe al trabajar en tu máquina.
// - En producción (Vercel) usa la constante de abajo. ✏️ PEGA AQUÍ la URL real
//   de tu backend en Railway (ej: 'https://nathalia-backend.up.railway.app').
// Opción alternativa: define VITE_API_URL en el panel de Vercel
// (Project → Settings → Environment Variables) y se usa antes que esta línea.
const URL_BACKEND_PRODUCCION = 'https://nathalia-backend-production.up.railway.app'

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : URL_BACKEND_PRODUCCION)
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin)