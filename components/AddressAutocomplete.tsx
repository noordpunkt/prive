'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Street address, city, postal code",
  required = false,
  disabled = false,
  id = "address"
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Common address patterns for autocomplete suggestions
  const commonAddresses = [
    "123 Main Street, Paris, 75001",
    "45 Avenue des Champs-Élysées, Paris, 75008",
    "78 Rue de Rivoli, Paris, 75004",
    "12 Boulevard Saint-Germain, Paris, 75005",
    "56 Rue de la Paix, Nice, 06000",
    "34 Promenade des Anglais, Nice, 06000",
    "89 Cours Mirabeau, Aix-en-Provence, 13100",
    "23 Rue de la République, Lyon, 69001",
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)

    if (inputValue.length > 2) {
      // Filter common addresses based on input
      const filtered = commonAddresses.filter(addr =>
        addr.toLowerCase().includes(inputValue.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pb-2"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors border-b border-black/10 dark:border-white/10 last:border-b-0"
            >
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

