import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Загрузка файла
export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const projectId = formData.get('projectId') as string
      const sectionId = formData.get('sectionId') as string

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Файл не найден' },
          { status: 400 }
        )
      }

      // Создаём директорию для загрузок если не существует
      const uploadDir = process.env.UPLOAD_DIR || '/var/www/projectbureau/uploads'
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = path.extname(file.name)
      const fileName = `${timestamp}_${randomStr}${ext}`
      const filePath = path.join(uploadDir, fileName)

      // Сохраняем файл
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Сохраняем информацию в БД
      const fileRecord = await prisma.file.create({
        data: {
          name: fileName,
          originalName: file.name,
          path: filePath,
          mimeType: file.type,
          size: file.size,
          projectId: projectId || null,
          sectionId: sectionId || null,
        }
      })

      return NextResponse.json({
        success: true,
        file: {
          id: fileRecord.id,
          name: fileName,
          originalName: file.name,
          path: filePath,
          size: file.size,
          mimeType: file.type,
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка загрузки файла' },
        { status: 500 }
      )
    }
  })
}
