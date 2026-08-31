import { useState, useRef, useEffect } from 'react'
import { Pencil, Upload, X, Palette, Ratio } from 'lucide-react'
import { cargarContenido } from '../utils/contenido'
import { useClampAlViewport } from '../utils/useClampAlViewport'
import logoImg from '../assets/logo.png'

const FONDOS_OPCIONES = [
  { id: 'transparente', label: 'Transparente', color: 'transparent', border: true },
  { id: 'negro', label: 'Negro', color: '#000000' },
  { id: 'blanco', label: 'Blanco', color: '#FFFFFF' },
]

// Múltiplos de tamaño del logo (se aplica al tamaño base de cada parte de la tienda).
const TAMANOS = [
  { id: 'pequeno', label: 'Pequeño', mult: 0.8 },
  { id: 'normal', label: 'Normal', mult: 1 },
  { id: 'medio', label: 'Medio', mult: 1.15 },
  { id: 'grande', label: 'Grande', mult: 1.3 },
]

// Colores del logo editables manualmente (color picker) directamente en el lápiz.
const COLORES_LOGO = [
  ['anilloDe', 'Inicio'],
  ['anilloA', 'Fin'],
  ['letra', 'Letra'],
  ['fondoDe', 'Fondo A'],
]

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
  const cfg = { nombre: 'Beauty Esme', eslogan: 'Moda & Belleza', tamano: 'normal', ...(config || cargarContenido().logo) }
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [verColores, setVerColores] = useState(false)
  const menuRef = useRef(null)
  const clampRef = useClampAlViewport(menuAbierto)
  const inputFileRef = useRef(null)

  useEffect(() => {
    if (!menuAbierto) return
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [menuAbierto])

  const multTamanho = (TAMANOS.find((t) => t.id === cfg.tamano) || TAMANOS[1]).mult
  const imagenSrc = cfg.imagen || logoImg
  // El tamaño efectivo aplica el control de tamaño del logo (válido en toda la
  // tienda, tanto para el admin como para los visitantes).
  const tamanoEfectivo = size * multTamanho

  const fondoStyle = (() => {
    if (cfg.fondo === 'negro') return { backgroundColor: '#000000' }
    if (cfg.fondo === 'blanco') return { backgroundColor: '#FFFFFF' }
    return {}
  })()

  const subirImagen = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return
    if (archivo.size > 3 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => {
      onCambiar('logo.imagen', reader.result)
      setMenuAbierto(false)
    }
    reader.readAsDataURL(archivo)
    e.target.value = ''
  }

  return (
    <span className={`inline-flex items-center ${tagline ? 'gap-2.5' : 'gap-2.5'} ${className}`}>
      <span className="relative shrink-0" style={{ width: tamanoEfectivo, height: tamanoEfectivo }}>
        <img
          src={imagenSrc}
          alt="Beauty Esme"
          width={tamanoEfectivo}
          height={tamanoEfectivo}
          style={{ width: tamanoEfectivo, height: tamanoEfectivo, objectFit: 'contain', ...fondoStyle, borderRadius: 6 }}
          className="shrink-0 select-none"
          draggable="false"
        />

        {esEdicion && onCambiar && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuAbierto((a) => !a) }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/80 transition shadow-md"
              title="Personalizar logo"
              aria-label="Personalizar logo"
            >
              <Pencil size={10} />
            </button>

            {menuAbierto && (
              <div
                ref={(n) => { menuRef.current = n; clampRef.current = n }}
                className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-line p-3 z-50"
              >
                <p className="text-[9px] uppercase tracking-wider text-ink-3 font-semibold mb-2 flex items-center gap-1">
                  <Ratio size={9} /> Tamaño del logo
                </p>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {TAMANOS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onCambiar('logo.tamano', t.id)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition ${
                        (cfg.tamano || 'normal') === t.id
                          ? 'border-accent bg-accent/10'
                          : 'border-line bg-surface hover:border-accent'
                      }`}
                      title={`Logo ${t.label}`}
                    >
                      <span
                        className="rounded bg-accent/80"
                        style={{ width: 8 * t.mult, height: 8 * t.mult }}
                      />
                      <span className={`text-[8px] font-medium ${(cfg.tamano || 'normal') === t.id ? 'text-accent' : 'text-ink-2'}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[9px] uppercase tracking-wider text-ink-3 font-semibold mb-2 flex items-center gap-1">
                  <Palette size={9} /> Fondo del logo
                </p>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {FONDOS_OPCIONES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { onCambiar('logo.fondo', f.id); setMenuAbierto(false) }}
                      className={`flex flex-col items-center gap-1 rounded-lg border py-1.5 transition ${
                        cfg.fondo === f.id
                          ? 'border-accent bg-accent/10'
                          : 'border-line bg-surface hover:border-accent'
                      }`}
                      title={`Fondo ${f.label}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md border ${
                          cfg.fondo === f.id ? 'border-accent' : 'border-ink/20'
                        }`}
                        style={{ backgroundColor: f.color, ...(f.border ? { backgroundImage: 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)', backgroundSize: '7px 7px', backgroundPosition: '0 0, 3.5px 3.5px' } : {}) }}
                      />
                      <span className={`text-[9px] font-medium ${cfg.fondo === f.id ? 'text-accent' : 'text-ink-2'}`}>
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-line pt-2">
                  <p className="text-[9px] uppercase tracking-wider text-ink-3 font-semibold mb-1.5">
                    Imagen del logo
                  </p>
                  <button
                    type="button"
                    onClick={() => inputFileRef.current?.click()}
                    className="w-full h-8 rounded-lg text-[11px] font-semibold bg-accent text-white hover:bg-accent/85 transition flex items-center justify-center gap-1.5"
                  >
                    <Upload size={11} /> {cfg.imagen ? 'Cambiar imagen' : 'Subir imagen'}
                  </button>
                  {cfg.imagen && (
                    <button
                      type="button"
                      onClick={() => { onCambiar('logo.imagen', ''); setMenuAbierto(false) }}
                      className="w-full h-7 mt-1 rounded-lg text-[10px] font-medium text-ink-3 hover:bg-error/10 hover:text-error transition flex items-center justify-center gap-1.5"
                    >
                      <X size={10} /> Quitar y volver al logo por defecto
                    </button>
                  )}
                  <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={subirImagen} />
                </div>

                <div className="border-t border-line pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setVerColores((v) => !v)}
                    className="w-full h-8 rounded-lg border border-line text-[10px] font-medium text-ink-3 hover:text-accent hover:border-accent transition flex items-center justify-center gap-1.5"
                  >
                    <Palette size={10} /> {verColores ? 'Ocultar colores' : 'Elegir colores a mano'}
                  </button>
                  {verColores && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
                      {COLORES_LOGO.map(([clave, label]) => (
                        <label key={clave} className="flex items-center justify-between gap-1.5 cursor-pointer">
                          <span className="text-[9px] text-ink-2">{label}</span>
                          <input
                            type="color"
                            value={cfg[clave] || '#000000'}
                            onChange={(e) => onCambiar(`logo.${clave}`, e.target.value)}
                            className="w-7 h-7 rounded-md border border-line cursor-pointer bg-transparent p-0.5"
                            title={`Color ${label}`}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </span>

      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className="font-display tracking-tight text-ink"
            style={{
              fontSize: tamanoEfectivo * 0.46,
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
              style={{ fontSize: Math.max(6.5, tamanoEfectivo * 0.13), fontWeight: 600, marginTop: tamanoEfectivo * 0.1 }}
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

