import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Return success even if email is not found to prevent user enumeration
      return NextResponse.json({
        message: 'If the email is registered, a reset link has been generated.',
      })
    }

    // Generate token and hashed token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExp: tokenExpiry,
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`

    // Log the link for local development
    console.log('\n=======================================')
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`)
    console.log(`Reset Link: ${resetUrl}`)
    console.log('=======================================\n')

    return NextResponse.json({
      message: 'If the email is registered, a reset link has been generated.',
      link: resetUrl, // Include in response for easy local testing
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
