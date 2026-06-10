'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Wallet, Target, MoreHorizontal } from 'lucide-react'

interface BottomNavProps {
  session: { user: { role: string } }
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { href: '/finance',   label: 'Finance',   icon: Wallet },
  { href: '/budget',    label: 'Budget',    icon: Target },
]

export default function BottomNav({ session }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="bottom-nav"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '100%',
              textDecoration: 'none',
              color: isActive ? 'var(--color-lavender-deep)' : 'var(--text-tertiary)',
              fontSize: '10px',
              fontWeight: 500,
              transition: 'color 120ms ease',
            }}
            aria-label={label}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.6}
              style={{ transition: 'all 120ms ease' }}
            />
            <span>{label}</span>
          </Link>
        )
      })}
      {/* More */}
      <Link
        href="/settings"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          height: '100%',
          textDecoration: 'none',
          color: pathname.startsWith('/settings') || pathname.startsWith('/admin') ? 'var(--color-lavender-deep)' : 'var(--text-tertiary)',
          fontSize: '10px',
          fontWeight: 500,
        }}
        aria-label="More"
      >
        <MoreHorizontal size={22} strokeWidth={1.6} />
        <span>More</span>
      </Link>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
      ` }} />
    </nav>
  )
}
