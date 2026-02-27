import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Получить контакты проекта
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const projectId = searchParams.get('projectId')

      if (!projectId) {
        return NextResponse.json(
          { success: false, error: 'projectId обязателен' },
          { status: 400 }
        )
      }

      const contacts = await prisma.contact.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ success: true, contacts })
    } catch (error) {
      console.error('Get contacts error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения контактов' },
        { status: 500 }
      )
    }
  })
}

// Создать контакт
export async function POST(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const body = await request.json()
      const { projectId, name, position, company, phone, email, notes } = body

      if (!projectId || !name) {
        return NextResponse.json(
          { success: false, error: 'projectId и name обязательны' },
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

      const contact = await prisma.contact.create({
        data: {
          projectId,
          name,
          position: position || null,
          company: company || null,
          phone: phone || null,
          email: email || null,
          notes: notes || null,
        }
      })

      return NextResponse.json({ success: true, contact })
    } catch (error) {
      console.error('Create contact error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка создания контакта' },
        { status: 500 }
      )
    }
  })
}
