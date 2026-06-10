'use client'

import { useState } from 'react'
import { Plus, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils/formatDate'

interface User {
  id: string; name: string; email: string; role: string; isActive: boolean
  budgetGoal?: any; createdAt: Date
  _count: { tasks: number; financeEntries: number }
}

interface Props {
  users: User[]
  currentUserId: string
}

export default function AdminUsersClient({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', budgetGoal: '' })
  const [creating, setCreating] = useState(false)

  const toggleActive = async (userId: string, current: boolean) => {
    if (userId === currentUserId) { toast.error("You can't deactivate yourself"); return }
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u))
      toast.success(!current ? 'User activated' : 'User deactivated')
    }
  }

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Role updated')
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, password required'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budgetGoal: form.budgetGoal ? parseFloat(form.budgetGoal) : undefined }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setUsers(prev => [{ ...data, _count: { tasks: 0, financeEntries: 0 } }, ...prev])
        setShowCreate(false)
        setForm({ name: '', email: '', password: '', role: 'USER', budgetGoal: '' })
        toast.success('User created!', { style: { background: 'var(--color-mint)', color: 'var(--color-mint-deep)' } })
      } else {
        const { error } = await res.json()
        toast.error(error || 'Failed')
      }
    } finally { setCreating(false) }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>User Management</h1>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>{users.length} users total</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} id="create-user-btn">
          <Plus size={15} /> Create User
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Tasks</th>
              <th>Entries</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--color-lavender-deep)', flexShrink: 0 }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => changeRole(user.id, e.target.value)}
                    style={{ fontSize: '13px', background: user.role === 'ADMIN' ? 'var(--color-lavender)' : 'var(--bg-input)', color: user.role === 'ADMIN' ? 'var(--color-lavender-deep)' : 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
                    disabled={user.id === currentUserId}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td><span className="chip" style={{ background: 'var(--color-lavender)', color: 'var(--color-lavender-deep)' }}>{user._count.tasks}</span></td>
                <td><span className="chip" style={{ background: 'var(--color-sky)', color: 'var(--color-sky-deep)' }}>{user._count.financeEntries}</span></td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>{formatDate(user.createdAt)}</td>
                <td>
                  <span className={`chip ${user.isActive ? 'chip-complete' : 'chip-overdue'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => toggleActive(user.id, user.isActive)}
                    disabled={user.id === currentUserId}
                    style={{ background: user.isActive ? 'var(--color-rose)' : 'var(--color-mint)', color: user.isActive ? 'var(--color-rose-deep)' : 'var(--color-mint-deep)', fontSize: '12px' }}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="modal-content animate-scale-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="text-h2" style={{ color: 'var(--text-primary)' }}>Create User</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={createUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div className="form-field">
                  <label className="label" htmlFor="new-user-name">Name *</label>
                  <input id="new-user-name" className="input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="label" htmlFor="new-user-email">Email *</label>
                  <input id="new-user-email" type="email" className="input" placeholder="user@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="label" htmlFor="new-user-password">Password *</label>
                  <input id="new-user-password" type="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="label" htmlFor="new-user-role">Role</label>
                    <select id="new-user-role" className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="label" htmlFor="new-user-budget">Budget Goal (₹)</label>
                    <input id="new-user-budget" type="number" className="input" placeholder="10000" value={form.budgetGoal} onChange={e => setForm(f => ({ ...f, budgetGoal: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} id="create-user-submit">
                  {creating ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
