import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Создать новое изыскание
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const body = await request.json()
      const {
        projectId,
        standardId,
        customName,
        contractorName,
        contractorContact,
        contractorPhone,
        contractorEmail,
        contractNumber,
        contractDate,
        contractFile,
        contractFileName,
        startDate,
        endDate,
        description
      } = body

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

      // Если есть standardId, получаем название из справочника
      let name = customName
      if (standardId) {
        const standard = await prisma.standardInvestigation.findUnique({
          where: { id: standardId }
        })
        if (standard) {
          name = standard.name
        }
      }

      const investigation = await prisma.investigation.create({
        data: {
          projectId,
          standardId: standardId || null,
          customName: name,
          isCustom: !standardId,
          contractorName,
          contractorContact,
          contractorPhone,
          contractorEmail,
          contractNumber,
          contractDate,
          contractFile,
          contractFileName,
          startDate,
          endDate,
          description,
        }
      })

      return NextResponse.json({ success: true, investigation })
    } catch (error) {
      console.error('Create investigation error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания изыскания' },
        { status: 500 }
      )
    }
  })
}
