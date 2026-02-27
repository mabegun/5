import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить все проекты
export async function GET(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      const gipId = searchParams.get('gip_id')

      // Формируем фильтры
      const where: any = {}
      
      if (status && status !== 'all') {
        where.status = status
      }
      
      if (gipId) {
        where.gipId = gipId
      }

      // Для сотрудников показываем только проекты где они назначены на разделы
      if (user.role === 'employee') {
        // Сотрудники видят все проекты (можно ограничить)
      }

      const projects = await prisma.project.findMany({
        where,
        include: {
          gip: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              avatar: true,
              avatarColor: true,
            }
          },
          sections: {
            select: {
              id: true,
              code: true,
              status: true,
              assigneeId: true,
            }
          },
          _count: {
            select: {
              sections: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Форматируем данные
      const formattedProjects = projects.map(project => {
        const completedSections = project.sections.filter(s => s.status === 'completed').length
        const inProgressSections = project.sections.filter(s => s.status === 'in_progress').length
        const totalSections = project._count.sections
        const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

        return {
          id: project.id,
          name: project.name,
          code: project.code,
          address: project.address,
          type: project.type,
          deadline: project.deadline,
          customerContact: project.customerContact,
          customerPhone: project.customerPhone,
          status: project.status,
          expertise: project.expertise,
          gip: project.gip,
          gipId: project.gipId,
          progress,
          sectionsTotal: totalSections,
          sectionsCompleted: completedSections,
          sectionsInProgress: inProgressSections,
          createdAt: project.createdAt.toISOString(),
        }
      })

      return NextResponse.json({ success: true, projects: formattedProjects })
    } catch (error) {
      console.error('Get projects error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения проектов' },
        { status: 500 }
      )
    }
  })
}

// Создать новый проект
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      // Только админы и ГИПы могут создавать проекты
      if (!['admin', 'gip'].includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const {
        name,
        code,
        address,
        description,
        type,
        deadline,
        customerContact,
        customerPhone,
        expertise,
        gipId,
        sections = []
      } = body

      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Название проекта обязательно' },
          { status: 400 }
        )
      }

      // Создаем проект
      const project = await prisma.project.create({
        data: {
          name,
          code,
          address,
          description,
          type: type || 'construction',
          deadline,
          customerContact,
          customerPhone,
          expertise: expertise || 'none',
          gipId: gipId || (user.role === 'gip' ? user.id : null),
        }
      })

      // Создаем разделы если переданы
      if (sections.length > 0) {
        await prisma.section.createMany({
          data: sections.map((section: any) => ({
            projectId: project.id,
            code: section.code,
            description: section.description || '',
            assigneeId: section.assigneeId || null,
          }))
        })
      }

      return NextResponse.json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          code: project.code,
        }
      })
    } catch (error) {
      console.error('Create project error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания проекта' },
        { status: 500 }
      )
    }
  })
}
