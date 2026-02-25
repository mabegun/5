import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Получить всех пользователей
export async function GET(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      // Только админы могут видеть всех пользователей
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          position: true,
          phone: true,
          avatar: true,
          avatarColor: true,
          role: true,
          competencies: true,
          isArchived: true,
          archiveReason: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ success: true, users })
    } catch (error) {
      console.error('Get users error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения пользователей' },
        { status: 500 }
      )
    }
  })
}

// Создать нового пользователя
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      // Только админы могут создавать пользователей
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const { email, password, name, position, phone, role, competencies } = body

      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Email, пароль и имя обязательны' },
          { status: 400 }
        )
      }

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Пользователь с таким email уже существует' },
          { status: 400 }
        )
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10)

      // Генерируем цвет аватара
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
      const avatarColor = colors[Math.floor(Math.random() * colors.length)]

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          position: position || null,
          phone: phone || null,
          role: role || 'employee',
          competencies: competencies || [],
          avatarColor,
        },
        select: {
          id: true,
          email: true,
          name: true,
          position: true,
          phone: true,
          role: true,
          competencies: true,
          avatarColor: true,
        }
      })

      return NextResponse.json({ success: true, user: newUser })
    } catch (error) {
      console.error('Create user error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания пользователя' },
        { status: 500 }
      )
    }
  })
}
