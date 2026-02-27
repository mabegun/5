import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить вводные блоки раздела
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const introBlocks = await prisma.introBlock.findMany({
        where: { sectionId: id },
        orderBy: { sortOrder: 'asc' }
      })

      return NextResponse.json({ success: true, introBlocks })
    } catch (error) {
      console.error('Get intro blocks error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения вводных блоков' },
        { status: 500 }
      )
    }
  })
}

// Создать вводный блок для раздела
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()
      const { type, title, content, fileName, filePath, sortOrder } = body

      if (!title) {
        return NextResponse.json(
          { success: false, error: 'Название обязательно' },
          { status: 400 }
        )
      }

      // Проверяем права
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

      const isGip = section.project.gipId === user.id
      const isAssignee = section.assigneeId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip && !isAssignee) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      // Получаем максимальный sortOrder
      const maxSortOrder = await prisma.introBlock.aggregate({
        where: { sectionId: id },
        _max: { sortOrder: true }
      })

      const introBlock = await prisma.introBlock.create({
        data: {
          sectionId: id,
          projectId: section.projectId,
          type: type || 'text',
          title,
          content: content || null,
          fileName: fileName || null,
          filePath: filePath || null,
          sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1
        }
      })

      return NextResponse.json({ success: true, introBlock })
    } catch (error) {
      console.error('Create intro block error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания вводного блока' },
        { status: 500 }
      )
    }
  })
}
