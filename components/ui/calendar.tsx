"use client"

import { useState, useEffect } from "react"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: { before?: Date; after?: Date } | ((date: Date) => boolean)
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date()
  )
  const [localSelected, setLocalSelected] = useState(selected)

  // Sync local state with prop changes
  useEffect(() => {
    setLocalSelected(selected)
  }, [selected])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Generate calendar days
  const calendarDays: (Date | null)[] = []

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push(new Date(year, month - 1, daysInPrevMonth - i))
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i))
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(new Date(year, month + 1, i))
  }

  const isDateDisabled = (date: Date) => {
    if (!disabled) return false
    // If disabled is a function, use it
    if (typeof disabled === 'function') return disabled(date)
    // Otherwise use the before/after object
    if (disabled.before && date < disabled.before) return true
    if (disabled.after && date > disabled.after) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    const dateToCheck = localSelected || selected
    if (!dateToCheck) return false
    return (
      date.getDate() === dateToCheck.getDate() &&
      date.getMonth() === dateToCheck.getMonth() &&
      date.getFullYear() === dateToCheck.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return
    setLocalSelected(date)
    onSelect?.(date)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div className={`custom-calendar ${className || ""}`}>
      {/* Header */}
      <div className="calendar-header">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="calendar-nav-btn"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="calendar-month-year">
          {MONTHS[month]} {year}
        </div>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className="calendar-nav-btn"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="calendar-days-header">
        {DAYS.map((day, index) => (
          <div key={`${day}-${index}`} className="calendar-day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="calendar-day-cell" />
          
          const disabled = isDateDisabled(date)
          const currentMonth = isCurrentMonth(date)
          const today = isToday(date)
          const selectedDate = isDateSelected(date)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`calendar-day-cell ${
                !currentMonth ? "other-month" : ""
              } ${selectedDate ? "selected" : ""} ${
                today ? "today" : ""
              } ${disabled ? "disabled" : ""}`}
            >
              <span className="calendar-day-number" style={{ fontFamily: 'var(--font-source-code-pro)' }}>{date.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

