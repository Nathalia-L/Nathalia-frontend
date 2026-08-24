import { useState } from 'react'
import ImagenProducto from './ImagenProducto'

const badgeColor = {
  "Popular":    "bg-[#C77A9C] text-white",
  "Nuevo":      "bg-[#C77A9C]/10 text-[#EBC6D6] ring-1 ring-inset ring-[#C77A9C]/25",
  "Oferta":     "bg-[#D4AF37]/10 text-[#D4AF37] ring-1 ring-inset ring-[#D4AF37]/25",
  "Top ventas": "bg-[#C77A9C] text-white",
}

export default function ProductoCardMini({ p, onVerDetalle }) {
  const [feedback, setFeedback] = useState(false)

  const handleClick = () => {
    onVerDetalle(p)
  }

  return (
    <div
      className="shrink-0 w-[180px] sm:w-[200px] rounded-2xl overflow-hidden cursor-pointer bg-[#241219] border border-white/[0.08] hover:-translate-y-1 hover:border-white/20 transition-all duration-200 group"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${p.nombre}`}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-[#2A1521] overflow-hidden">
        <ImagenProducto
          src={p.img}
          alt={p.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        {p.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor[p.badge] || ''}`}>
            {p.badge}
          </span>
        )}

        {/* Badge promo */}
        {p.promoPct > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-white">
            -{p.promoPct}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-white/40 truncate">{p.origen}</p>
        <p className="text-sm font-medium text-white mt-0.5 leading-snug line-clamp-2 min-h-[2.5rem]">
          {p.nombre}
        </p>

        {/* Precio */}
        <div className="mt-2">
          {p.promoPct > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/30 line-through">
                ${p.precio.toLocaleString("es-CO")}
              </span>
              <span className="text-sm font-semibold text-[#D4AF37]">
                ${Math.round(p.precio * (1 - p.promoPct / 100)).toLocaleString("es-CO")}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-white">
              ${p.precio.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-1 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${
            p.stockLabel === "En stock" ? "bg-[#C77A9C]"
            : p.stockLabel === "Stock bajo" ? "bg-amber-500"
            : "bg-[#D4AF37]"
          }`} />
          <span className={`text-[10px] ${
            p.stockLabel === "En stock" ? "text-[#EBC6D6]"
            : p.stockLabel === "Stock bajo" ? "text-amber-600"
            : "text-[#D4AF37]"
          }`}>{p.stockLabel}</span>
        </div>
      </div>
    </div>
  )
}
