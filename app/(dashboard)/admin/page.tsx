import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, Wallet, CheckSquare, Tag, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { startOfMonth, endOfMonth } from 'date-fns'

export const metadata: Metadata = { title: 'Admin Overview' }

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const now = new Date()
  const [totalUsers, totalTasks, totalEntries, monthSpend] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.task.count(),
    prisma.financeEntry.count(),
    prisma.financeEntry.aggregate({
      where: { type: 'EXPENSE', date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
      _sum: { amount: true },
    }),
  ])

  const stats = [
    { label: 'Active Users', value: totalUsers, icon: Users, color: 'var(--color-lavender)', deepColor: 'var(--color-lavender-deep)', href: '/admin/users' },
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'var(--color-mint)', deepColor: 'var(--color-mint-deep)', href: '/tasks' },
    { label: 'Finance Entries', value: totalEntries, icon: Wallet, color: 'var(--color-sky)', deepColor: 'var(--color-sky-deep)', href: '/finance' },
    { label: 'Team Spend (Month)', value: formatCurrency(Number(monthSpend._sum.amount ?? 0)), icon: TrendingDown, color: 'var(--color-peach)', deepColor: 'var(--color-peach-deep)', href: null },
  ]

  return (
    <div className="animate-fade-in">
      <h1 className="text-h1" style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>Admin Overview</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }} className="admin-stats">
        {stats.map(({ label, value, icon: Icon, color, deepColor, href }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: color, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={deepColor} />
              </div>
            </div>
            <p className="text-display" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
            <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>{label}</p>
            {href && (
              <Link href={href} style={{ fontSize: '12px', color: deepColor, textDecoration: 'none', fontWeight: 500, marginTop: '8px', display: 'block' }}>
                View all →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Link href="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-lavender)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="var(--color-lavender-deep)" />
            </div>
            <div>
              <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '2px' }}>User Management</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Create, edit, and deactivate users</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/categories" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-mint)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={24} color="var(--color-mint-deep)" />
            </div>
            <div>
              <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '2px' }}>Finance Categories</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Manage expense categories and colors</p>
            </div>
          </div>
        </Link>
      </div>

      <style>{`
        @media (max-width: 1024px) { .admin-stats { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .admin-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
