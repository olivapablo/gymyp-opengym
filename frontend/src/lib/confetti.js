/**
 * Lightweight canvas confetti (Tanda 4)
 * - Pure vanilla canvas: 0 libraries, ~2KB.
 * - Runs for 2.0s via requestAnimationFrame and auto-destroys the canvas.
 * - Strictly respects prefers-reduced-motion (no-ops immediately).
 * - Only uses 2D canvas drawing (no DOM elements created per particle).
 */

const CONFETTI_COLORS = [
  '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55'
]

export function fireConfetti(durationMs = 2000) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;'
  
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = (window.innerWidth || 360) * dpr
  canvas.height = (window.innerHeight || 640) * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  document.body.appendChild(canvas)

  const w = window.innerWidth || 360
  const h = window.innerHeight || 640

  const count = Math.min(65, Math.floor(w / 7))
  const particles = []

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w * (0.35 + Math.random() * 0.3),
      y: h * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 6,
      size: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.25,
      drag: 0.965,
      gravity: 0.38,
    })
  }

  const startTime = performance.now()
  let frameId

  function loop(now) {
    const elapsed = now - startTime
    if (elapsed >= durationMs) {
      canvas.remove()
      return
    }

    ctx.clearRect(0, 0, w, h)
    const fade = elapsed > durationMs * 0.65
      ? Math.max(0, 1 - (elapsed - durationMs * 0.65) / (durationMs * 0.35))
      : 1

    ctx.globalAlpha = fade

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vx *= p.drag
      p.vy = p.vy * p.drag + p.gravity
      p.angle += p.vAngle

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5)
      ctx.restore()
    }

    frameId = requestAnimationFrame(loop)
  }

  frameId = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(frameId)
    canvas.remove()
  }
}
