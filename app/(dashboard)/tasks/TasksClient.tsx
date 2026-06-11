'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Plus, LayoutList, Columns, X } from 'lucide-react'
import { resolveTaskStatus, PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils/taskStatus'
import { getDueDateLabel, formatDate } from '@/lib/utils/formatDate'
import toast from 'react-hot-toast'
import TaskForm from '@/components/tasks/TaskForm'

interface Task {
  id: string; title: string; description?: string | null; dueDate?: Date | null
  dueTime?: string | null; priority: string; status: string; tags: string[]
  completedAt?: Date | null; createdAt: Date; updatedAt: Date; userId: string
}

interface Props {
  initialTasks: Task[]
  session: { user: { id: string; name: string; role: string } }
}

const PERIOD_FILTERS = ['Today', 'This Week', 'This Month', 'All']
const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed', 'Overdue']
const PRIORITY_FILTERS = ['All', 'High', 'Medium', 'Low']

export default function TasksClient({ initialTasks, session }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [period, setPeriod] = useState('This Month')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [period, statusFilter, priorityFilter, search])

  const filtered = useMemo(() => {
    const now = new Date()
    return tasks.filter(task => {
      const resolved = resolveTaskStatus(task as any)
      if (statusFilter !== 'All' && resolved.toLowerCase().replace('_', ' ') !== statusFilter.toLowerCase()) return false
      if (priorityFilter !== 'All' && task.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
      if (period === 'Today') {
        if (!task.dueDate) return false
        const d = new Date(task.dueDate)
        return d.toDateString() === now.toDateString()
      }
      if (period === 'This Week') {
        if (!task.dueDate) return false
        const d = new Date(task.dueDate)
        const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0)
        const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
        return d >= start && d <= end
      }
      if (period === 'This Month') {
        if (!task.dueDate) return false
        const d = new Date(task.dueDate)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [tasks, period, statusFilter, priorityFilter, search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: resolveTaskStatus(data) } : t))
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    }
  }

  const onSaved = (task: Task) => {
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    } else {
      setTasks(prev => [task, ...prev])
    }
    setShowForm(false)
    setEditTask(null)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {filtered.length} task{filtered.length !== 1 ? 's' : ''} • {tasks.filter(t => resolveTaskStatus(t as any) === 'COMPLETED').length} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/tasks/board" className="btn btn-ghost btn-sm">
            <Columns size={15} /> Board
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowForm(true) }} id="new-task-btn">
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <input
          className="input"
          style={{ height: '36px', width: '200px' }}
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="task-search"
        />
        {PERIOD_FILTERS.map(p => (
          <button key={p} className={`filter-pill${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
        {STATUS_FILTERS.map(s => (
          <button key={s} className={`filter-pill${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
        {PRIORITY_FILTERS.map(p => (
          <button key={p} className={`filter-pill${priorityFilter === p ? ' active' : ''}`} onClick={() => setPriorityFilter(p)}>{p}</button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No tasks here</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '20px' }}>Try different filters or create a new task</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Task
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paginatedTasks.map(task => {
              const status = resolveTaskStatus(task as any)
              const { label: dateLabel, variant } = getDueDateLabel(task.dueDate ?? null)
              const priorityConf = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]

              return (
                <div key={task.id} className="task-card card animate-fade-in">
                  <div className="task-card-main">
                    {/* Checkbox */}
                    <div className="task-checkbox-container">
                      <button
                        onClick={() => toggleTask(task.id, status)}
                        style={{
                          width: '20px', height: '20px', borderRadius: '5px',
                          border: status === 'COMPLETED' ? 'none' : '2px solid var(--border-default)',
                          background: status === 'COMPLETED' ? 'var(--color-lavender-deep)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 200ms ease',
                        }}
                        aria-label={status === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {status === 'COMPLETED' && (
                          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Title, Description & Tags */}
                    <div className="task-info">
                      <h3 className={`task-title ${status === 'COMPLETED' ? 'completed' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      {task.tags.length > 0 && (
                        <div className="task-tags">
                          {task.tags.map(tag => (
                            <span key={tag} className="chip tag-chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="task-card-meta">
                    <div className="task-badges">
                      {/* Priority chip */}
                      <span className="chip" style={{ background: priorityConf?.bg, color: priorityConf?.color }}>
                        {task.priority.toUpperCase()}
                      </span>
                      {/* Status chip */}
                      <span className="chip" style={{ background: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.bg, color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color }}>
                        {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                      </span>
                      {/* Due date chip */}
                      {variant && (
                        <span className={`chip chip-${variant}`}>
                          {dateLabel}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="task-actions">
                      <button className="btn btn-ghost btn-icon" style={{ width: '30px', height: '30px' }} onClick={() => { setEditTask(task); setShowForm(true) }} aria-label="Edit task">
                        ✏️
                      </button>
                      <button className="btn btn-ghost btn-icon" style={{ width: '30px', height: '30px' }} onClick={() => deleteTask(task.id)} aria-label="Delete task">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <span className="pagination-info">
                Showing {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length} tasks
              </span>
              <div className="pagination-btn-group">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task Form Modal */}
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
