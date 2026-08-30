import { useState, useEffect, useCallback } from 'react'
import {
  cargarContenido,
  suscribirseContenido,
  actualizarCampo,
  guardarContenido,
  esAdmin,
} from '../utils/contenido'

// useEdicion — puente común para editar textos "en el lugar" en cualquier
// página pública (inicio, catálogo, mis pedidos...). Expone:
//   contenido  → el contenido editable actualizado en vivo
//   editar     → editar(ruta, valor): guarda y propaga a toda la tienda
//   esEdicion  → true si hay un admin logueado (muestra los lápices)
export function useEdicion() {
  const [contenido, setContenido] = useState(() => cargarContenido())

  useEffect(() => suscribirseContenido((nuevo) => setContenido(nuevo)), [])

  const esEdicion = esAdmin()

  const editar = useCallback((ruta, valor) => {
    guardarContenido(actualizarCampo(cargarContenido(), ruta, valor))
  }, [])

  return { contenido, editar, esEdicion }
}

export default useEdicion