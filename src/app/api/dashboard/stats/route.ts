import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    // 1. Estadísticas Generales
    const totalSalesResult = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalCents: true }
    })

    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    })

    const totalClients = await prisma.user.count({
      where: { role: 'CLIENT' }
    })

    const activeAuctions = await prisma.auction.count({
      where: { 
        status: 'ACTIVE',
        endTime: { gte: new Date() }
      }
    })

    // 2. Órdenes Recientes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    })

    // 3. Top Coleccionistas (Por inversión total)
    const topCollectors = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      take: 5,
      select: {
        id: true,
        name: true,
        orders: {
          where: { status: 'PAID' },
          select: { totalCents: true }
        }
      }
    })

    const formattedTopCollectors = topCollectors.map(user => ({
      id: user.id,
      name: user.name,
      totalSpent: user.orders.reduce((acc, order) => acc + order.totalCents, 0)
    })).sort((a, b) => b.totalSpent - a.totalSpent)

    return apiResponse({
      stats: {
        totalSales: totalSalesResult._sum.totalCents || 0,
        totalProducts,
        totalClients,
        activeAuctions
      },
      recentOrders,
      topCollectors: formattedTopCollectors
    })
  } catch (error) {
    return apiError('Error fetching dashboard stats', 500, error)
  }
}
