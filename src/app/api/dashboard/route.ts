import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { searchParams } = new URL(request.url)
      const role = searchParams.get('role') || user.role

      // Базовая статистика для всех
      const [
        totalProjects,
        activeProjects,
        completedProjects,
        archivedProjects,
        totalUsers,
        totalSections,
        completedSections,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: 'in_work' } }),
        prisma.project.count({ where: { status: 'completed' } }),
        prisma.project.count({ where: { status: 'archived' } }),
        prisma.user.count({ where: { isArchived: false } }),
        prisma.section.count(),
        prisma.section.count({ where: { status: 'completed' } }),
      ])

      // Для ГИПа - его проекты
      let gipProjects: any[] = []
      if (user.role === 'gip') {
        gipProjects = await prisma.project.findMany({
          where: { gipId: user.id },
          include: {
            sections: {
              select: { id: true, status: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }

      // Для исполнителя - назначенные разделы
      let assignedSections: any[] = []
      if (user.role === 'employee') {
        assignedSections = await prisma.section.findMany({
          where: { assigneeId: user.id },
          include: {
            project: {
              select: { id: true, name: true, code: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }

      // Последние проекты для админа
      let recentProjects: any[] = []
      if (user.role === 'admin') {
        recentProjects = await prisma.project.findMany({
          include: {
            gip: {
              select: { id: true, name: true }
            },
            sections: {
              select: { id: true, status: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }

      // Форматируем данные
      const formatProject = (p: any) => {
        const completed = p.sections?.filter((s: any) => s.status === 'completed').length || 0
        const total = p.sections?.length || 0
        return {
          id: p.id,
          name: p.name,
          code: p.code,
          status: p.status,
          deadline: p.deadline,
          gip: p.gip,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          sectionsTotal: total,
          sectionsCompleted: completed,
        }
      }

      const formatSection = (s: any) => ({
        id: s.id,
        code: s.code,
        status: s.status,
        project: s.project,
        deadline: s.project?.deadline,
      })

      return NextResponse.json({
        success: true,
        dashboard: {
          stats: {
            totalProjects,
            activeProjects,
            completedProjects,
            archivedProjects,
            totalUsers,
            totalSections,
            completedSections,
            overallProgress: totalSections > 0 
              ? Math.round((completedSections / totalSections) * 100) 
              : 0,
          },
          gipProjects: gipProjects.map(formatProject),
          assignedSections: assignedSections.map(formatSection),
          recentProjects: recentProjects.map(formatProject),
        }
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения данных дашборда' },
        { status: 500 }
      )
    }
  })
}
