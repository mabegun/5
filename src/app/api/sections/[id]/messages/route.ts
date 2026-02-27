import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить сообщения раздела
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const messages = await prisma.message.findMany({
        where: { sectionId: id },
        include: {
          author: {
            select: { id: true, name: true, avatarColor: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      return NextResponse.json({ success: true, messages })
    } catch (error) {
      console.error('Get section messages error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения сообщений' },
        { status: 500 }
      )
    }
  })
}

// Создать сообщение
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const body = await request.json()
      const { content, isCritical, fileName, filePath } = body

      if (!content?.trim() && !fileName) {
        return NextResponse.json(
          { success: false, error: 'Содержание или файл обязательны' },
          { status: 400 }
        )
      }

      // Получаем projectId раздела
      const section = await prisma.section.findUnique({
        where: { id },
        select: { projectId: true }
      })

      const message = await prisma.message.create({
        data: {
          sectionId: id,
          projectId: section?.projectId || null,
          content: content || '',
          authorId: user.id,
          isCritical: isCritical || false,
          fileName: fileName || null,
          filePath: filePath || null,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarColor: true }
          }
        }
      })

      return NextResponse.json({ success: true, message })
    } catch (error) {
      console.error('Create section message error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания сообщения' },
        { status: 500 }
      )
    }
  })
}
