import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Получить замечания экспертизы
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async () => {
    try {
      const { id } = await params

      const remarks = await prisma.expertiseRemark.findMany({
        where: { expertiseId: id },
        include: {
          section: {
            select: { id: true, code: true, description: true }
          },
          comments: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ success: true, remarks })
    } catch (error) {
      console.error('Get remarks error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка получения замечаний' },
        { status: 500 }
      )
    }
  })
}

// Создать замечание
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const formData = await request.formData()

      const content = formData.get('content') as string
      const sectionId = formData.get('sectionId') as string | null
      const sectionCode = formData.get('sectionCode') as string | null
      const number = formData.get('number') as string | null
      const file = formData.get('file') as File | null

      if (!content) {
        return NextResponse.json(
          { success: false, error: 'Текст замечания обязателен' },
          { status: 400 }
        )
      }

      // Проверяем права
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

      let fileName: string | null = null
      let filePath: string | null = null

      // Загружаем файл если есть
      if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'remarks')
        await mkdir(uploadsDir, { recursive: true })

        const timestamp = Date.now()
        const ext = file.name.split('.').pop()
        fileName = file.name
        const storedName = `remark_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${ext}`
        filePath = `/uploads/remarks/${storedName}`

        const fullPath = path.join(uploadsDir, storedName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(fullPath, buffer)
      }

      const remark = await prisma.expertiseRemark.create({
        data: {
          expertiseId: id,
          sectionId: sectionId || null,
          sectionCode: sectionCode || null,
          number: number || null,
          content,
          fileName,
          filePath,
          status: 'open'
        },
        include: {
          section: {
            select: { id: true, code: true, description: true }
          }
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
