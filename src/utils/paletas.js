// Ideas de color y diseño para el admin. Cada "diseño" es una combinación
// completa (colores de marca + colores del logo + forma) con un nombre
// inspirador. El botón aleatorio genera combinaciones armónicas nuevas al azar.

const FORMAS = ['anillo', 'rombo', 'flor'].sort(() => Math.random() - 0.5)

// Convertir hsl (grados, %, %) a hexadecimal #rrggbb (lo que espera input[type=color])
export function hslAHex(h, s, l) {
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const aH = (v) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${aH(f(0))}${aH(f(8))}${aH(f(4))}`
}

function azar(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Paleta de marca completa, aleatoria pero armónica: se elige un tono base y a
// partir de él se derivan todos los demás (imitando los presets curados).
export function generarDiseñoAleatorio() {
  const h = azar(0, 359)
  const h2 = (h + azar(35, 70)) % 360
  const h3 = (h + azar(140, 180)) % 360

  return {
    nombre: 'Fantasía 🎲',
    tema: {
      rose: hslAHex(h, 58, 54),
      roseStrong: hslAHex(h, 55, 42),
      roseSoft: hslAHex(h, 50, 84),
      roseLight: hslAHex(h, 58, 93),
      blush: hslAHex(h, 70, 97),
      gold: hslAHex(h2, 52, 47),
      goldLight: hslAHex(h2, 58, 80),
      extra1: hslAHex(h3, 45, 58),
      extra2: hslAHex(h3, 40, 78),
      extra3: hslAHex(h, 35, 30),
      extra4: hslAHex((h3 + 60) % 360, 35, 70),
    },
    logo: {
      anilloDe: hslAHex(h, 52, 86),
      anilloA: hslAHex(h2, 52, 47),
      letra: hslAHex(h, 58, 54),
      fondoDe: hslAHex(h, 42, 14),
      fondoA: hslAHex(h, 50, 8),
      forma: FORMAS[azar(0, 2)],
    },
  }
}

// Genera solo colores nuevos (marca), conservando la forma actual del logo.
export function generarPaletaAleatoria() {
  const d = generarDiseñoAleatorio()
  return { tema: d.tema }
}

// Presets curados: combinaciones pensadas para inspirar al administrador.
export const PALETAS = [
  {
    nombre: 'Romance',
    emoji: '✨',
    tema: {
      rose: '#B4517B', roseStrong: '#9C3F66', roseSoft: '#E9C3D4', roseLight: '#F6E0E9',
      blush: '#FAEFF4', gold: '#B8912C', goldLight: '#A87F1F',
      extra1: '#C77A9C', extra2: '#E9CD8A', extra3: '#8E6BB6', extra4: '#5E9C8A',
    },
    logo: { anilloDe: '#E9CD8A', anilloA: '#D4AF37', letra: '#C77A9C', fondoDe: '#3A1E2E', fondoA: '#1A0E13', forma: 'anillo' },
  },
  {
    nombre: 'Noche Dama',
    emoji: '🌙',
    tema: {
      rose: '#8E4FB0', roseStrong: '#6E3990', roseSoft: '#CDB4E4', roseLight: '#E6D8F4',
      blush: '#F3ECFA', gold: '#C9A227', goldLight: '#E0C05C',
      extra1: '#9B6BC3', extra2: '#5A3F8E', extra3: '#D98B8B', extra4: '#6A8E5A',
    },
    logo: { anilloDe: '#E6D0F7', anilloA: '#C9A227', letra: '#8E4FB0', fondoDe: '#241643', fondoA: '#120B24', forma: 'rombo' },
  },
  {
    nombre: 'Diosa Dorada',
    emoji: '👑',
    tema: {
      rose: '#B8681E', roseStrong: '#8F4F14', roseSoft: '#EAD2B4', roseLight: '#F7ECD9',
      blush: '#FBF4E8', gold: '#C9992E', goldLight: '#E3C77B',
      extra1: '#B4517B', extra2: '#7A9E6B', extra3: '#D3B89A', extra4: '#5E4030',
    },
    logo: { anilloDe: '#F3E2BB', anilloA: '#C9992E', letra: '#B8681E', fondoDe: '#2E1A0E', fondoA: '#171009', forma: 'flor' },
  },
  {
    nombre: 'Primavera',
    emoji: '🌸',
    tema: {
      rose: '#E05D7A', roseStrong: '#C2445F', roseSoft: '#F4B8C7', roseLight: '#FCE3EA',
      blush: '#FFF2F5', gold: '#C9943A', goldLight: '#E7CF8E',
      extra1: '#5FA86B', extra2: '#F2A65A', extra3: '#8FC0E8', extra4: '#C77A9C',
    },
    logo: { anilloDe: '#FFD9C2', anilloA: '#E05D7A', letra: '#5FA86B', fondoDe: '#3A2430', fondoA: '#1A0E13', forma: 'flor' },
  },
  {
    nombre: 'Cielo Serena',
    emoji: '💙',
    tema: {
      rose: '#5E7FBF', roseStrong: '#4964A0', roseSoft: '#B9C9EC', roseLight: '#DCE6F8',
      blush: '#EEF3FB', gold: '#C9A227', goldLight: '#E2C560',
      extra1: '#8E6BB6', extra2: '#5FA86B', extra3: '#E882A5', extra4: '#4A7C82',
    },
    logo: { anilloDe: '#DAE3F5', anilloA: '#5E7FBF', letra: '#4A7C82', fondoDe: '#141C33', fondoA: '#0C111F', forma: 'anillo' },
  },
  {
    nombre: 'Café & Caramelo',
    emoji: '☕',
    tema: {
      rose: '#A05E3C', roseStrong: '#7F4729', roseSoft: '#E3C9B4', roseLight: '#F3E6DA',
      blush: '#FAF2EA', gold: '#C5923B', goldLight: '#E2C68C',
      extra1: '#8A6B4C', extra2: '#C77A9C', extra3: '#6F8A5E', extra4: '#5A483B',
    },
    logo: { anilloDe: '#F0DCC6', anilloA: '#C5923B', letra: '#A05E3C', fondoDe: '#241610', fondoA: '#120B08', forma: 'rombo' },
  },
  {
    nombre: 'Realeza',
    emoji: '💜',
    tema: {
      rose: '#8E2F52', roseStrong: '#6E2140', roseSoft: '#D6A0BD', roseLight: '#EFD8E3',
      blush: '#FBEFF4', gold: '#C9A227', goldLight: '#E3C75F',
      extra1: '#6E3990', extra2: '#B4517B', extra3: '#2F3B6E', extra4: '#D98B54',
    },
    logo: { anilloDe: '#EBD6A8', anilloA: '#C9A227', letra: '#8E2F52', fondoDe: '#1E1022', fondoA: '#10060F', forma: 'anillo' },
  },
  {
    nombre: 'Fresca Menta',
    emoji: '🍃',
    tema: {
      rose: '#4A9A88', roseStrong: '#37806F', roseSoft: '#B7DFD3', roseLight: '#DFF2EC',
      blush: '#EFF9F5', gold: '#C9992E', goldLight: '#E6CE82',
      extra1: '#C77A9C', extra2: '#E8828A', extra3: '#7F9BC9', extra4: '#A8A25A',
    },
    logo: { anilloDe: '#D8F1E8', anilloA: '#4A9A88', letra: '#C77A9C', fondoDe: '#0E2B25', fondoA: '#081512', forma: 'rombo' },
  },
]