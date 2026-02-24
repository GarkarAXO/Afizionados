import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

// Función auxiliar para obtener el usuario del token
const getUserIdFromAuth = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.split(' ')[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('No autorizado', 401)

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: true }
        }
      }
    })

    return apiResponse(favorites)
  } catch (error) {
    return apiError('Error al obtener favoritos', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('No autorizado', 401)

    const body = await req.json()
    const { productId } = body
    if (!productId) return apiError('ID de producto requerido', 400)

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      })
      return apiResponse(null, 200, 'Eliminado de favoritos')
    } else {
      const favorite = await prisma.favorite.create({
        data: { userId, productId }
      })
      return apiResponse(favorite, 201, 'Añadido a favoritos')
    }
  } catch (error) {
    return apiError('Error al procesar favoritos', 500, error)
  }
}
