import { useState, useEffect } from 'react'

/**
 * Returns the number of seconds remaining in the countdown.
 * Returns 0 once expired. Updates every second.
 *
 * @param {string|Date} createdAt  - ISO timestamp when the item was created
 * @param {number}      durationMs - total countdown duration in milliseconds (default 2 min)
 */
export default function useCountdown(createdAt, durationMs = 120_000) {
  function calc() {
    if (!createdAt) return 0
    const elapsed = Date.now() - new Date(createdAt).getTime()
    return Math.max(0, Math.floor((durationMs - elapsed) / 1000))
  }

  const [remaining, setRemaining] = useState(calc)

  useEffect(() => {
    if (!createdAt) return
    const initial = calc()
    if (initial <= 0) return          // already expired — no interval needed

    setRemaining(initial)
    const id = setInterval(() => {
      const next = calc()
      setRemaining(next)
      if (next <= 0) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, durationMs])

  return remaining                    // 0 means expired / not started
}
