import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

// PUT: Actualizar usuario (Solo ADMIN)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const { id } = await params
    const body = await req.json()
    const { name, email, role, password } = body

    const updateData: any = {
      name,
      email,
      role: role || 'CLIENT'
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return apiResponse(updated, 200, 'Usuario actualizado con éxito')
  } catch (error) {
    return apiError('Error updating user', 500, error)
  }
}

// DELETE: Eliminar usuario (Solo ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const { id } = await params
    
    // No permitir que un ADMIN se borre a sí mismo
    if (payload.userId === id) {
      return apiError('No puedes eliminarte a ti mismo', 400)
    }

    await prisma.user.delete({ where: { id } })
    
    return apiResponse(null, 200, 'Usuario eliminado con éxito')
  } catch (error) {
    return apiError('Error deleting user', 500, error)
  }
}
