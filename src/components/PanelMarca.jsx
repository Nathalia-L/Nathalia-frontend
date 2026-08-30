import { useState, useEffect } from 'react'
import { Camera, Dices, Wand2, RotateCcw, Pencil, Palette, Lightbulb, Type, Sparkles } from 'lucide-react'
import {
  cargarContenido,
  guardarContenido,
  suscribirseContenido,
  actualizarCampo,
  esAdmin,
  ESTILOS_DESTACADOS,
  FORMAS_DESTACADOS,
} from '../utils/contenido'
import CONTENIDO_DEFAULT from '../utils/contenido'
import { aplicarTema, restaurarTema } from '../utils/tema'
import { PALETAS, generarDiseñoAleatorio, generarPaletaAleatoria } from '../utils/paletas'
import { FUENTES } from '../utils/fuentes'
import LogoNathalia from './LogoNathalia'
import SelectorImagen from './SelectorImagen'

// PanelMarca — Contenido del lápiz de edición de la marca: portada (imagen),
// logo (nombre, eslogan, forma, colores), colores de marca (más de 3) e ideas
// aleatorias. Se muestra anclado al elemento que se edita (nada flotante).

const CAMPOS_LOGO = [
  ['anilloDe', 'Ornamento inicio'],
  ['anilloA', 'Ornamento fin'],
  ['letra', 'Letra N'],
  ['fondoDe', 'Fondo inicio'],
  ['fondoA', 'Fondo fin'],
]

const CAMPOS_TEMA = [
  ['rose', 'Color principal'],
  ['roseStrong', 'Principal oscuro'],
  ['roseSoft', 'Principal suave'],
  ['roseLight', 'Principal claro'],
  ['blush', 'Fondo de caricias'],
  ['gold', 'Dorado principal'],
  ['goldLight', 'Dorado claro'],
  ['extra1', 'Acento extra 1'],
  ['extra2', 'Acento extra 2'],
  ['extra3', 'Acento extra 3'],
  ['extra4', 'Acento extra 4'],
]

const FORMAS = [
  ['anillo', 'Anillo'],
  ['rombo', 'Rombo'],
  ['flor', 'Flor'],
]

function SelectorColor({ label, valor, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer">
      <span className="text-[11px] text-ink-2">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="text-[10px] text-ink-3 font-mono">{valor}</span>
        <input
          type="color"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded-md border border-line cursor-pointer bg-transparent p-0.5"
        />
      </span>
    </label>
  )
}

function TiraColores({ colors }) {
  const lista = Object.values(colors || {})
  return (
    <span className="flex h-3.5 w-full overflow-hidden rounded-full ring-1 ring-ink/10">
      {lista.slice(0, 7).map((c, i) => (
        <span key={i} className="flex-1" style={{ background: c }} />
      ))}
    </span>
  )
}

function CampoTexto({ label, valor, ruta, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-ink-3">{label}</span>
      <input
        value={valor}
        onChange={(e) => onChange(ruta, e.target.value)}
        className="input text-sm w-full mt-0.5"
      />
    </label>
  )
}

export default function PanelMarca({ className = '' }) {
  const [contenido, setContenido] = useState(() => cargarContenido())

  useEffect(() => suscribirseContenido((nuevo) => setContenido(nuevo)), [])

  if (!esAdmin()) return null

  const aplicarNuevo = (nuevo) => {
    setContenido(nuevo)
    guardarContenido(nuevo)
    aplicarTema(nuevo.tema)
  }

  const cambiar = (ruta, valor) => {
    aplicarNuevo(actualizarCampo(contenido, ruta, valor))
  }

  const ideasAleatorias = () => {
    const d = generarDiseñoAleatorio()
    aplicarNuevo({
      ...contenido,
      tema: { ...contenido.tema, ...d.tema },
      logo: { ...contenido.logo, ...d.logo },
    })
  }

  const coloresAleatorios = () => {
    const d = generarPaletaAleatoria()
    aplicarNuevo({ ...contenido, tema: { ...contenido.tema, ...d.tema } })
  }

  const restaurar = () => {
    const nuevo = { ...contenido, tema: { ...CONTENIDO_DEFAULT.tema }, logo: { ...CONTENIDO_DEFAULT.logo } }
    setContenido(nuevo)
    guardarContenido(nuevo)
    restaurarTema()
  }

  const sorpresaTotal = () => {
    const d = generarDiseñoAleatorio()
    const fuente = FUENTES[Math.floor(Math.random() * FUENTES.length)]
    const estilo = ESTILOS_DESTACADOS[Math.floor(Math.random() * ESTILOS_DESTACADOS.length)].id
    const forma = FORMAS_DESTACADOS[Math.floor(Math.random() * FORMAS_DESTACADOS.length)].id
    aplicarNuevo({
      ...contenido,
      tema: { ...contenido.tema, ...d.tema, fuente: fuente.id },
      logo: { ...contenido.logo, ...d.logo },
      destacadosEstilo: estilo,
      destacadosForma: forma,
    })
  }

  return (
    <div className={className}>
      <section>
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold font-semibold">
          <Camera size={11} /> Portada
        </p>
        <div className="mt-1.5">
          <SelectorImagen
            label="Imagen de portada"
            valor={contenido.banner}
            onCambiar={(v) => cambiar('banner', v)}
          />
        </div>
      </section>

      <section className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent font-semibold">
          <Pencil size={11} /> Logo
        </p>
        <div className="flex items-center gap-3 card p-2 bg-blush/40 rounded-xl">
          <LogoNathalia size={44} config={contenido.logo} showText={false} />
          <p className="text-[10px] text-ink-2 leading-tight">
            Nombre y eslogan también se editan con clic directo sobre el texto del logo.
          </p>
        </div>
        <fieldset className="grid grid-cols-2 gap-2">
          <CampoTexto label="Nombre" valor={contenido.logo.nombre} ruta="logo.nombre" onChange={cambiar} />
          <CampoTexto label="Eslogan" valor={contenido.logo.eslogan} ruta="logo.eslogan" onChange={cambiar} />
        </fieldset>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-ink-3">Forma</span>
          <div className="flex gap-1 mt-1">
            {FORMAS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => cambiar('logo.forma', id)}
                className={`px-2.5 h-7 rounded-full text-xs font-medium transition border ${
                  (contenido.logo.forma || 'anillo') === id
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface text-ink-2 border-line hover:border-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {CAMPOS_LOGO.map(([clave, label]) => (
          <SelectorColor
            key={clave}
            label={label}
            valor={contenido.logo[clave]}
            onChange={(v) => cambiar(`logo.${clave}`, v)}
          />
        ))}
      </section>

      <section className="space-y-1.5 pt-2 border-t border-line">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent font-semibold">
          <Type size={11} /> Tipo de letra (todo el sitio)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FUENTES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => cambiar('tema.fuente', f.id)}
              className={`h-7 px-2.5 rounded-full text-[11px] transition border ${
                (contenido.tema.fuente || 'nathalia') === f.id
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface text-ink-2 border-line hover:border-accent'
              }`}
              title={`${f.display} / ${f.texto}`}
            >
              {f.emoji} {f.nombre}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-3">Se aplica en vivo a títulos y textos de toda la tienda.</p>
      </section>

      <section className="space-y-1.5 pt-2 border-t border-line">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent font-semibold">
          <Palette size={11} /> Colores de marca (más de 3)
        </p>
        {CAMPOS_TEMA.map(([clave, label]) => (
          <SelectorColor
            key={clave}
            label={label}
            valor={contenido.tema[clave]}
            onChange={(v) => cambiar(`tema.${clave}`, v)}
          />
        ))}
      </section>

      <section className="pt-2 border-t border-line">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold font-semibold">
          <Lightbulb size={11} /> Ideas de diseño — un clic para aplicar
        </p>
        <div className="flex gap-2 overflow-x-auto py-1.5">
          {PALETAS.map((d) => (
            <button
              key={d.nombre}
              type="button"
              onClick={() => aplicarNuevo({
                ...contenido,
                tema: { ...contenido.tema, ...d.tema },
                logo: { ...contenido.logo, ...d.logo },
              })}
              className="shrink-0 w-28 rounded-xl border border-line bg-surface p-2 text-left hover:border-gold hover:shadow-card transition"
              title={`Aplicar diseño "${d.nombre}"`}
            >
              <span className="text-[11px] font-medium text-ink flex items-center gap-1 truncate">
                <span>{d.emoji}</span> {d.nombre}
              </span>
              <TiraColores colors={d.tema} />
              <span className="mt-1 flex items-center gap-1.5">
                <LogoNathalia size={16} config={d.logo} showText={false} />
                <span className="text-[9px] text-ink-3 capitalize">{d.logo.forma}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <button
            type="button"
            onClick={sorpresaTotal}
            className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-accent to-gold text-white border border-transparent hover:scale-105 transition flex items-center gap-1"
            title="Colores + fuente + logo + presentación al azar"
          >
            <Sparkles size={12} /> Sorpresa total
          </button>
          <button
            type="button"
            onClick={coloresAleatorios}
            className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/30 hover:bg-accent hover:text-white transition flex items-center gap-1"
          >
            <Dices size={12} /> Colores al azar
          </button>
          <button
            type="button"
            onClick={ideasAleatorias}
            className="h-7 px-2.5 rounded-full text-[11px] font-semibold bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-white transition flex items-center gap-1"
          >
            <Wand2 size={12} /> Diseño al azar
          </button>
          <button
            type="button"
            onClick={restaurar}
            className="h-7 px-2.5 rounded-full text-[11px] font-medium border border-line text-ink-3 hover:text-accent hover:border-accent transition flex items-center gap-1"
          >
            <RotateCcw size={12} /> Fábrica
          </button>
        </div>
      </section>
    </div>
  )
}