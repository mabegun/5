import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'project-bureau-secret-key-2024'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export function generateToken(user: { id: string; email: string; name: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

export async function getUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return null
  }
  
  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true }
  })
  
  return user
}

export async function withAuth<T>(
  request: NextRequest,
  handler: (user: AuthUser) => Promise<T>
): Promise<T | Response> {
  const user = await getUser(request)
  
  if (!user) {
    return Response.json(
      { success: false, error: 'Не авторизован' },
      { status: 401 }
    )
  }
  
  return handler(user)
}
