'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string; name: string; colorBg: string; colorText: string; icon?: string | null
  isActive: boolean; _count: { entries: number }
}

interface Props { categories: Category[] }

const COLOR_PRESETS = [
  { bg: '#EAE4F7', text: '#7C5CBF', label: 'Lavender' },
  { bg: '#DFF5EE', text: '#3BAB7A', label: 'Mint' },
  { bg: '#FDE8DF', text: '#D96B3F', label: 'Peach' },
  { bg: '#FCDEDE', text: '#C94040', label: 'Rose' },
  { bg: '#DCF0FB', text: '#2D87C0', label: 'Sky' },
  { bg: '#FEF7DC', text: '#B58A00', label: 'Lemon' },
]

export default function AdminCategoriesClient({ categories: initial }: Props) {
  const [categories, setCategories] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', colorBg: '#EAE4F7', colorText: '#7C5CBF', icon: '' })
  const [saving, setSaving] = useState(false)

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { data } = await res.json()
        setCategories(prev => [...prev, { ...data, _count: { entries: 0 } }])
        setShowCreate(false)
        setForm({ name: '', colorBg: '#EAE4F7', colorText: '#7C5CBF', icon: '' })
        toast.success('Category created!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
      } else {
        const { error } = await res.json()
        toast.error(error || 'Failed')
      }
    } finally { setSaving(false) }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c))
      toast.success(!current ? 'Category activated' : 'Category deactivated')
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Finance Categories</h1>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>{categories.length} categories</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} id="create-category-btn">
          <Plus size={15} /> New Category
        </button>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ padding: '16px', opacity: cat.isActive ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="chip" style={{ background: cat.colorBg, color: cat.colorText, fontSize: '13px' }}>
                {cat.icon && <span style={{ marginRight: '4px' }}>{cat.icon}</span>}
                {cat.name}
              </span>
              <span className={`chip ${cat.isActive ? 'chip-complete' : 'chip-overdue'}`} style={{ fontSize: '10px' }}>
                {cat.isActive ? 'Active' : 'Off'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
              {cat._count.entries} entries
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: cat.colorBg, border: `2px solid ${cat.colorText}` }} />
              <div style={{ flex: 1 }} />
              <button
                className="btn btn-sm"
                style={{ fontSize: '11px', height: '26px', background: cat.isActive ? 'var(--color-rose)' : 'var(--color-mint)', color: cat.isActive ? 'var(--color-rose-deep)' : 'var(--color-mint-deep)' }}
                onClick={() => toggleActive(cat.id, cat.isActive)}
              >
                {cat.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="text-h2" style={{ color: 'var(--text-primary)' }}>New Category</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={createCategory}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div className="form-row">
                  <div className="form-field">
                    <label className="label" htmlFor="cat-name">Name *</label>
                    <input id="cat-name" className="input" placeholder="e.g. Groceries" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="label" htmlFor="cat-icon">Icon (emoji)</label>
                    <input id="cat-icon" className="input" placeholder="🛒" maxLength={4} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="label">Color Preset</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {COLOR_PRESETS.map(({ bg, text, label }) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, colorBg: bg, colorText: text }))}
                        style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: bg,
                          border: form.colorBg === bg ? `3px solid ${text}` : '2px solid transparent',
                          cursor: 'pointer', transition: 'border-color 120ms ease',
                        }}
                        title={label}
                        aria-label={label}
                      />
                    ))}
                  </div>
                </div>
                {/* Preview */}
                <div>
                  <label className="label">Preview</label>
                  <span className="chip" style={{ background: form.colorBg, color: form.colorText, fontSize: '14px', height: '28px', padding: '0 12px' }}>
                    {form.icon} {form.name || 'Category Name'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="create-category-submit">
                  {saving ? 'Creating…' : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
