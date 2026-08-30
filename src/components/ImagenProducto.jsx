import { useState } from 'react'

// Ícono de reemplazo cuando una imagen de producto no carga.
function IconoBelleza(props) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l1.9 3.9 4.3.7-3.1 3 .7 4.3L12 16l-3.8 1.9.7-4.3-3.1-3 4.3-.7L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18.5 15l.8 1.7 1.7.3-1.2 1.2.3 1.7-1.6-.9-1.6.9.3-1.7-1.2-1.2 1.7-.3.8-1.7zM5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

// Muestra la imagen del producto; si no carga (URL rota, sin conexión,
// etc.) cae en un ícono neutro en vez de dejar un espacio en blanco.
function ImagenProducto({ src, alt, className = '' }) {
  const [fallo, setFallo] = useState(false)

  if (!src || fallo) {
    return (
      <div className={`flex items-center justify-center bg-accent-light/30 text-ink-3 ${className}`}>
        <IconoBelleza />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFallo(true)}
      loading="lazy"
    />
  )
}

export default ImagenProducto
