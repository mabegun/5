import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить изыскание по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const investigation = await prisma.investigation.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            }
          }
        }
      })

      if (!investigation) {
        return NextResponse.json(
          { success: false, error: 'Изыскание не найдено' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, investigation })
    } catch (error) {
      console.error('Get investigation error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения изыскания' },
        { status: 500 }
      )
    }
  })
}

// Обновить изыскание
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()

      const existingInv = await prisma.investigation.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!existingInv) {
        return NextResponse.json(
          { success: false, error: 'Изыскание не найдено' },
          { status: 404 }
        )
      }

      // Проверяем права
      const isGip = existingInv.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      
      if (body.customName !== undefined) updateData.customName = body.customName
      if (body.status !== undefined) updateData.status = body.status
      if (body.contractorName !== undefined) updateData.contractorName = body.contractorName
      if (body.contractorContact !== undefined) updateData.contractorContact = body.contractorContact
      if (body.contractorPhone !== undefined) updateData.contractorPhone = body.contractorPhone
      if (body.contractorEmail !== undefined) updateData.contractorEmail = body.contractorEmail
      if (body.contractNumber !== undefined) updateData.contractNumber = body.contractNumber
      if (body.contractDate !== undefined) updateData.contractDate = body.contractDate
      if (body.contractFile !== undefined) updateData.contractFile = body.contractFile
      if (body.contractFileName !== undefined) updateData.contractFileName = body.contractFileName
      if (body.resultFile !== undefined) updateData.resultFile = body.resultFile
      if (body.resultFileName !== undefined) updateData.resultFileName = body.resultFileName
      if (body.startDate !== undefined) updateData.startDate = body.startDate
      if (body.endDate !== undefined) updateData.endDate = body.endDate
      if (body.description !== undefined) updateData.description = body.description

      const investigation = await prisma.investigation.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({ success: true, investigation })
    } catch (error) {
      console.error('Update investigation error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления изыскания' },
        { status: 500 }
      )
    }
  })
}

// Удалить изыскание
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const investigation = await prisma.investigation.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!investigation) {
        return NextResponse.json(
          { success: false, error: 'Изыскание не найдено' },
          { status: 404 }
        )
      }

      // Только админ или ГИП могут удалять изыскания
      const isGip = investigation.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.investigation.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete investigation error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления изыскания' },
        { status: 500 }
      )
    }
  })
}
