import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast } from 'date-fns'

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, h:mm a')
}

export function formatShortDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function getDueDateLabel(date: Date | string | null): {
  label: string
  variant: 'overdue' | 'today' | 'tomorrow' | 'future' | null
} {
  if (!date) return { label: '', variant: null }
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(d)) return { label: 'Today', variant: 'today' }
  if (isTomorrow(d)) return { label: 'Tomorrow', variant: 'tomorrow' }
  if (isPast(d)) return { label: formatDate(d), variant: 'overdue' }
  return { label: formatDate(d), variant: 'future' }
}

export function formatMonthYear(month: number, year: number): string {
  return format(new Date(year, month - 1, 1), 'MMM yyyy')
}
