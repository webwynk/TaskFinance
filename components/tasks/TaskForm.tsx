'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskCreateSchema, type TaskCreate } from '@/lib/validations/task.schema'
import toast from 'react-hot-toast'

interface Task {
  id?: string; title?: string; description?: string | null; dueDate?: Date | null
  dueTime?: string | null; priority?: string; tags?: string[]
}

interface Props {
  task: Task | null
  onClose: () => void
  onSaved: (task: any) => void
}

export default function TaskForm({ task, onClose, onSaved }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(task?.tags ?? [])

  const isEdit = !!task?.id

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TaskCreate>({
    resolver: zodResolver(TaskCreateSchema) as any,
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      dueTime: task?.dueTime ?? '',
      priority: (task?.priority as any) ?? 'MEDIUM',
      tags: task?.tags ?? [],
    },
  })

  useEffect(() => { setValue('tags', tags) }, [tags, setValue])

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag))

  const onSubmit = async (data: TaskCreate) => {
    setIsLoading(true)
    try {
      const url = isEdit ? `/api/tasks/${task!.id}` : '/api/tasks'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tags }),
      })
      if (!res.ok) throw new Error('Failed')
      const { data: saved } = await res.json()
      toast.success(isEdit ? 'Task updated!' : 'Task created!', {
        style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' }
      })
      onSaved(saved)
    } catch {
      toast.error('Something went wrong', {
        style: { background: 'var(--color-rose)', color: 'var(--color-rose-deep)' }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const PRIORITIES = [
    { value: 'HIGH', label: 'High', color: 'var(--color-rose-deep)', bg: 'var(--color-rose)' },
    { value: 'MEDIUM', label: 'Medium', color: 'var(--color-lemon-deep)', bg: 'var(--color-lemon)' },
    { value: 'LOW', label: 'Low', color: 'var(--color-mint-deep)', bg: 'var(--color-mint)' },
  ]

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit task' : 'Create task'}>
      <div className="modal-content animate-scale-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-h2" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="task-title">Title *</label>
            <input id="task-title" className={`input${errors.title ? ' error' : ''}`} placeholder="What needs to be done?" {...register('title')} />
            {errors.title && <span className="input-error-msg">{errors.title.message}</span>}
          </div>

          {/* Description */}
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="task-desc">Description</label>
            <textarea id="task-desc" className="input" placeholder="Add details…" rows={3} {...register('description')} />
          </div>

          {/* Priority */}
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label">Priority</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PRIORITIES.map(p => {
                const { ref, ...rest } = register('priority')
                return (
                  <label key={p.value} style={{ flex: 1, cursor: 'pointer' }}>
                    <input type="radio" value={p.value} ref={ref} {...rest} style={{ display: 'none' }} />
                    <div
                      style={{
                        padding: '8px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        background: p.bg, color: p.color,
                        border: '2px solid transparent',
                        transition: 'border-color 150ms ease',
                      }}
                    >
                      {p.label}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Due date + time */}
          <div className="form-row" style={{ marginBottom: '16px' }}>
            <div className="form-field">
              <label className="label" htmlFor="task-due-date">Due Date</label>
              <input id="task-due-date" type="date" className="input" {...register('dueDate')} />
            </div>
            <div className="form-field">
              <label className="label" htmlFor="task-due-time">Due Time</label>
              <input id="task-due-time" type="time" className="input" {...register('dueTime')} />
            </div>
          </div>

          {/* Tags */}
          <div className="form-field" style={{ marginBottom: '24px' }}>
            <label className="label" htmlFor="task-tags">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', minHeight: '44px' }}>
              {tags.map(tag => (
                <span key={tag} className="chip" style={{ background: 'var(--color-lavender)', color: 'var(--color-lavender-deep)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }} aria-label={`Remove tag ${tag}`}>×</button>
                </span>
              ))}
              <input
                id="task-tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', flex: 1, minWidth: '80px' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} id="task-form-submit">
              {isLoading ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
