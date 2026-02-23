import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return apiError('User already exists', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user
    return apiResponse(userWithoutPassword, 201, 'User registered successfully')
  } catch (error) {
    return apiError('Error registering user', 500, error)
  }
}
