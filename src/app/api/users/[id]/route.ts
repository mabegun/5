import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Получить пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const user = await prisma.user.findUnique({
        where: { id },
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
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Пользователь не найден' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, user })
    } catch (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения пользователя' },
        { status: 500 }
      )
    }
  })
}

// Обновить пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()

      // Можно редактировать только себя или будучи админом
      const isSelf = user.id === id
      const isAdmin = user.role === 'admin'

      if (!isSelf && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      
      // Поля которые может редактировать пользователь
      if (body.name !== undefined) updateData.name = body.name
      if (body.position !== undefined) updateData.position = body.position
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.avatar !== undefined) updateData.avatar = body.avatar
      if (body.avatarColor !== undefined) updateData.avatarColor = body.avatarColor
      
      // Поля которые может редактировать только админ
      if (isAdmin) {
        if (body.role !== undefined) updateData.role = body.role
        if (body.competencies !== undefined) updateData.competencies = body.competencies
        if (body.isArchived !== undefined) {
          updateData.isArchived = body.isArchived
          if (body.archiveReason !== undefined) {
            updateData.archiveReason = body.archiveReason
          }
        }
      }

      // Смена пароля
      if (body.password) {
        updateData.password = await bcrypt.hash(body.password, 10)
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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
        }
      })

      return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
      console.error('Update user error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления пользователя' },
        { status: 500 }
      )
    }
  })
}

// Удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      // Только админы могут удалять пользователей
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const { id } = await params

      // Нельзя удалить себя
      if (user.id === id) {
        return NextResponse.json(
          { success: false, error: 'Нельзя удалить себя' },
          { status: 400 }
        )
      }

      await prisma.user.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete user error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления пользователя' },
        { status: 500 }
      )
    }
  })
}
