import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return apiError('Unauthorized', 401)
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { title: true } }
          }
        }
      }
    })

    return apiResponse(orders)
  } catch (error) {
    return apiError('Error fetching user orders', 500, error)
  }
}
