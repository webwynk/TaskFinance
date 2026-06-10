'use client'

import { useState } from 'react'
import { User, Lock, Palette, Target, Download, Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import toast from 'react-hot-toast'

interface Props {
  user: { name: string; email: string; role: string; budgetGoal?: any }
  session: { user: { id: string; role: string } }
}

export default function SettingsClient({ user, session }: Props) {
  const { theme, setTheme } = useAppStore()
  const [name, setName] = useState(user.name)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [budgetGoal, setBudgetGoal] = useState(user.budgetGoal ? String(user.budgetGoal) : '')
  const [saving, setSaving] = useState('')

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t)
    const html = document.documentElement
    if (t === 'dark') html.setAttribute('data-theme', 'dark')
    else if (t === 'light') html.setAttribute('data-theme', 'light')
    else html.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  const saveName = async () => {
    if (!name.trim()) return
    setSaving('name')
    const res = await fetch(`/api/users/${session.user.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setSaving('')
    if (res.ok) toast.success('Name updated!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
    else toast.error('Failed to update name')
  }

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('Fill all fields'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 chars'); return }
    setSaving('password')
    const res = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    setSaving('')
    if (res.ok) {
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      toast.success('Password changed!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
    } else {
      const { error } = await res.json()
      toast.error(error || 'Failed to change password')
    }
  }

  const saveBudget = async () => {
    const amount = parseFloat(budgetGoal)
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return }
    setSaving('budget')
    const res = await fetch('/api/budget', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalAmount: amount }),
    })
    setSaving('')
    if (res.ok) toast.success('Budget goal updated!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
  }

  const exportCSV = async () => {
    const res = await fetch('/api/finance?period=all&order=desc')
    if (!res.ok) return
    const { data } = await res.json()
    const rows = [
      ['Date', 'Title', 'Category', 'Amount', 'Type', 'Description'],
      ...data.map((e: any) => [
        new Date(e.date).toLocaleDateString('en-IN'),
        e.title, e.category?.name ?? '', Number(e.amount), e.type, e.description ?? '',
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'taskfinance-finance.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded!')
  }

  const THEMES: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px' }}>
      <h1 className="text-h1" style={{ color: 'var(--text-primary)', marginBottom: '28px' }}>Settings</h1>

      {/* Account */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={18} color="var(--color-lavender-deep)" />
          <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Account</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-field">
            <label className="label" htmlFor="settings-name">Name</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input id="settings-name" className="input" value={name} onChange={e => setName(e.target.value)} />
              <button className="btn btn-secondary" onClick={saveName} disabled={saving === 'name'}>{saving === 'name' ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
          <div className="form-field">
            <label className="label">Email</label>
            <input className="input" value={user.email} disabled style={{ opacity: 0.7 }} readOnly />
          </div>
          <div className="form-field">
            <label className="label">Role</label>
            <span className="chip" style={{ background: user.role === 'ADMIN' ? 'var(--color-lavender)' : 'var(--color-mint)', color: user.role === 'ADMIN' ? 'var(--color-lavender-deep)' : 'var(--color-mint-deep)', width: 'fit-content' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Lock size={18} color="var(--color-lavender-deep)" />
          <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Security</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label className="label" htmlFor="curr-pw">Current Password</label>
            <input id="curr-pw" type="password" className="input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="label" htmlFor="new-pw">New Password</label>
              <input id="new-pw" type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="form-field">
              <label className="label" htmlFor="confirm-pw">Confirm Password</label>
              <input id="confirm-pw" type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
            </div>
          </div>
          {newPw && (
            <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: newPw.length >= 12 ? '100%' : newPw.length >= 8 ? '66%' : '33%', background: newPw.length >= 12 ? 'var(--color-mint-deep)' : newPw.length >= 8 ? 'var(--color-lemon-deep)' : 'var(--color-rose-deep)', transition: 'all 200ms ease', borderRadius: 'var(--radius-full)' }} />
            </div>
          )}
          <button className="btn btn-primary" onClick={changePassword} disabled={saving === 'password'} style={{ width: 'fit-content' }}>
            {saving === 'password' ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Palette size={18} color="var(--color-lavender-deep)" />
          <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Preferences</h2>
        </div>
        <div className="form-field">
          <label className="label">Theme</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => applyTheme(value)}
                className={`btn ${theme === value ? 'btn-primary' : 'btn-ghost'}`}
                id={`theme-${value}`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Target size={18} color="var(--color-lavender-deep)" />
          <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Budget Goal</h2>
        </div>
        <div className="form-field">
          <label className="label" htmlFor="settings-budget">Monthly budget (₹)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontWeight: 500 }}>₹</span>
              <input id="settings-budget" type="number" className="input" value={budgetGoal} onChange={e => setBudgetGoal(e.target.value)} placeholder="10000" style={{ paddingLeft: '32px' }} />
            </div>
            <button className="btn btn-secondary" onClick={saveBudget} disabled={saving === 'budget'}>{saving === 'budget' ? 'Saving…' : 'Set goal'}</button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Download size={18} color="var(--color-lavender-deep)" />
          <h2 className="text-h3" style={{ color: 'var(--text-primary)' }}>Data Export</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Download all your finance entries as a CSV file.
        </p>
        <button className="btn btn-ghost" onClick={exportCSV} id="export-csv-btn">
          <Download size={16} /> Export Finance Data (CSV)
        </button>
      </div>
    </div>
  )
}
