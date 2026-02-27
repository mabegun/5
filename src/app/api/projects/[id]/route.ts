import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить проект по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const project = await prisma.project.findUnique({
        where: { id },
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
              introBlocks: true,
            },
            orderBy: { createdAt: 'asc' }
          },
          investigations: {
            orderBy: { createdAt: 'asc' }
          },
          expertises: {
            include: {
              remarks: true,
            }
          },
          contacts: true,
          introBlocks: {
            orderBy: { sortOrder: 'asc' }
          },
        }
      })

      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Проект не найден' },
          { status: 404 }
        )
      }

      // Вычисляем прогресс
      const completedSections = project.sections.filter(s => s.status === 'completed').length
      const totalSections = project.sections.length
      const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

      const formattedProject = {
        id: project.id,
        name: project.name,
        code: project.code,
        address: project.address,
        description: project.description,
        type: project.type,
        deadline: project.deadline,
        customerContact: project.customerContact,
        customerPhone: project.customerPhone,
        status: project.status,
        expertise: project.expertise,
        gip: project.gip,
        gipId: project.gipId,
        archivedAt: project.archivedAt,
        archiveReason: project.archiveReason,
        positiveConclusionFile: project.positiveConclusionFile,
        positiveConclusionName: project.positiveConclusionName,
        sections: project.sections.map(s => ({
          id: s.id,
          code: s.code,
          description: s.description,
          status: s.status,
          expertiseStatus: s.expertiseStatus,
          assignee: s.assignee,
          assigneeId: s.assigneeId,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          files: s.files,
          completedFile: s.completedFile,
          completedFileName: s.completedFileName,
          introBlocks: s.introBlocks,
        })),
        investigations: project.investigations.map(inv => ({
          id: inv.id,
          name: inv.customName || '', // Будет заполнено из стандартного если есть
          standardId: inv.standardId,
          isCustom: inv.isCustom,
          status: inv.status,
          contractorName: inv.contractorName,
          contractorContact: inv.contractorContact,
          contractorPhone: inv.contractorPhone,
          contractorEmail: inv.contractorEmail,
          contractNumber: inv.contractNumber,
          contractDate: inv.contractDate,
          contractFile: inv.contractFile,
          contractFileName: inv.contractFileName,
          resultFile: inv.resultFile,
          resultFileName: inv.resultFileName,
          startDate: inv.startDate,
          endDate: inv.endDate,
          description: inv.description,
        })),
        expertises: project.expertises,
        contacts: project.contacts,
        introBlocks: project.introBlocks,
        progress,
        sectionsTotal: totalSections,
        sectionsCompleted: completedSections,
        createdAt: project.createdAt.toISOString(),
      }

      return NextResponse.json({ success: true, project: formattedProject })
    } catch (error) {
      console.error('Get project error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения проекта' },
        { status: 500 }
      )
    }
  })
}

// Обновить проект
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()

      // Проверяем существование проекта
      const existingProject = await prisma.project.findUnique({
        where: { id }
      })

      if (!existingProject) {
        return NextResponse.json(
          { success: false, error: 'Проект не найден' },
          { status: 404 }
        )
      }

      // Обновляем проект
      const project = await prisma.project.update({
        where: { id },
        data: {
          name: body.name,
          code: body.code,
          address: body.address,
          description: body.description,
          type: body.type,
          deadline: body.deadline,
          customerContact: body.customerContact,
          customerPhone: body.customerPhone,
          status: body.status,
          expertise: body.expertise,
          gipId: body.gipId,
        }
      })

      return NextResponse.json({ success: true, project })
    } catch (error) {
      console.error('Update project error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления проекта' },
        { status: 500 }
      )
    }
  })
}

// Удалить проект
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      // Только админы могут удалять проекты
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const { id } = await params

      await prisma.project.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete project error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления проекта' },
        { status: 500 }
      )
    }
  })
}
