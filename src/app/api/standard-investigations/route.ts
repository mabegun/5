import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить список стандартных изысканий
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const investigations = await prisma.standardInvestigation.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })

      return NextResponse.json({ success: true, investigations })
    } catch (error) {
      console.error('Get standard investigations error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения изысканий' },
        { status: 500 }
      )
    }
  })
}

// Создать стандартное изыскание (только админ)
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const { name, description, sortOrder } = body

      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Название обязательно' },
          { status: 400 }
        )
      }

      const investigation = await prisma.standardInvestigation.create({
        data: {
          name,
          description,
          sortOrder: sortOrder || 0,
        }
      })

      return NextResponse.json({ success: true, investigation })
    } catch (error) {
      console.error('Create standard investigation error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания изыскания' },
        { status: 500 }
      )
    }
  })
}
