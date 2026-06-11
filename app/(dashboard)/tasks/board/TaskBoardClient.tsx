'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, LayoutList } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { resolveTaskStatus, PRIORITY_CONFIG } from '@/lib/utils/taskStatus'
import { getDueDateLabel } from '@/lib/utils/formatDate'
import toast from 'react-hot-toast'
import TaskForm from '@/components/tasks/TaskForm'
import { TaskStatus, Priority } from '@prisma/client'

interface Task {
  id: string; title: string; description?: string | null; dueDate?: Date | null
  dueTime?: string | null; priority: Priority; status: TaskStatus; tags: string[]
  completedAt?: Date | null; createdAt: Date; updatedAt: Date; userId: string
}

interface Props {
  initialTasks: Task[]
}

const COLUMNS = [
  { id: 'PENDING',     label: 'Pending',     color: '#B58A00', bg: '#FEF7DC', border: '#E6B800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#2D87C0', bg: '#DCF0FB', border: '#257FA8' },
  { id: 'COMPLETED',   label: 'Completed',   color: '#3BAB7A', bg: '#DFF5EE', border: '#32966B' },
  { id: 'OVERDUE',     label: 'Overdue',     color: '#C94040', bg: '#FCDEDE', border: '#B83B3B' },
]

export default function TaskBoardClient({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isMounted, setIsMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  // Hydration guard for Next.js
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Resolve status of all tasks dynamically (detect overdue)
  const resolvedTasks = useMemo(() => {
    return tasks.map(t => ({
      ...t,
      status: resolveTaskStatus({ status: t.status, dueDate: t.dueDate ?? null, completedAt: t.completedAt ?? null })
    }))
  }, [tasks])

  // Group tasks by status
  const columnsData = useMemo(() => {
    const data: Record<string, Task[]> = {
      PENDING: [],
      IN_PROGRESS: [],
      COMPLETED: [],
      OVERDUE: [],
    }
    resolvedTasks.forEach(task => {
      if (data[task.status]) {
        data[task.status].push(task)
      } else {
        data.PENDING.push(task) // fallback
      }
    })
    return data
  }, [resolvedTasks])

  // Handle toggle task completed (clicking checkbox in Kanban card)
  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    
    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date() : null
        }
      }
      return t
    }))

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      // Update with exact server payload
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    } catch {
      // Revert on error
      toast.error('Failed to update task status')
      setTasks(initialTasks)
    }
  }

  // Handle delete task
  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId))
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
      setTasks(initialTasks)
    }
  }

  // Handle task saved from modal
  const onSaved = (savedTask: Task) => {
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t))
    } else {
      setTasks(prev => [savedTask, ...prev])
    }
    setShowForm(false)
    setEditTask(null)
  }

  // Handle Drag & Drop End
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    // If dropped in same column at same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStatus = destination.droppableId as TaskStatus
    const taskToMove = tasks.find(t => t.id === draggableId)
    if (!taskToMove) return

    // Update locally first (Optimistic UI)
    const updatedTasks = Array.from(tasks)
    const idx = updatedTasks.findIndex(t => t.id === draggableId)
    if (idx !== -1) {
      updatedTasks[idx] = {
        ...updatedTasks[idx],
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date() : null
      }
      setTasks(updatedTasks)
    }

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setTasks(prev => prev.map(t => t.id === draggableId ? data : t))
      toast.success(`Task moved to ${newStatus.replace('_', ' ').toLowerCase()}`)
    } catch {
      toast.error('Failed to persist task status change')
      setTasks(initialTasks)
    }
  }

  if (!isMounted) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '40px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
        <div style={{ display: 'flex', gap: '16px', height: '400px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }} className="animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Task Board</h1>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {tasks.length} total tasks • {tasks.filter(t => resolveTaskStatus({ status: t.status, dueDate: t.dueDate ?? null, completedAt: t.completedAt ?? null }) === 'COMPLETED').length} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/tasks" className="btn btn-ghost btn-sm">
            <LayoutList size={15} /> List View
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowForm(true) }} id="board-new-task-btn">
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            flex: 1,
            paddingBottom: '16px',
            alignItems: 'stretch'
          }}
        >
          {COLUMNS.map(col => {
            const columnTasks = columnsData[col.id] || []
            return (
              <div
                key={col.id}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: col.bg,
                    borderTopLeftRadius: 'var(--radius-lg)',
                    borderTopRightRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: col.color }}>
                      {col.label}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.7)',
                        color: col.color,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        border: `1px solid ${col.border}22`
                      }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Card Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: '12px',
                        flex: 1,
                        overflowY: 'auto',
                        background: snapshot.isDraggingOver ? 'var(--bg-page)' : 'transparent',
                        transition: 'background 200ms ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {columnTasks.length === 0 ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '32px 16px',
                            color: 'var(--text-tertiary)',
                            fontSize: '12px',
                            border: '1px dashed var(--border-default)',
                            borderRadius: 'var(--radius-md)',
                            marginTop: '8px'
                          }}
                        >
                          No tasks
                        </div>
                      ) : (
                        columnTasks.map((task, index) => {
                          const priorityConf = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
                          const { label: dateLabel, variant } = getDueDateLabel(task.dueDate ?? null)
                          const resolvedStatus = task.status

                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    padding: '12px 14px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-default)',
                                    boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                    cursor: 'grab',
                                    transition: 'box-shadow 150ms ease, border-color 150ms ease',
                                  }}
                                  className="kanban-card"
                                >
                                  {/* Title & Checkbox */}
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleTask(task.id, resolvedStatus) }}
                                      style={{
                                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                                        border: resolvedStatus === 'COMPLETED' ? 'none' : '2px solid var(--border-default)',
                                        background: resolvedStatus === 'COMPLETED' ? 'var(--color-lavender-deep)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', marginTop: '2px'
                                      }}
                                      aria-label={resolvedStatus === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                      {resolvedStatus === 'COMPLETED' && (
                                        <svg width="10" height="7" viewBox="0 0 11 8" fill="none">
                                          <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </button>
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: resolvedStatus === 'COMPLETED' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                        textDecoration: resolvedStatus === 'COMPLETED' ? 'line-through' : 'none',
                                        lineHeight: 1.4,
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {task.title}
                                    </span>
                                  </div>

                                  {/* Description (truncated) */}
                                  {task.description && (
                                    <p
                                      style={{
                                        fontSize: '12px',
                                        color: 'var(--text-tertiary)',
                                        marginBottom: '8px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        lineHeight: 1.4
                                      }}
                                    >
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Chips & Metadata */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                    {priorityConf && (
                                      <span className="chip" style={{ background: priorityConf.bg, color: priorityConf.color, fontSize: '9px', height: '16px', padding: '0 6px', fontWeight: 600 }}>
                                        {task.priority.toUpperCase()}
                                      </span>
                                    )}
                                    {task.tags.map(t => (
                                      <span key={t} className="chip" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '9px', height: '16px', padding: '0 6px' }}>
                                        {t}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Footer: Date & Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                                    {/* Due date */}
                                    {variant ? (
                                      <span className={`chip chip-${variant}`} style={{ fontSize: '9px', height: '16px' }}>
                                        {dateLabel}
                                      </span>
                                    ) : (
                                      <span />
                                    )}

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setEditTask(task); setShowForm(true) }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '12px', opacity: 0.7 }}
                                        title="Edit Task"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '12px', opacity: 0.7 }}
                                        title="Delete Task"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Task Creation/Editing Modal */}
      {showForm && (
        <TaskForm
          task={editTask}
          onClose={() => { setShowForm(false); setEditTask(null) }}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
