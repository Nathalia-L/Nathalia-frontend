// Sincronización del contenido de la tienda con el backend (PostgreSQL).
// - Al abrir la tienda, cualquier visitante descarga el contenido guardado
//   (productos, imágenes, textos, logo, colores) para que todos vean lo mismo.
// - Cuando el admin edita, se sube automáticamente (con retraso/debounce) y se
//   le avisa con un toast si el guardado en línea funcionó o falló.

import toast from 'react-hot-toast'
import { API_URL } from '../config'
import { cargarContenido, guardarContenido, esAdmin } from './contenido'

const RUTA = `${API_URL}/api/tienda/contenido`

// Última versión remota conocida (serializada) para no subir ni bajar de más.
let ultimoRemoto = null
let ultimaEscrituraLocal = 0
let timer = null

function autorizacion() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function esPersonalizado() {
  try { return !!localStorage.getItem('nathalia_contenido') } catch { return false }
}

export async function obtenerContenidoServidor() {
  try {
    const res = await fetch(RUTA, { headers: autorizacion() })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

export async function guardarContenidoServidor(contenido) {
  try {
    const res = await fetch(RUTA, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...autorizacion() },
      body: JSON.stringify({ contenido }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Descarga el contenido guardado en la base de datos y lo aplica en el
// navegador. Se llama al cargar la app y cuando la ventana vuelve al foco.
// No pisa cambios locales recientes ni contenido ya personalizado (para no
// borrar los productos que el admin acaba de crear si el servidor falló).
export async function sincronizarDesdeServidor() {
  if (Date.now() - ultimaEscrituraLocal < 4000) return
  if (esPersonalizado()) return
  const remoto = await obtenerContenidoServidor()
  if (!remoto) return
  const serializadoRemoto = JSON.stringify(remoto)
  if (serializadoRemoto === ultimoRemoto) return
  ultimoRemoto = serializadoRemoto
  const local = cargarContenido()
  if (JSON.stringify(local) !== serializadoRemoto) {
    guardarContenido(remoto)
  }
}

// Programa (en caliente) la subida del contenido cuando el admin edita.
// Solo se ejecuta si hay un cambio real y el usuario es administrador.
export function programarSubidaContenido() {
  if (!esAdmin()) return
  ultimaEscrituraLocal = Date.now()
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const contenido = cargarContenido()
    const serializado = JSON.stringify(contenido)
    if (serializado === ultimoRemoto) return
    const ok = await guardarContenidoServidor(contenido)
    if (ok) {
      ultimoRemoto = serializado
      toast.success('Tienda actualizada en línea ✓', { id: 'sync-ok' })
    } else {
      toast.error('No se pudo guardar en línea: revisa que el servidor esté encendido', { id: 'sync-error' })
    }
  }, 1500)
}