import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

// GET: Listar todas las órdenes (Solo ADMIN)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { title: true }
            }
          }
        }
      }
    })

    return apiResponse(orders)
  } catch (error) {
    return apiError('Error fetching orders', 500, error)
  }
}

// PUT: Actualizar estado de una orden (Solo ADMIN)
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return apiError('Order ID and status are required', 400)
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return apiResponse(updated, 200, 'Estado de orden actualizado')
  } catch (error) {
    return apiError('Error updating order', 500, error)
  }
}
