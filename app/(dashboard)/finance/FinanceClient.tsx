'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import toast from 'react-hot-toast'
import FinanceEntryForm from '@/components/finance/FinanceEntryForm'

interface Entry {
  id: string; title: string; description?: string | null; itemName?: string | null
  amount: number | string; type: string; date: Date; createdAt: Date
  category: { id: string; name: string; colorBg: string; colorText: string }
}

interface Props {
  initialEntries: Entry[]
  categories: Array<{ id: string; name: string; colorBg: string; colorText: string }>
}

const PERIOD_FILTERS = ['Today', 'This Week', 'This Month', 'All']
const TYPE_FILTERS = ['All', 'Expense', 'Income']

export default function FinanceClient({ initialEntries, categories }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [period, setPeriod] = useState('This Month')
  const [typeFilter, setTypeFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)

  const filtered = useMemo(() => {
    const now = new Date()
    return entries.filter(e => {
      const d = new Date(e.date)
      if (typeFilter !== 'All' && e.type.toLowerCase() !== typeFilter.toLowerCase()) return false
      if (categoryFilter !== 'ALL' && e.category.id !== categoryFilter) return false
      if (period === 'Today') return d.toDateString() === now.toDateString()
      if (period === 'This Week') {
        const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0)
        const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
        return d >= start && d <= end
      }
      if (period === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
  }, [entries, period, typeFilter, categoryFilter])

  // Totals
  const totalExpense = filtered.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + Number(e.amount), 0)
  const totalIncome = filtered.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + Number(e.amount), 0)

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const entry of filtered) {
      const key = new Date(entry.date).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(entry)
    }
    return Array.from(map.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  }, [filtered])

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success('Entry deleted')
    }
  }

  const onSaved = (entry: Entry) => {
    if (editEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
    } else {
      setEntries(prev => [entry, ...prev])
    }
    setShowForm(false)
    setEditEntry(null)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Finance</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditEntry(null); setShowForm(true) }} id="add-finance-btn">
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {/* Summary Banner */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '20px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Total Expenses</p>
          <p className="text-h2" style={{ color: 'var(--color-rose-deep)' }}>{formatCurrency(totalExpense)}</p>
        </div>
        {totalIncome > 0 && (
          <div>
            <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Total Income</p>
            <p className="text-h2" style={{ color: 'var(--color-mint-deep)' }}>{formatCurrency(totalIncome)}</p>
          </div>
        )}
        {totalIncome > 0 && (
          <div>
            <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Net</p>
            <p className="text-h2" style={{ color: totalIncome - totalExpense >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)' }}>
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        )}
        <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginLeft: 'auto', alignSelf: 'center' }}>
          {filtered.length} entries
        </p>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        {PERIOD_FILTERS.map(p => (
          <button key={p} className={`filter-pill${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
        {TYPE_FILTERS.map(t => (
          <button key={t} className={`filter-pill${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
        ))}
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
        <select
          className="input"
          style={{ height: '34px', padding: '0 12px', fontSize: '13px', width: 'auto' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          id="finance-category-filter"
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Entries grouped by date */}
      {grouped.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
          <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No entries yet</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '20px' }}>Start tracking your finances</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Entry
          </button>
        </div>
      ) : (
        grouped.map(([dateStr, dayEntries]) => {
          const dayTotal = dayEntries.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + Number(e.amount), 0)
          return (
            <div key={dateStr} style={{ marginBottom: '24px' }}>
              {/* Date header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                {dayTotal > 0 && <span style={{ fontSize: '13px', color: 'var(--color-rose-deep)', fontWeight: 600 }}>−{formatCurrency(dayTotal)}</span>}
              </div>

              {/* Entries */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {dayEntries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
                      borderBottom: idx < dayEntries.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                    className="entry-row"
                  >
                    {/* Category dot */}
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.category.colorText, flexShrink: 0 }} />
                    {/* Category chip */}
                    <span className="chip" style={{ background: entry.category.colorBg, color: entry.category.colorText, flexShrink: 0 }}>
                      {entry.category.name}
                    </span>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {entry.title}
                      </p>
                      {(entry.description || entry.itemName) && (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {entry.description}{entry.itemName && ` · ${entry.itemName}`}
                        </p>
                      )}
                    </div>
                    {/* Amount */}
                    <span style={{ fontSize: '15px', fontWeight: 600, color: entry.type === 'INCOME' ? 'var(--color-mint-deep)' : 'var(--color-lavender-deep)', flexShrink: 0 }}>
                      {entry.type === 'INCOME' ? '+' : ''}{formatCurrency(Number(entry.amount))}
                    </span>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', opacity: 0 }} className="entry-actions">
                      <button className="btn btn-ghost btn-icon" style={{ width: '30px', height: '30px' }} onClick={() => { setEditEntry(entry); setShowForm(true) }} aria-label="Edit entry">✏️</button>
                      <button className="btn btn-ghost btn-icon" style={{ width: '30px', height: '30px' }} onClick={() => deleteEntry(entry.id)} aria-label="Delete entry">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {showForm && (
        <FinanceEntryForm
          entry={editEntry}
          categories={categories}
          onClose={() => { setShowForm(false); setEditEntry(null) }}
          onSaved={onSaved}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .entry-row:hover .entry-actions { opacity: 1 !important; }
      ` }} />
    </div>
  )
}
