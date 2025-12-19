'use client'

import { Button } from '@/components/ui/button'

interface BookNowButtonProps {
  disabled?: boolean
}

export function BookNowButton({ disabled }: BookNowButtonProps) {
  const handleClick = () => {
    // Scroll to booking form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Button 
      size="lg" 
      disabled={disabled}
      className="w-full sm:w-auto min-w-[200px]"
      onClick={handleClick}
    >
      Book now
    </Button>
  )
}

