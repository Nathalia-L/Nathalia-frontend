// Tipografías disponibles para todo el sitio. Cada estilo combina una fuente
// para los títulos (font-display) y una para el texto normal. Se aplican en
// vivo como variables CSS (--na-fuente-display / --na-fuente-texto) desde
// tema.js, igual que los colores.

export const FUENTES = [
  { id: 'nathalia', nombre: 'Nathalia Clásica', emoji: '🌹', display: "'Fraunces', serif", texto: "'Inter', sans-serif" },
  { id: 'elegante', nombre: 'Elegante Serif', emoji: '🕯️', display: "'Playfair Display', serif", texto: "'Poppins', sans-serif" },
  { id: 'editorial', nombre: 'Editorial', emoji: '📜', display: "'Cormorant Garamond', serif", texto: "'Montserrat', sans-serif" },
  { id: 'moderno', nombre: 'Moderno', emoji: '⚡', display: "'Montserrat', sans-serif", texto: "'Inter', sans-serif" },
  { id: 'suave', nombre: 'Suave y Dulce', emoji: '🍬', display: "'Quicksand', sans-serif", texto: "'Lora', serif" },
  { id: 'romantico', nombre: 'Romántico', emoji: '💌', display: "'Dancing Script', cursive", texto: "'Lora', serif" },
  { id: 'firma', nombre: 'Firma de Lujo', emoji: '🖋️', display: "'Great Vibes', cursive", texto: "'Fraunces', serif" },
  { id: 'clasico', nombre: 'Clásico Editorial', emoji: '📖', display: "'Lora', serif", texto: "'Inter', sans-serif" },
]

export const FUENTES_POR_ID = Object.fromEntries(FUENTES.map((f) => [f.id, f]))

export const FUENTE_DEFAULT = FUENTES[0]