import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Создать новый раздел
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const body = await request.json()
      const { projectId, code, description, assigneeId, coAssignees, status } = body

      if (!projectId || !code) {
        return NextResponse.json(
          { success: false, error: 'projectId и code обязательны' },
          { status: 400 }
        )
      }

      // Проверяем права
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Проект не найден' },
          { status: 404 }
        )
      }

      const isGip = project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const section = await prisma.section.create({
        data: {
          projectId,
          code,
          description: description || '',
          assigneeId: assigneeId || null,
          coAssignees: coAssignees || null,
          status: status || 'not_started',
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
            }
          }
        }
      })

      return NextResponse.json({ success: true, section })
    } catch (error) {
      console.error('Create section error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания раздела' },
        { status: 500 }
      )
    }
  })
}
