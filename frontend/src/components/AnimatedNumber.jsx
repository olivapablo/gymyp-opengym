import React, { useEffect, useState } from 'react'

/**
 * AnimatedNumber hook & component (Tanda 4)
 * - Counts smoothly from 0 to target value in ~400ms using requestAnimationFrame.
 * - Cubic ease-out curve.
 * - Immediately displays target value if prefers-reduced-motion is active.
 */
export function useAnimatedNumber(target, duration = 400) {
  const num = typeof target === 'number' ? target : parseFloat(target) || 0

  const [current, setCurrent] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return num
    }
    return 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || num === 0) {
      setCurrent(num)
      return
    }

    const start = 0
    const startTime = performance.now()
    let frameId

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3)
      const val = start + (num - start) * ease

      // Preserve decimal places if target had decimals
      if (Number.isInteger(num)) {
        setCurrent(Math.round(val))
      } else {
        setCurrent(parseFloat(val.toFixed(1)))
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        setCurrent(num)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [num, duration])

  return current
}

export function AnimatedNumber({ value, duration = 400, format }) {
  const animated = useAnimatedNumber(value, duration)
  return <>{format ? format(animated) : animated}</>
}

export default AnimatedNumber
