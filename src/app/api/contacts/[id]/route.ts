import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Удалить контакт
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

      const contact = await prisma.contact.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!contact) {
        return NextResponse.json(
          { success: false, error: 'Контакт не найден' },
          { status: 404 }
        )
      }

      const isGip = contact.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      await prisma.contact.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete contact error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления контакта' },
        { status: 500 }
      )
    }
  })
}
