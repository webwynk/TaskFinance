import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Brand pastels
        lavender: {
          DEFAULT: 'var(--color-lavender)',
          mid: 'var(--color-lavender-mid)',
          deep: 'var(--color-lavender-deep)',
        },
        mint: {
          DEFAULT: 'var(--color-mint)',
          deep: 'var(--color-mint-deep)',
        },
        peach: {
          DEFAULT: 'var(--color-peach)',
          deep: 'var(--color-peach-deep)',
        },
        rose: {
          DEFAULT: 'var(--color-rose)',
          deep: 'var(--color-rose-deep)',
        },
        sky: {
          DEFAULT: 'var(--color-sky)',
          deep: 'var(--color-sky-deep)',
        },
        lemon: {
          DEFAULT: 'var(--color-lemon)',
          deep: 'var(--color-lemon-deep)',
        },
        // Semantic
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        'surface-raised': 'var(--bg-surface-raised)',
        sidebar: 'var(--bg-sidebar)',
        input: 'var(--bg-input)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        border: 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'border-focus': 'var(--border-focus)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        button: 'var(--shadow-button)',
      },
      transitionDuration: {
        fast: '120',
        base: '200',
        slow: '300',
      },
    },
  },
  plugins: [],
}

export default config
