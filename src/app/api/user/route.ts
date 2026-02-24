import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

// GET: Listar usuarios (Filtrado por rol)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'CLIENT'

    const users = await prisma.user.findMany({
      where: { role: role as any },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        lastNamePaterno: true,
        lastNameMaterno: true,
        email: true,
        role: true,
        phone: true,
        birthDate: true,
        gender: true,
        createdAt: true,
      }
    })

    return apiResponse(users)
  } catch (error) {
    return apiError('Error fetching users', 500, error)
  }
}

// POST: Crear un nuevo usuario manualmente (Solo ADMIN)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const body = await req.json()
    const { name, email, password, role } = body

    if (!email || !password || !name) {
      return apiError('Name, email and password are required', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('El correo ya está registrado', 400)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return apiResponse(user, 201, 'Usuario creado con éxito')
  } catch (error) {
    return apiError('Error creating user', 500, error)
  }
}
