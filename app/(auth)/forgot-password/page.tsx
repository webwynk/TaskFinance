import type { Metadata } from 'next'
import ForgotPasswordForm from '@/app/(auth)/forgot-password/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link',
}

export default function ForgotPasswordPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'var(--color-lavender)',
          opacity: 0.5,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--color-mint)',
          opacity: 0.4,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <ForgotPasswordForm />
    </main>
  )
}
