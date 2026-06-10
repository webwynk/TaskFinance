'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckSquare, Wallet, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/appStore'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { theme, setTheme } = useAppStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password. Please try again.', {
          style: {
            background: 'var(--color-rose)',
            color: 'var(--color-rose-deep)',
            border: '1px solid var(--color-rose-deep)',
          },
        })
      } else {
        toast.success('Welcome back! 👋', {
          style: {
            background: 'var(--color-mint)',
            color: 'var(--color-mint-deep)',
            border: '1px solid var(--color-mint-deep)',
          },
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
    // Apply immediately
    const html = document.documentElement
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    if (next === 'dark') html.setAttribute('data-theme', 'dark')
    else if (next === 'light') html.setAttribute('data-theme', 'light')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
      {/* Theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={cycleTheme}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle theme"
          title={`Current theme: ${theme}`}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Card */}
      <div className="card animate-fade-in" style={{ padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'var(--color-lavender)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                <CheckSquare size={14} color="var(--color-lavender-deep)" />
                <Wallet size={14} color="var(--color-mint-deep)" />
              </div>
            </div>
            <span style={{
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>TaskFinance</span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Daily clarity. Financial control.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className={`input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <span className="input-error-msg">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`input${errors.password ? ' error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  padding: '4px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="input-error-msg">{errors.password.message}</span>
            )}
          </div>

          {/* Remember me + Forgot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <input
                type="checkbox"
                style={{ accentColor: 'var(--color-lavender-deep)' }}
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              style={{
                fontSize: '13px',
                color: 'var(--color-lavender-deep)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%' }}
            id="login-submit"
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                  }}
                  className="animate-spin"
                />
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '12px',
        color: 'var(--text-tertiary)',
      }}>
        TaskFinance — Built for small teams
      </p>
    </div>
  )
}
