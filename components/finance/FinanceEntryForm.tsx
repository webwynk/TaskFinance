'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FinanceEntryCreateSchema, type FinanceEntryCreate } from '@/lib/validations/finance.schema'
import toast from 'react-hot-toast'

interface Props {
  entry: any | null
  categories: Array<{ id: string; name: string; colorBg: string; colorText: string }>
  onClose: () => void
  onSaved: (entry: any) => void
}

export default function FinanceEntryForm({ entry, categories, onClose, onSaved }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(entry?.type ?? 'EXPENSE')
  const isEdit = !!entry?.id

  const { register, handleSubmit, formState: { errors } } = useForm<FinanceEntryCreate>({
    resolver: zodResolver(FinanceEntryCreateSchema) as any,
    defaultValues: {
      title: entry?.title ?? '',
      description: entry?.description ?? '',
      itemName: entry?.itemName ?? '',
      amount: entry?.amount ? Number(entry.amount) : undefined,
      categoryId: entry?.categoryId ?? entry?.category?.id ?? '',
      type: entry?.type ?? 'EXPENSE',
      date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: FinanceEntryCreate) => {
    setIsLoading(true)
    try {
      const url = isEdit ? `/api/finance/${entry!.id}` : '/api/finance'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type }),
      })
      if (!res.ok) throw new Error('Failed')
      const { data: saved } = await res.json()
      toast.success(isEdit ? 'Entry updated!' : 'Entry added!', {
        style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' }
      })
      onSaved(saved)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-h2" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Entry' : 'Add Finance Entry'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            {(['EXPENSE', 'INCOME'] as const).map(t => (
              <button
                key={t} type="button"
                onClick={() => setType(t)}
                style={{
                  flex: 1, height: '36px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 500,
                  background: type === t ? (t === 'EXPENSE' ? 'var(--color-rose-deep)' : 'var(--color-mint-deep)') : 'transparent',
                  color: type === t ? 'white' : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                }}
              >
                {t === 'EXPENSE' ? '🔴 Expense' : '🟢 Income'}
              </button>
            ))}
          </div>

          <div className="form-row" style={{ marginBottom: '16px' }}>
            <div className="form-field">
              <label className="label" htmlFor="fe-title">Title *</label>
              <input id="fe-title" className={`input${errors.title ? ' error' : ''}`} placeholder="e.g. Grocery run" {...register('title')} />
              {errors.title && <span className="input-error-msg">{errors.title.message}</span>}
            </div>
            <div className="form-field">
              <label className="label" htmlFor="fe-amount">Amount *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontWeight: 500 }}>₹</span>
                <input id="fe-amount" type="number" step="0.01" className={`input${errors.amount ? ' error' : ''}`} style={{ paddingLeft: '28px' }} placeholder="0.00" {...register('amount')} />
              </div>
              {errors.amount && <span className="input-error-msg">{errors.amount.message}</span>}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: '16px' }}>
            <div className="form-field">
              <label className="label" htmlFor="fe-category">Category *</label>
              <select id="fe-category" className={`input${errors.categoryId ? ' error' : ''}`} {...register('categoryId')}>
                <option value="">Select category…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="input-error-msg">{errors.categoryId.message}</span>}
            </div>
            <div className="form-field">
              <label className="label" htmlFor="fe-date">Date *</label>
              <input id="fe-date" type="date" className="input" {...register('date')} />
            </div>
          </div>

          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="fe-desc">Description</label>
            <input id="fe-desc" className="input" placeholder="Optional notes…" {...register('description')} />
          </div>

          <div className="form-field" style={{ marginBottom: '24px' }}>
            <label className="label" htmlFor="fe-item">Item name</label>
            <input id="fe-item" className="input" placeholder="Specific item (optional)" {...register('itemName')} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} id="finance-form-submit">
              {isLoading ? 'Saving…' : isEdit ? 'Save changes' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
