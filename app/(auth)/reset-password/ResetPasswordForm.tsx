'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Check } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type ResetForm = z.infer<typeof resetSchema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const newPassword = watch('password', '')

  // Password strength check
  const hasMinLen = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)

  const strengthCount = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
  const strengthLabel = strengthCount <= 2 ? 'Weak' : strengthCount <= 4 ? 'Medium' : 'Strong'
  const strengthColor = strengthCount <= 2 ? 'var(--color-rose-deep)' : strengthCount <= 4 ? 'var(--color-lemon-deep)' : 'var(--color-mint-deep)'

  useEffect(() => {
    if (!success) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [success, router])

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error('Reset token is missing')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth-custom/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }

      toast.success('Password reset successfully!', {
        style: {
          background: 'var(--color-mint)',
          color: 'var(--color-mint-deep)',
          border: '1px solid var(--color-mint-deep)',
        },
      })
      setSuccess(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong', {
        style: {
          background: 'var(--color-rose)',
          color: 'var(--color-rose-deep)',
          border: '1px solid var(--color-rose-deep)',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: 'var(--color-rose-deep)', marginBottom: '16px' }}>⚠️</div>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            This password reset link is invalid or has expired. Please request a new link.
          </p>
          <Link href="/forgot-password" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
      <div className="card animate-fade-in" style={{ padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <Image
              src="/logo.png"
              alt="TaskFinance Logo"
              width={44}
              height={44}
              style={{
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <span style={{
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>TaskFinance</span>
          </div>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '6px' }}>
            Set a strong new password for your account.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* New Password */}
            <div className="form-field" style={{ marginBottom: '16px' }}>
              <label className="label" htmlFor="reset-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input${errors.password ? ' error' : ''}`}
                  placeholder="At least 8 characters"
                  {...register('password')}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                    display: 'flex', padding: '4px'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="input-error-msg">{errors.password.message}</span>
              )}

              {/* Password strength bar */}
              {newPassword && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Password strength:</span>
                    <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '100%',
                          background: strengthCount >= level ? strengthColor : 'transparent',
                          transition: 'background 150ms ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field" style={{ marginBottom: '24px' }}>
              <label className="label" htmlFor="reset-confirm-password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input${errors.confirmPassword ? ' error' : ''}`}
                  placeholder="Repeat new password"
                  {...register('confirmPassword')}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                    display: 'flex', padding: '4px'
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="input-error-msg">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', background: 'var(--color-mint)', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              color: 'var(--color-mint-deep)'
            }}>
              <Check size={24} />
            </div>
            <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Success!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your password has been reset successfully. Redirecting you to login in {countdown} seconds…
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
              Sign In Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
