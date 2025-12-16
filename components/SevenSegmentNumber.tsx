'use client'

interface SevenSegmentNumberProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
}

export function SevenSegmentNumber({ number, size = 'lg' }: SevenSegmentNumberProps) {
  const sizeClasses = {
    sm: 'text-6xl',
    md: 'text-8xl',
    lg: 'text-[12rem]'
  }

  return (
    <div 
      className={`${sizeClasses[size]} font-mono font-bold text-white relative`}
      style={{
        lineHeight: '1',
        fontFamily: 'monospace',
        textShadow: `
          0 0 10px rgba(255, 255, 255, 0.9),
          0 0 20px rgba(255, 255, 255, 0.7),
          0 0 30px rgba(255, 255, 255, 0.5),
          0 0 40px rgba(255, 255, 255, 0.3)
        `,
        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
        letterSpacing: '0.1em',
        fontWeight: 700,
      }}
    >
      {number}
    </div>
  )
}

