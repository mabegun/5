import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить все экспертизы проекта
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const projectId = searchParams.get('projectId')

      if (!projectId) {
        return NextResponse.json(
          { success: false, error: 'projectId обязателен' },
          { status: 400 }
        )
      }

      const expertises = await prisma.expertise.findMany({
        where: { projectId },
        include: {
          remarks: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ success: true, expertises })
    } catch (error) {
      console.error('Get expertises error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения экспертиз' },
        { status: 500 }
      )
    }
  })
}

// Создать экспертизу
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const body = await request.json()
      const { projectId, stageName, experts, startDate, endDate, files } = body

      if (!projectId) {
        return NextResponse.json(
          { success: false, error: 'projectId обязателен' },
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

      const expertise = await prisma.expertise.create({
        data: {
          projectId,
          stageName,
          experts: experts || null,
          startDate,
          endDate,
          files: files || null,
        }
      })

      return NextResponse.json({ success: true, expertise })
    } catch (error) {
      console.error('Create expertise error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания экспертизы' },
        { status: 500 }
      )
    }
  })
}
