'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckSquare, Wallet, Target, Plus, ArrowRight, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { resolveTaskStatus } from '@/lib/utils/taskStatus'
import { getDueDateLabel } from '@/lib/utils/formatDate'
import toast from 'react-hot-toast'

interface Props {
  session: { user: { id: string; name: string; role: string } }
  stats: {
    completedToday: number
    dueToday: number
    todaySpend: number
    monthSpend: number
    budgetGoal: number
    budgetRemaining: number
    budgetPercentage: number
  }
  todayTasks: Array<{ id: string; title: string; status: string; dueDate?: Date | string | null; priority: string }>
  todayEntries: Array<{ id: string; title: string; amount: number; type: string; category: { name: string; colorBg: string; colorText: string } }>
  categories: Array<{ id: string; name: string; colorBg: string; colorText: string }>
}

export default function DashboardClient({ session, stats, todayTasks, todayEntries, categories }: Props) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickTitle, setQuickTitle] = useState('')
  const [quickCategory, setQuickCategory] = useState('')
  const [tasks, setTasks] = useState(todayTasks)
  const [entries, setEntries] = useState(todayEntries)
  const [creatingTask, setCreatingTask] = useState(false)
  const [creatingEntry, setCreatingEntry] = useState(false)

  // Hydration safety for local date/time
  const [greeting, setGreeting] = useState('day')
  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    const hours = new Date().getHours()
    const greet = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening'
    setGreeting(greet)
    setFormattedDate(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  const budgetPct = Math.min(stats.budgetPercentage, 110)
  const budgetStatus = budgetPct <= 60 ? 'on-track' : budgetPct <= 80 ? 'watch' : budgetPct <= 100 ? 'near' : 'over'
  const budgetLabel = { 'on-track': 'On track ✓', watch: 'Watch spending', near: 'Near limit ⚠️', over: 'Over budget 🚨' }[budgetStatus]
  const budgetColor = { 'on-track': 'var(--color-mint-deep)', watch: 'var(--color-lemon-deep)', near: 'var(--color-peach-deep)', over: 'var(--color-rose-deep)' }[budgetStatus]
  const budgetBarClass = { 'on-track': 'progress-fill-on-track', watch: 'progress-fill-watch', near: 'progress-fill-near', over: 'progress-fill-over' }[budgetStatus]

  const addTask = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !newTaskTitle.trim()) return
    setCreatingTask(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim(), priority: 'MEDIUM', dueDate: new Date().toISOString().split('T')[0] }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setTasks(prev => [data, ...prev])
        setNewTaskTitle('')
        toast.success('Task added!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
      }
    } finally {
      setCreatingTask(false)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  const addEntry = async () => {
    if (!quickTitle.trim() || !quickAmount || !quickCategory) {
      toast.error('Fill in title, amount, and category')
      return
    }
    setCreatingEntry(true)
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle.trim(),
          amount: parseFloat(quickAmount),
          categoryId: quickCategory,
          type: 'EXPENSE',
          date: new Date().toISOString().split('T')[0],
        }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setEntries(prev => [data, ...prev])
        setQuickTitle(''); setQuickAmount(''); setQuickCategory('')
        toast.success('Entry added!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
      }
    } finally {
      setCreatingEntry(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="text-display" style={{ color: 'var(--text-primary)' }}>
          Good {greeting}, {session.user.name.split(' ')[0]} 👋
        </h1>
        {formattedDate && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '4px' }}>
            {formattedDate}
          </p>
        )}
      </div>

      {/* Stat Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {/* Tasks stat */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--color-lavender)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} color="var(--color-lavender-deep)" />
            </div>
            {/* Circular progress */}
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-default)" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-lavender-deep)" strokeWidth="4"
                strokeDasharray={`${stats.dueToday > 0 ? (stats.completedToday / stats.dueToday) * 113 : 0} 113`}
                strokeLinecap="round" transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dasharray 600ms ease' }}
              />
              <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-lavender-deep)">
                {stats.completedToday}/{stats.dueToday}
              </text>
            </svg>
          </div>
          <p className="text-display" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>
            {stats.completedToday}<span style={{ fontSize: '16px', color: 'var(--text-tertiary)', fontWeight: 400 }}>/{stats.dueToday}</span>
          </p>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>tasks completed today</p>
        </div>

        {/* Today's spend */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--color-peach)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <TrendingDown size={20} color="var(--color-peach-deep)" />
          </div>
          <p className="text-display" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>{formatCurrency(stats.todaySpend)}</p>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>spent today</p>
        </div>

        {/* Budget remaining */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: stats.budgetRemaining >= 0 ? 'var(--color-mint)' : 'var(--color-rose)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color={stats.budgetRemaining >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)'} />
            </div>
            <span className="chip" style={{ background: budgetColor + '22', color: budgetColor, fontSize: '10px' }}>
              {budgetLabel}
            </span>
          </div>
          <p className="text-display" style={{ color: stats.budgetRemaining >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)', lineHeight: 1 }}>
            {formatCurrency(Math.abs(stats.budgetRemaining))}
          </p>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {stats.budgetRemaining >= 0 ? 'remaining this month' : 'over budget'}
          </p>
          {/* Mini progress */}
          <div className="progress-track" style={{ marginTop: '12px', height: '4px' }}>
            <div className={`progress-fill ${budgetBarClass}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px' }} className="dashboard-grid">
        {/* Tasks Panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckSquare size={18} color="var(--color-lavender-deep)" />
              <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Today&apos;s Tasks</h2>
              {tasks.length > 0 && (
                <span className="chip" style={{ background: 'var(--color-lavender)', color: 'var(--color-lavender-deep)' }}>
                  {tasks.length}
                </span>
              )}
            </div>
            <Link href="/tasks" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-lavender-deep)', textDecoration: 'none', fontWeight: 500 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick add */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
            <input
              className="input"
              style={{ height: '40px', flex: 1 }}
              placeholder="Add a task… press Enter"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={addTask}
              disabled={creatingTask}
              id="quick-add-task"
            />
            <button className="btn btn-secondary btn-icon" aria-label="Add task" title="Press Enter in the field">
              <Plus size={16} />
            </button>
          </div>

          {/* Task list */}
          <div style={{ padding: '8px 24px 20px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                <CheckSquare size={40} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>No tasks for today — add one above!</p>
              </div>
            ) : (
              tasks.map(task => {
                const status = resolveTaskStatus(task)
                const { label: dateLabel, variant } = getDueDateLabel(task.dueDate)
                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Priority dot */}
                    <div className={`priority-dot priority-dot-${task.priority.toLowerCase()}`} />
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id, status)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                        border: status === 'COMPLETED' ? 'none' : '2px solid var(--border-default)',
                        background: status === 'COMPLETED' ? 'var(--color-lavender-deep)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 200ms ease',
                      }}
                      aria-label={status === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {status === 'COMPLETED' && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px', fontWeight: 500,
                        color: status === 'COMPLETED' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: status === 'COMPLETED' ? 'line-through' : 'none',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}>
                        {task.title}
                      </p>
                    </div>
                    {/* Due date chip */}
                    {variant && (
                      <span className={`chip chip-${variant === 'overdue' ? 'overdue' : variant === 'today' ? 'today' : variant === 'tomorrow' ? 'tomorrow' : 'future'}`}>
                        {dateLabel}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Finance Panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wallet size={18} color="var(--color-lavender-deep)" />
              <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Today&apos;s Spending</h2>
            </div>
            <span className="text-h3" style={{ color: 'var(--color-lavender-deep)' }}>
              {formatCurrency(stats.todaySpend)}
            </span>
          </div>

          {/* Quick add finance */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" style={{ height: '36px', flex: 1 }} placeholder="Title" value={quickTitle} onChange={e => setQuickTitle(e.target.value)} id="quick-finance-title" />
              <input className="input" style={{ height: '36px', width: '90px' }} placeholder="₹ Amount" type="number" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} id="quick-finance-amount" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input" style={{ height: '36px', flex: 1 }} value={quickCategory} onChange={e => setQuickCategory(e.target.value)} id="quick-finance-category">
                <option value="">Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={addEntry} disabled={creatingEntry}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Entry list */}
          <div style={{ padding: '8px 24px 16px', flex: 1 }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)' }}>
                <Wallet size={36} strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px' }}>No expenses today</p>
              </div>
            ) : (
              entries.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="chip" style={{ background: entry.category.colorBg, color: entry.category.colorText, flexShrink: 0 }}>
                    {entry.category.name}
                  </span>
                  <p style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {entry.title}
                  </p>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: entry.type === 'INCOME' ? 'var(--color-mint-deep)' : 'var(--color-lavender-deep)', flexShrink: 0 }}>
                    {entry.type === 'INCOME' ? '+' : ''}{formatCurrency(Number(entry.amount))}
                  </span>
                </div>
              ))
            )}
            {entries.length > 0 && (
              <Link href="/finance" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-lavender-deep)', textDecoration: 'none', fontWeight: 500, marginTop: '12px' }}>
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Budget bar */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-input)', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Monthly budget</span>
              <span className="text-label" style={{ color: budgetColor, fontWeight: 600 }}>{budgetLabel}</span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${budgetBarClass}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(stats.monthSpend)} spent</span>
              <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(stats.budgetGoal)} goal</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .dashboard-grid > div:first-child { display: block; }
          [style*="gridTemplateColumns: 'repeat(3, 1fr'"] { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </div>
  )
}
