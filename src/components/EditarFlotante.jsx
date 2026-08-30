import { Pencil, Move } from 'lucide-react'

// EditarFlotante — Panel del lápiz de las tarjetas flotantes del hero:
// permite cambiar emoji, título, precio, badge y la posición en la pantalla.

function Campo({ label, valor, ruta, onCambio, pequeno = false }) {
  return (
    <label className={pequeno ? 'block min-w-0' : 'block'}>
      <span className="text-[10px] uppercase tracking-wider text-ink-3">{label}</span>
      <input
        value={valor}
        onChange={(e) => onCambio(ruta, e.target.value)}
        className="input text-sm w-full mt-0.5"
      />
    </label>
  )
}

export default function EditarFlotante({ flotante, ruta, onCambio }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Campo label="Emoji" valor={flotante?.emoji || ''} ruta={`${ruta}.emoji`} onCambio={onCambio} />
        <Campo label="Precio" valor={flotante?.precio || ''} ruta={`${ruta}.precio`} onCambio={onCambio} />
      </div>
      <Campo label="Título" valor={flotante?.titulo || ''} ruta={`${ruta}.titulo`} onCambio={onCambio} />
      <div className="grid grid-cols-2 gap-2">
        <Campo label="Badge" valor={flotante?.badge || ''} ruta={`${ruta}.badge`} onCambio={onCambio} />
      </div>
      <div className="pt-1 border-t border-line">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-3">
          <Move size={9} /> Posición en pantalla (%)
        </span>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Campo pequeno label="Desde arriba" valor={flotante?.top || ''} ruta={`${ruta}.top`} onCambio={onCambio} />
          <Campo pequeno label="Desde la izquierda" valor={flotante?.left || ''} ruta={`${ruta}.left`} onCambio={onCambio} />
        </div>
        <p className="text-[10px] text-ink-3 mt-1">
          <Pencil size={9} className="inline" /> Ej.: 30% para arriba, 6% para izquierda.
        </p>
      </div>
    </div>
  )
}