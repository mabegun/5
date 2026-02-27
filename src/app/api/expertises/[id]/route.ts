import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить экспертизу по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const expertise = await prisma.expertise.findUnique({
        where: { id },
        include: {
          remarks: {
            include: {
              comments: {
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true,
              sections: {
                select: {
                  id: true,
                  code: true,
                  description: true
                }
              }
            }
          }
        }
      })

      if (!expertise) {
        return NextResponse.json(
          { success: false, error: 'Экспертиза не найдена' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, expertise })
    } catch (error) {
      console.error('Get expertise error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения экспертизы' },
        { status: 500 }
      )
    }
  })
}

// Обновить экспертизу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()

      const expertise = await prisma.expertise.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!expertise) {
        return NextResponse.json(
          { success: false, error: 'Экспертиза не найдена' },
          { status: 404 }
        )
      }

      const isGip = expertise.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      if (body.stageName !== undefined) updateData.stageName = body.stageName
      if (body.experts !== undefined) updateData.experts = body.experts
      if (body.startDate !== undefined) updateData.startDate = body.startDate
      if (body.endDate !== undefined) updateData.endDate = body.endDate
      if (body.files !== undefined) updateData.files = body.files

      const updated = await prisma.expertise.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({ success: true, expertise: updated })
    } catch (error) {
      console.error('Update expertise error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления экспертизы' },
        { status: 500 }
      )
    }
  })
}

// Удалить экспертизу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const expertise = await prisma.expertise.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!expertise) {
        return NextResponse.json(
          { success: false, error: 'Экспертиза не найдена' },
          { status: 404 }
        )
      }

      const isGip = expertise.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.expertise.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete expertise error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления экспертизы' },
        { status: 500 }
      )
    }
  })
}
