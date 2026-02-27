import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Обновить замечание
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()
      const { status, content, number, sectionId, sectionCode } = body

      const remark = await prisma.expertiseRemark.findUnique({
        where: { id },
        include: { expertise: { include: { project: true } } }
      })

      if (!remark) {
        return NextResponse.json(
          { success: false, error: 'Замечание не найдено' },
          { status: 404 }
        )
      }

      // Проверяем права
      const isGip = remark.expertise.project.gipId === user.id
      const isAssignee = remark.expertise.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      if (status !== undefined) updateData.status = status
      if (content !== undefined) updateData.content = content
      if (number !== undefined) updateData.number = number
      if (sectionId !== undefined) updateData.sectionId = sectionId
      if (sectionCode !== undefined) updateData.sectionCode = sectionCode

      const updated = await prisma.expertiseRemark.update({
        where: { id },
        data: updateData,
        include: {
          section: {
            select: { id: true, code: true, description: true }
          }
        }
      })

      return NextResponse.json({ success: true, remark: updated })
    } catch (error) {
      console.error('Update remark error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления замечания' },
        { status: 500 }
      )
    }
  })
}

// Удалить замечание
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const remark = await prisma.expertiseRemark.findUnique({
        where: { id },
        include: { expertise: { include: { project: true } } }
      })

      if (!remark) {
        return NextResponse.json(
          { success: false, error: 'Замечание не найдено' },
          { status: 404 }
        )
      }

      // Проверяем права
      const isGip = remark.expertise.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.expertiseRemark.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete remark error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления замечания' },
        { status: 500 }
      )
    }
  })
}
