import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Создать замечание
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const body = await request.json()
      const { expertiseId, sectionId, sectionCode, number, content, fileName, filePath } = body

      if (!expertiseId || !content) {
        return NextResponse.json(
          { success: false, error: 'expertiseId и content обязательны' },
          { status: 400 }
        )
      }

      // Проверяем права
      const expertise = await prisma.expertise.findUnique({
        where: { id: expertiseId },
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

      const remark = await prisma.expertiseRemark.create({
        data: {
          expertiseId,
          sectionId: sectionId || null,
          sectionCode: sectionCode || null,
          number: number || null,
          content,
          fileName: fileName || null,
          filePath: filePath || null,
          status: 'open'
        }
      })

      return NextResponse.json({ success: true, remark })
    } catch (error) {
      console.error('Create remark error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания замечания' },
        { status: 500 }
      )
    }
  })
}
