// AuroraBackground — blobs animados con la paleta Nathalia (rosa, dorado, blush, ciruela).

export default function AuroraBackground({ intensidad = 1 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="aurora-blob aurora-blob-1"
        style={{
          position: 'absolute',
          width: '620px',
          height: '620px',
          top: '-12%',
          left: '-6%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(199,122,156,${0.34 * intensidad}) 0%, transparent 70%)`,
          filter: 'blur(70px)',
          animation: 'aurora-drift-1 20s ease-in-out infinite',
        }}
      />
      <div
        className="aurora-blob aurora-blob-2"
        style={{
          position: 'absolute',
          width: '520px',
          height: '520px',
          top: '18%',
          right: '-10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,${0.22 * intensidad}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'aurora-drift-2 25s ease-in-out infinite',
        }}
      />
      <div
        className="aurora-blob aurora-blob-3"
        style={{
          position: 'absolute',
          width: '480px',
          height: '480px',
          bottom: '-8%',
          left: '28%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(199,122,156,${0.26 * intensidad}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'aurora-drift-3 18s ease-in-out infinite',
        }}
      />
      <div
        className="aurora-blob aurora-blob-4"
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          top: '38%',
          left: '48%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(233,205,138,${0.2 * intensidad}) 0%, transparent 70%)`,
          filter: 'blur(50px)',
          animation: 'aurora-drift-4 22s ease-in-out infinite',
        }}
      />
    </div>
  )
}