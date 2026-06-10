'use client'

import { useState } from 'react'
import { Edit3, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatMonthYear } from '@/lib/utils/formatDate'
import toast from 'react-hot-toast'

interface Props {
  budget: { goalAmount: number; spentAmount: number; month: number; year: number }
  history: Array<{ goalAmount: any; spentAmount: any; month: number; year: number }>
  categoryBreakdown: Array<{ category: { id: string; name: string; colorBg: string; colorText: string } | null; amount: number }>
}

export default function BudgetClient({ budget: initialBudget, history, categoryBreakdown }: Props) {
  const [budget, setBudget] = useState(initialBudget)
  const [editingGoal, setEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(String(budget.goalAmount))
  const [saving, setSaving] = useState(false)

  const pct = budget.goalAmount > 0 ? (budget.spentAmount / budget.goalAmount) * 100 : 0
  const pctClamped = Math.min(pct, 110)

  const statusInfo = pct <= 60
    ? { label: 'On track ✓', color: 'var(--color-mint-deep)', barClass: 'progress-fill-on-track' }
    : pct <= 80
    ? { label: 'Watch spending', color: 'var(--color-lemon-deep)', barClass: 'progress-fill-watch' }
    : pct <= 100
    ? { label: 'Near limit ⚠️', color: 'var(--color-peach-deep)', barClass: 'progress-fill-near' }
    : { label: 'Over budget 🚨', color: 'var(--color-rose-deep)', barClass: 'progress-fill-over' }

  const saveGoal = async () => {
    const amount = parseFloat(newGoal)
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalAmount: amount }),
      })
      if (res.ok) {
        setBudget(prev => ({ ...prev, goalAmount: amount }))
        setEditingGoal(false)
        toast.success('Budget goal updated!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-h1" style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>Budget Goals</h1>

      {/* Main budget card */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="text-label" style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              {formatMonthYear(budget.month, budget.year)}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="text-display" style={{ color: 'var(--text-primary)', fontSize: '36px' }}>
                {formatCurrency(budget.spentAmount)}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '16px' }}>
                of {formatCurrency(budget.goalAmount)} goal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p className="text-display" style={{ color: statusInfo.color, fontSize: '28px', fontWeight: 600 }}>
                {Math.round(pct * 10) / 10}%
              </p>
              <span className="chip" style={{ background: statusInfo.color + '22', color: statusInfo.color }}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track" style={{ height: '12px', marginBottom: '8px' }}>
          <div
            className={`progress-fill ${statusInfo.barClass}`}
            style={{ width: `${Math.min(pctClamped, 100)}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>₹0</span>
          <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(budget.goalAmount)}</span>
        </div>

        {/* Edit goal */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          {editingGoal ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>₹</span>
              <input
                type="number"
                className="input"
                style={{ width: '180px', height: '40px' }}
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                autoFocus
                id="budget-goal-input"
              />
              <button className="btn btn-primary btn-sm" onClick={saveGoal} disabled={saving}>
                <Check size={14} /> {saving ? 'Saving…' : 'Save goal'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingGoal(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingGoal(true)} id="edit-budget-btn">
              <Edit3 size={14} /> Edit monthly goal
            </button>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Spending by Category</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryBreakdown.map(({ category, amount }) => {
              if (!category) return null
              const catPct = budget.spentAmount > 0 ? (amount / budget.spentAmount) * 100 : 0
              return (
                <div key={category.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="chip" style={{ background: category.colorBg, color: category.colorText }}>{category.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span className="text-label" style={{ color: 'var(--text-tertiary)' }}>{Math.round(catPct)}%</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(amount)}</span>
                    </div>
                  </div>
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div style={{ height: '100%', width: `${catPct}%`, background: category.colorText, borderRadius: 'var(--radius-full)', transition: 'width 600ms ease-out' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Historical Performance</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Goal</th>
                <th>Spent</th>
                <th>% Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => {
                const p = Number(h.goalAmount) > 0 ? (Number(h.spentAmount) / Number(h.goalAmount)) * 100 : 0
                const st = p <= 60 ? '✓ On track' : p <= 80 ? '⚠ Watch' : p <= 100 ? '🔶 Near limit' : '🚨 Over budget'
                const sc = p <= 60 ? 'var(--color-mint-deep)' : p <= 80 ? 'var(--color-lemon-deep)' : p <= 100 ? 'var(--color-peach-deep)' : 'var(--color-rose-deep)'
                return (
                  <tr key={`${h.year}-${h.month}`}>
                    <td style={{ fontWeight: 500 }}>{formatMonthYear(h.month, h.year)}</td>
                    <td>{formatCurrency(Number(h.goalAmount))}</td>
                    <td>{formatCurrency(Number(h.spentAmount))}</td>
                    <td style={{ fontWeight: 600, color: sc }}>{Math.round(p)}%</td>
                    <td><span style={{ color: sc, fontSize: '13px' }}>{st}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
