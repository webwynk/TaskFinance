'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

interface DashboardShellProps {
  children: React.ReactNode
  session: {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

export default function DashboardShell({ children, session }: DashboardShellProps) {
  const { theme, sidebarCollapsed } = useAppStore()

  // Apply theme on mount and when it changes
  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark')
    } else if (theme === 'light') {
      html.setAttribute('data-theme', 'light')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
  }, [theme])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar — desktop/tablet */}
      <Sidebar session={session} />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: sidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 200ms ease',
        }}
        className="dashboard-main"
      >
        <Topbar session={session} />
        <main
          style={{
            flex: 1,
            padding: '24px 32px',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
          }}
          className="dashboard-content"
        >
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav session={session} />

      {/* Responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1279px) {
          .dashboard-main { margin-left: 64px !important; }
        }
        @media (max-width: 767px) {
          .dashboard-main { margin-left: 0 !important; }
          .dashboard-content { padding: 16px !important; padding-bottom: 80px !important; }
        }
      ` }} />
    </div>
  )
}
