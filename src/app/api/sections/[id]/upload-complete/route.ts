import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Загрузить готовый файл раздела
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params

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

      // Проверяем права
      const isGip = section.project.gipId === user.id
      const isAssignee = section.assigneeId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip && !isAssignee) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Файл не найден' },
          { status: 400 }
        )
      }

      // Создаем директорию для загрузки
      const uploadsDir = path.join(process.cwd(), 'uploads', 'sections', id)
      await mkdir(uploadsDir, { recursive: true })

      // Генерируем уникальное имя файла
      const timestamp = Date.now()
      const ext = file.name.split('.').pop()
      const fileName = `complete_${timestamp}.${ext}`
      const filePath = path.join(uploadsDir, fileName)

      // Сохраняем файл
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Обновляем раздел
      const publicPath = `/uploads/sections/${id}/${fileName}`
      const updated = await prisma.section.update({
        where: { id },
        data: {
          completedFile: publicPath,
          completedFileName: file.name
        }
      })

      return NextResponse.json({
        success: true,
        section: updated,
        file: {
          name: file.name,
          path: publicPath
        }
      })
    } catch (error) {
      console.error('Upload complete file error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка загрузки файла' },
        { status: 500 }
      )
    }
  })
}
