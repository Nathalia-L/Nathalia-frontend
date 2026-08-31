import { useLayoutEffect, useRef } from 'react'

// Mantiene un elemento desplegable dentro de los límites de la pantalla.
// Al abrirse ajusta su posición (top/left/right/translate) para que NUNCA se
// salga por los bordes izquierdo/derecho ni por abajo, incluso en celular.
export function useClampAlViewport(abierto, margen = 8) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!abierto || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const est = el.style

    // Movimientos horizontales: corregir translateX centrado y overflow por izquierda/derecha.
    if (rect.left < margen) {
      const delta = margen - rect.left
      const t = est.transform || ''
      if (t.includes('translateX(-50%)')) {
        est.transform = t.replace('translateX(-50%)', `translateX(-${50 + (delta / el.offsetWidth) * 100}%)`)
      } else if (/translateX\(-/.test(t)) {
        est.transform = t.replace(/translateX\(-[^)]*\)/, `translateX(${-delta}px)`)
      } else {
        est.transform = `${t} translateX(${delta}px)`
      }
    } else if (rect.right > vw - margen) {
      const delta = rect.right - (vw - margen)
      const t = est.transform || ''
      if (t.includes('translateX(-50%)')) {
        est.transform = t.replace('translateX(-50%)', `translateX(-${50 - (delta / el.offsetWidth) * 100}%)`)
      } else if (/translateX\(-/.test(t)) {
        // no cambiar si ya está desplazado a la izquierda (se asume corregido antes)
      } else {
        est.transform = `${t} translateX(${-delta}px)`
      }
    }

    // Vertical: si se sale por abajo, anclarlo hacia arriba (el panel crece hacia arriba).
    const rectAjustado = el.getBoundingClientRect()
    if (rectAjustado.bottom > vh - margen) {
      est.top = 'auto'
      est.bottom = 'calc(100% + 8px)'
    }
  }, [abierto, margen])

  return ref
}
