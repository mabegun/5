import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Добавить ответ на замечание
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id } = await params
      const formData = await request.formData()

      const responseContent = formData.get('responseContent') as string | null
      const file = formData.get('file') as File | null
      const status = formData.get('status') as string | null

      const remark = await prisma.expertiseRemark.findUnique({
        where: { id },
        include: { expertise: { include: { project: true } } }
      })

      if (!remark) {
        return NextResponse.json(
          { success: false, error: 'Замечание не найдено' },
          { status: 404 }
        )
      }

      // Проверяем права
      const isGip = remark.expertise.project.gipId === user.id
      const isAssignee = remark.expertise.project.gipId === user.id
      const isAdmin = user.role === 'admin'

      if (!isAdmin && !isGip) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        )
      }

      let responseFileName: string | null = null
      let responseFilePath: string | null = null

      // Загружаем файл ответа если есть
      if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'responses')
        await mkdir(uploadsDir, { recursive: true })

        const timestamp = Date.now()
        const ext = file.name.split('.').pop()
        responseFileName = file.name
        const storedName = `response_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${ext}`
        responseFilePath = `/uploads/responses/${storedName}`

        const fullPath = path.join(uploadsDir, storedName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(fullPath, buffer)
      }

      // Обновляем замечание с ответом
      const updateData: any = {
        responseContent: responseContent || remark.responseContent,
        responseFile: responseFilePath || remark.responseFile,
        responseFileName: responseFileName || remark.responseFileName,
        respondedAt: new Date().toISOString(),
        respondedBy: user.id,
        status: status || 'responded'
      }

      const updated = await prisma.expertiseRemark.update({
        where: { id },
        data: updateData,
        include: {
          section: {
            select: { id: true, code: true, description: true }
          }
        }
      })

      return NextResponse.json({ success: true, remark: updated })
    } catch (error) {
      console.error('Add response error:', error)
      return NextResponse.json(
        { success: false, error: 'Ошибка добавления ответа' },
        { status: 500 }
      )
    }
  })
}
