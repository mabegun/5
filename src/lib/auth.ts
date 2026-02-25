import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'project-bureau-secret-key'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  position?: string | null
  avatar?: string | null
  avatarColor?: string | null
}

// Проверка токена и получение пользователя
export async function getUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Проверяем токен в заголовке Authorization
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    // Если нет в заголовке, проверяем cookie
    if (!token) {
      token = request.cookies.get('auth_token')?.value || null
    }
    
    if (!token) return null
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        avatar: true,
        avatarColor: true,
      }
    })
    
    if (!user) return null
    
    return user
  } catch (error) {
    return null
  }
}

// Генерация токена
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Проверка прав доступа
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return roles.includes(user.role)
}

// Middleware для защищенных маршрутов
export async function withAuth(
  request: NextRequest,
  handler: (user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getUser(request)
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Необходима авторизация' },
      { status: 401 }
    )
  }
  
  return handler(user)
}

// Middleware для проверки роли
export async function withRole(
  request: NextRequest,
  roles: string[],
  handler: (user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    if (!hasRole(user, roles)) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      )
    }
    return handler(user)
  })
}
