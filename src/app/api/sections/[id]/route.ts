import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить раздел по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const section = await prisma.section.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              avatar: true,
              avatarColor: true,
            }
          },
          introBlocks: {
            orderBy: { sortOrder: 'asc' }
          },
          remarks: {
            include: {
              comments: {
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            }
          }
        }
      })

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Раздел не найден' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, section })
    } catch (error) {
      console.error('Get section error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения раздела' },
        { status: 500 }
      )
    }
  })
}

// Обновить раздел
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()

      const existingSection = await prisma.section.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!existingSection) {
        return NextResponse.json(
          { success: false, error: 'Раздел не найден' },
          { status: 404 }
        )
      }

      // Проверяем права: админ, ГИП проекта или исполнитель раздела
      const isGip = existingSection.project.gipId === user.id
      const isAssignee = existingSection.assigneeId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip && !isAssignee) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      // Формируем данные для обновления
      const updateData: any = {}
      
      if (body.code !== undefined) updateData.code = body.code
      if (body.description !== undefined) updateData.description = body.description
      if (body.status !== undefined) {
        updateData.status = body.status
        if (body.status === 'in_progress' && !existingSection.startedAt) {
          updateData.startedAt = new Date().toISOString()
        }
        if (body.status === 'completed') {
          updateData.completedAt = new Date().toISOString()
        }
      }
      if (body.expertiseStatus !== undefined) updateData.expertiseStatus = body.expertiseStatus
      if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId
      if (body.coAssignees !== undefined) updateData.coAssignees = body.coAssignees
      if (body.files !== undefined) updateData.files = body.files
      if (body.completedFile !== undefined) updateData.completedFile = body.completedFile
      if (body.completedFileName !== undefined) updateData.completedFileName = body.completedFileName

      const section = await prisma.section.update({
        where: { id },
        data: updateData,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
            }
          }
        }
      })

      return NextResponse.json({ success: true, section })
    } catch (error) {
      console.error('Update section error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления раздела' },
        { status: 500 }
      )
    }
  })
}

// Удалить раздел
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const section = await prisma.section.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Раздел не найден' },
          { status: 404 }
        )
      }

      // Только админ или ГИП могут удалять разделы
      const isGip = section.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.section.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete section error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления раздела' },
        { status: 500 }
      )
    }
  })
}
