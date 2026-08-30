import { useState } from 'react'
import { Tag, Wallet, Pencil, ImagePlus } from 'lucide-react'
import SelectorImagen from './SelectorImagen'

// EditarProducto — Panel anclado al lápiz de cada producto en la página:
// permite cambiar texto, precio, emoji, badge e imagen (subiendo o por URL),
// justo donde está la tarjeta. Se guarda en vivo con el resto del contenido.

function CampoDato({ icono, label, valor, ruta, onCambio, tipo = 'text' }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-3">
        {icono} {label}
      </span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onCambio(ruta, tipo === 'number' ? Number(e.target.value) || 0 : e.target.value)}
        className="input text-sm w-full mt-0.5"
      />
    </label>
  )
}

export default function EditarProducto({ producto, ruta, onCambio }) {
  const [descBorrador, setDescBorrador] = useState(null)

  const desc = descBorrador ?? (producto?.desc || '')
  const cambiarDesc = (v) => {
    setDescBorrador(v)
    onCambio(`${ruta}.desc`, v)
  }

  return (
    <div className="space-y-2">
      <CampoDato icono={<Pencil size={9} />} label="Nombre" valor={producto?.nombre || ''} ruta={`${ruta}.nombre`} onCambio={onCambio} />
      <div className="grid grid-cols-2 gap-2">
        <CampoDato icono={<Wallet size={9} />} label="Precio $" tipo="number" valor={producto?.precio || 0} ruta={`${ruta}.precio`} onCambio={onCambio} />
        <CampoDato icono={<Tag size={9} />} label="Antes (0 si no)" tipo="number" valor={producto?.antes || 0} ruta={`${ruta}.antes`} onCambio={onCambio} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CampoDato label="Emoji" valor={producto?.emoji || ''} ruta={`${ruta}.emoji`} onCambio={onCambio} />
        <CampoDato label="Badge" valor={producto?.badge || ''} ruta={`${ruta}.badge`} onCambio={onCambio} />
      </div>
      <label className="block">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-3">
          <Pencil size={9} /> Descripción
        </span>
        <textarea
          value={desc}
          onChange={(e) => cambiarDesc(e.target.value)}
          rows={2}
          className="input text-sm w-full mt-0.5 resize-y"
        />
      </label>

      <div className="pt-1 border-t border-line">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-3">
          <ImagePlus size={10} /> Imagen del producto
        </span>
        <div className="mt-1.5">
          <SelectorImagen
            label={`Imagen de ${producto?.nombre || 'producto'}`}
            valor={producto?.imagen || ''}
            onCambiar={(v) => onCambio(`${ruta}.imagen`, v)}
          />
        </div>
      </div>
    </div>
  )
}