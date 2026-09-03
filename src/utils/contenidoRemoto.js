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
let reintentosSubida = 0
let sincronizando = false

function autorizacion() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
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
    return { ok: res.ok, status: res.status, network: false }
  } catch {
    return { ok: false, status: 0, network: true }
  }
}

// Descarga el contenido guardado en la base de datos y lo aplica en el
// navegador. Se llama al cargar la app, al volver al foco y periódicamente.
// Para los visitantes (rol usuario) SIEMPRE se toma la versión del servidor,
// sin importar si hay contenido guardado en su navegador: así ven los cambios
// del admin casi al instante. Solo al admin se le respeta un pequeño margen
// mientras acaba de guardar, para no pisarle su edición.
export async function sincronizarDesdeServidor() {
  if (sincronizando) return
  if (esAdmin() && Date.now() - ultimaEscrituraLocal < 4000) return
  sincronizando = true
  try {
    const remoto = await obtenerContenidoServidor()
    if (!remoto) return
    const serializadoRemoto = JSON.stringify(remoto)
    if (serializadoRemoto === ultimoRemoto) return
    ultimoRemoto = serializadoRemoto
    const local = cargarContenido()
    if (JSON.stringify(local) !== serializadoRemoto) {
      // Descarga en segundo plano: se aplica en el navegador y se marca "pasivo"
      // para que no se re-subió ni se muestre el aviso "Tienda actualizada".
      guardarContenido(remoto, { pasivo: true })
    }
  } finally {
    sincronizando = false
  }
}

// Programa (en caliente) la subida del contenido cuando el admin edita.
// Solo se ejecuta si hay un cambio real y el usuario es administrador.
function subirContenido() {
  const contenido = cargarContenido()
  const serializado = JSON.stringify(contenido)
  if (serializado === ultimoRemoto) return
  guardarContenidoServidor(contenido).then((res) => {
    if (res.ok) {
      ultimoRemoto = serializado
      reintentosSubida = 0
      toast.success('Tienda actualizada en línea ✓', { id: 'sync-ok' })
      return
    }
    // Sesión expirada o token inválido: no molestar al usuario, simplemente
    // reintentar en silencio (el contenido queda guardado localmente).
    if (!res.network && (res.status === 401 || res.status === 403)) {
      reintentosSubida = 0
      timer = setTimeout(subirContenido, 6000)
      return
    }
    // Imágenes demasiado pesadas para la nube.
    if (res.status === 413) {
      reintentosSubida = 0
      toast.error('Las imágenes pesan mucho para la nube: sube fotos más livianas (máx 2 MB) o usa un enlace', { id: 'sync-error', duration: 6000 })
      return
    }
    // Falla temporal (servidor dormido, red): reintentar un par de veces.
    if (reintentosSubida < 2) {
      reintentosSubida += 1
      timer = setTimeout(subirContenido, 6000)
      toast.loading('Reintentando guardar en línea…', { id: 'sync-retry', duration: 1000 })
      return
    }
    reintentosSubida = 0
    toast.error(
      res.network
        ? 'Sin conexión con el servidor: los cambios quedaron guardados en este dispositivo'
        : `No se pudo guardar en el servidor (error ${res.status})`,
      { id: 'sync-error', duration: 6000 }
    )
  })
}

export function programarSubidaContenido() {
  if (!esAdmin()) return
  ultimaEscrituraLocal = Date.now()
  clearTimeout(timer)
  timer = setTimeout(subirContenido, 1500)
}