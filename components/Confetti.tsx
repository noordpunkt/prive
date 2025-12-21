'use client'

import { useEffect, useState } from 'react'

export function Confetti() {
  const [confetti, setConfetti] = useState<Array<{
    id: number
    left: number
    delay: number
    duration: number
    size: number
  }>>([])

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 6,
    }))
    setConfetti(pieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: '#808080',
            animation: `confetti-fall ${piece.duration}s ${piece.delay}s linear forwards`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  )
}

