import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return apiError('Invalid credentials', 401)
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return apiError('Invalid credentials', 401)
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
    })

    const { password: _, ...userWithoutPassword } = user

    return apiResponse(
      { user: userWithoutPassword, token },
      200,
      'Login successful'
    )
  } catch (error) {
    return apiError('Error during login', 500, error)
  }
}
