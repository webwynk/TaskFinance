'use client'

// Inlined script to prevent flash of wrong theme before React hydrates
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var store = JSON.parse(localStorage.getItem('taskfinance-store') || '{}');
        var theme = store.state?.theme || 'system';
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch(e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
