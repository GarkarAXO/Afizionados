import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

// PUT: Editar subasta (Solo ADMIN)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    const { id } = await params
    const body = await req.json()
    const { startingPriceCents, startTime, endTime, status } = body

    const updated = await prisma.auction.update({
      where: { id },
      data: {
        startingPriceCents: startingPriceCents ? Math.round(Number(startingPriceCents)) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status: status || undefined
      }
    })

    return apiResponse(updated, 200, 'Subasta actualizada')
  } catch (error) {
    return apiError('Error updating auction', 500, error)
  }
}

// DELETE: Eliminar/Cancelar subasta (Solo ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    const { id } = await params
    
    // Podríamos simplemente cambiar el status a CANCELED para mantener historial
    await prisma.auction.delete({ where: { id } })
    
    return apiResponse(null, 200, 'Subasta eliminada')
  } catch (error) {
    return apiError('Error deleting auction', 500, error)
  }
}
