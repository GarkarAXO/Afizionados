import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/api-response'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    })
    return apiResponse(categories)
  } catch (error) {
    return apiError('Error fetching categories', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const body = await req.json()
    const { name, parentId } = body

    if (!name) {
      return apiError('El nombre de la categoría es requerido', 400)
    }

    const category = await prisma.category.create({
      data: { 
        name, 
        parentId: parentId && parentId !== "" ? parentId : null 
      }
    })

    return apiResponse(category, 201, 'Categoría creada con éxito')
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 'P2002') {
      return apiError('Ya existe una categoría con ese nombre', 400)
    }
    return apiError('Error al crear la categoría', 500, error)
  }
}
