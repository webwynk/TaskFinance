import { TaskStatus, Priority } from '@prisma/client'

export function resolveTaskStatus(task: {
  status: TaskStatus
  dueDate: Date | null
  completedAt: Date | null
}): TaskStatus {
  if (task.status === 'COMPLETED') return 'COMPLETED'
  if (!task.dueDate) return task.status
  const now = new Date()
  const due = new Date(task.dueDate)
  if (due < now) return 'OVERDUE'
  return task.status
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Pending',     color: '#B58A00', bg: '#FEF7DC' },
  IN_PROGRESS: { label: 'In Progress', color: '#2D87C0', bg: '#DCF0FB' },
  COMPLETED:   { label: 'Completed',   color: '#3BAB7A', bg: '#DFF5EE' },
  OVERDUE:     { label: 'Overdue',     color: '#C94040', bg: '#FCDEDE' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'High',   color: '#C94040', bg: '#FCDEDE' },
  MEDIUM: { label: 'Medium', color: '#B58A00', bg: '#FEF7DC' },
  LOW:    { label: 'Low',    color: '#3BAB7A', bg: '#DFF5EE' },
}
