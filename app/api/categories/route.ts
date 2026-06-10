import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.financeCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ data: categories })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const body = await req.json()
  const { name, colorBg, colorText, icon } = body

  if (!name?.trim() || !colorBg || !colorText) {
    return NextResponse.json({ error: 'Name, colorBg, and colorText are required' }, { status: 400 })
  }

  const category = await prisma.financeCategory.create({
    data: {
      name: name.trim(),
      colorBg,
      colorText,
      icon: icon ?? null,
      isActive: true,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ data: category, message: 'Category created' }, { status: 201 })
}
