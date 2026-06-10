'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface TopbarProps {
  session: {
    user: { id: string; name: string; email: string; role: string }
  }
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/tasks':              'My Tasks',
  '/tasks/board':        'Task Board',
  '/finance':            'Finance',
  '/finance/summary':    'Finance Summary',
  '/budget':             'Budget Goals',
  '/settings':           'Settings',
  '/admin':              'Admin Overview',
  '/admin/users':        'User Management',
  '/admin/categories':   'Categories',
}

export default function Topbar({ session }: TopbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useAppStore()

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'TaskFinance'

  const avatarInitial = session.user.name?.[0]?.toUpperCase() ?? 'U'

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
    const html = document.documentElement
    if (next === 'dark') html.setAttribute('data-theme', 'dark')
    else if (next === 'light') html.setAttribute('data-theme', 'light')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
  }

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Page title */}
      <h1 className="text-h2" style={{ flex: 1, color: 'var(--text-primary)', margin: 0 }}>
        {pageTitle}
      </h1>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <button className="btn btn-ghost btn-icon" aria-label="Search" id="topbar-search">
          <Search size={18} />
        </button>

        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={cycleTheme}
          aria-label={`Switch theme (current: ${theme})`}
          id="theme-toggle"
          title={`Theme: ${theme}`}
        >
          {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />}
        </button>

        {/* Notification bell */}
        <button className="btn btn-ghost btn-icon" aria-label="Notifications" id="notifications-bell">
          <Bell size={18} />
        </button>

        {/* User avatar */}
        <div
          style={{
            width: '36px', height: '36px',
            background: 'var(--color-lavender)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600,
            color: 'var(--color-lavender-deep)',
            cursor: 'pointer',
            border: '2px solid var(--color-lavender-mid)',
          }}
          title={session.user.name}
          aria-label={`User: ${session.user.name}`}
        >
          {avatarInitial}
        </div>
      </div>
    </header>
  )
}
