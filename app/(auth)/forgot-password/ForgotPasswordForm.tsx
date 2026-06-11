'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
})
type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to request reset link')
      }

      toast.success('Reset link generated!', {
        style: {
          background: 'var(--color-mint)',
          color: 'var(--color-mint-deep)',
          border: '1px solid var(--color-mint-deep)',
        },
      })
      setSuccess(true)
      if (result.link) {
        setResetLink(result.link)
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong', {
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
            Forgot Password
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '6px' }}>
            No worries! Enter your email and we'll help you reset it.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-field" style={{ marginBottom: '24px' }}>
              <label className="label" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {isLoading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-mint)',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--color-mint-deep)'
            }}>
              <Mail size={24} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A reset link has been generated. For local testing, you can access it via the console log or click below:
            </p>

            {resetLink && (
              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <a
                  href={resetLink}
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-lavender-deep)',
                    wordBreak: 'break-all',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  👉 Click to Reset Password 👈
                </a>
              </div>
            )}
            
            <button
              onClick={() => { setSuccess(false); setResetLink('') }}
              className="btn btn-ghost"
              style={{ marginTop: '20px', fontSize: '13px', gap: '8px' }}
            >
              <RefreshCw size={14} /> Try another email
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Link
            href="/login"
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
