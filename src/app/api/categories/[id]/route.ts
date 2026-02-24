import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('No autorizado', 403)
    }

    // Borrado simple: Si tiene subcategorías, se borrarán en cascada o darán error según el schema
    await prisma.category.delete({ where: { id } })
    
    return apiResponse(null, 200, 'Categoría eliminada')
  } catch (error) {
    console.error('Error al borrar categoría:', error)
    return apiError('No se pudo borrar la categoría. Asegúrate de que no tenga subcategorías o productos asociados.', 500, error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, parentId } = body

    if (!name) return apiError('El nombre es requerido', 400)

    const updated = await prisma.category.update({
      where: { id },
      data: { 
        name, 
        parentId: parentId && parentId !== "" ? parentId : null 
      }
    })

    return apiResponse(updated, 200, 'Categoría actualizada con éxito')
  } catch (error) {
    return apiError('Error al actualizar la categoría', 500, error)
  }
}
