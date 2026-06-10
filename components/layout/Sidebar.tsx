'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, CheckSquare, Wallet, Target, Settings,
  ShieldCheck, Users, Tag, ChevronLeft, ChevronRight, LogOut,
  CheckSquare as Logo,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface SidebarProps {
  session: {
    user: { id: string; name: string; email: string; role: string }
  }
}

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks',            label: 'Tasks',     icon: CheckSquare },
  { href: '/finance',          label: 'Finance',   icon: Wallet },
  { href: '/budget',           label: 'Budget',    icon: Target },
  { href: '/settings',         label: 'Settings',  icon: Settings },
]

const ADMIN_NAV_ITEMS = [
  { href: '/admin',            label: 'Admin',      icon: ShieldCheck },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
]

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const isAdmin = session.user.role === 'ADMIN'

  const avatarInitial = session.user.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: sidebarCollapsed ? '64px' : '240px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}
      className="sidebar-desktop"
    >
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '20px 0' : '20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: '64px',
      }}>
        {!sidebarCollapsed && (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--color-lavender)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Logo size={16} color="var(--color-lavender-deep)" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              TaskFinance
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon"
          style={{ flexShrink: 0 }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${isActive ? ' active' : ''}`}
                title={sidebarCollapsed ? label : undefined}
                style={{
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '10px 0' : '10px 12px',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div style={{
                height: '1px', background: 'var(--border-subtle)',
                margin: '8px 4px',
              }} />
              {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-item${isActive ? ' active' : ''}`}
                    title={sidebarCollapsed ? label : undefined}
                    style={{
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      padding: sidebarCollapsed ? '10px 0' : '10px 12px',
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </nav>

      {/* User + Sign out */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {!sidebarCollapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '4px',
          }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--color-lavender)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--color-lavender-deep)',
              flexShrink: 0,
            }}>
              {avatarInitial}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {session.user.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="nav-item"
          style={{
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? '10px 0' : '10px 12px',
            color: 'var(--color-rose-deep)',
            width: '100%',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
          aria-label="Sign out"
          title={sidebarCollapsed ? 'Sign out' : undefined}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Hide on mobile */}
      <style>{`
        @media (max-width: 767px) { .sidebar-desktop { display: none !important; } }
      `}</style>
    </aside>
  )
}
