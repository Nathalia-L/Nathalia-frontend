import { motion } from "framer-motion";

const PASOS = [
  { id: "pendiente",   label: "Pedido recibido",  icono: "🕐", desc: "Estamos procesando tu compra" },
  { id: "en_proceso",  label: "En preparación",   icono: "📦", desc: "Preparamos y empaquetamos tu pedido" },
  { id: "enviado",     label: "En camino",        icono: "🚚", desc: "Va hacia tu ciudad" },
  { id: "entregado",   label: "Entregado",        icono: "🏠", desc: "¡Tu pedido en tu puerta!" },
];

// Mapea el estado del backend al índice del stepper
// Backend tiene "confirmado" pero ya no lo mostramos como paso separado
function estadoAIndice(estado) {
  const mapa = { pendiente: 0, confirmado: 0, en_proceso: 1, enviado: 2, entregado: 3 };
  return mapa[estado] ?? -1;
}

export default function OrderStepper({ estado, compacto = false, fechaPedido = null }) {
  const indexActual = estadoAIndice(estado);

  if (compacto) {
    return (
      <div className="flex items-center gap-1">
        {PASOS.map((paso, i) => (
          <div key={paso.id} className="flex items-center gap-1">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 400, damping: 15 }}
              className={`w-2.5 h-2.5 rounded-full ${
                i <= indexActual ? "bg-accent shadow-sm shadow-accent/40" : "bg-ink-3/40"
              }`}
            />
            {i < PASOS.length - 1 && (
              <div className={`w-4 h-px ${i < indexActual ? "bg-accent" : "bg-line"}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between overflow-x-auto">
      {PASOS.map((paso, i) => (
        <div key={paso.id} className="flex items-start flex-1 min-w-[80px]">
          <div className="flex flex-col items-center flex-1">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 400, damping: 15 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                i < indexActual
                  ? "bg-accent border-accent text-white"
                  : i === indexActual
                  ? "bg-accent border-accent text-white ring-4 ring-accent/30"
                  : "bg-transparent border-line text-ink-3"
              } ${i === indexActual ? "animate-pulse" : ""}`}
            >
              {paso.icono}
            </motion.div>
            <p className={`text-xs mt-2 text-center font-medium ${
              i <= indexActual ? "text-ink" : "text-ink-3"
            }`}>
              {paso.label}
            </p>
            {i === 0 && fechaPedido && (
              <p className="text-[10px] text-ink-3">{fechaPedido}</p>
            )}
            {i > indexActual && (
              <p className="text-[10px] text-ink-3">{paso.desc}</p>
            )}
          </div>
          {i < PASOS.length - 1 && (
            <div className={`h-px w-full mt-5 mx-1 ${
              i < indexActual ? "bg-accent" : "bg-line"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
