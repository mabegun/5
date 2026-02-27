import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Обновить вводный блок
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()
      const { type, title, content, fileName, filePath, sortOrder } = body

      const introBlock = await prisma.introBlock.findUnique({
        where: { id },
        include: { section: { include: { project: true } } }
      })

      if (!introBlock) {
        return NextResponse.json(
          { success: false, error: 'Вводный блок не найден' },
          { status: 404 }
        )
      }

      // Проверяем права
      let isGip = false
      let isAssignee = false
      let isAdmin = user.role === 'admin'

      if (introBlock.section) {
        isGip = introBlock.section.project?.gipId === user.id
        isAssignee = introBlock.section.assigneeId === user.id
      }

      if (!isAdmin && !isGip && !isAssignee) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      if (type !== undefined) updateData.type = type
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (fileName !== undefined) updateData.fileName = fileName
      if (filePath !== undefined) updateData.filePath = filePath
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder

      const updated = await prisma.introBlock.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({ success: true, introBlock: updated })
    } catch (error) {
      console.error('Update intro block error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления вводного блока' },
        { status: 500 }
      )
    }
  })
}

// Удалить вводный блок
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const introBlock = await prisma.introBlock.findUnique({
        where: { id },
        include: { section: { include: { project: true } } }
      })

      if (!introBlock) {
        return NextResponse.json(
          { success: false, error: 'Вводный блок не найден' },
          { status: 404 }
        )
      }

      // Проверяем права
      let isGip = false
      let isAssignee = false
      let isAdmin = user.role === 'admin'

      if (introBlock.section) {
        isGip = introBlock.section.project?.gipId === user.id
        isAssignee = introBlock.section.assigneeId === user.id
      }

      if (!isAdmin && !isGip && !isAssignee) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.introBlock.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete intro block error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления вводного блока' },
        { status: 500 }
      )
    }
  })
}
