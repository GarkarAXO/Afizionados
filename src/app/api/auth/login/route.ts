import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return apiError('Credenciales inválidas', 401)
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return apiError('Credenciales inválidas', 401)
    }

    // Si 'rememberMe' es true, el token dura 30 días, si no, 1 día.
    const duration = rememberMe ? '30d' : '1d'

    const token = signToken({
      userId: user.id,
      role: user.role,
    }, duration)

    const { password: _, ...userWithoutPassword } = user

    return apiResponse(
      { user: userWithoutPassword, token },
      200,
      'Login exitoso'
    )
  } catch (error) {
    return apiError('Error durante el inicio de sesión', 500, error)
  }
}
