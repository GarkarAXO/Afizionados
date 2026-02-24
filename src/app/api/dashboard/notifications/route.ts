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

    // Obtener los últimos eventos
    const [lastBids, lastOrders, lastUsers] = await Promise.all([
      prisma.bid.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } }, auction: { include: { product: { select: { title: true } } } } }
      }),
      prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      prisma.user.findMany({
        where: { role: 'CLIENT' },
        take: 3,
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Unificar y formatear como notificaciones
    const notifications = [
      ...lastBids.map(b => ({
        id: `bid-${b.id}`,
        title: 'Nueva Puja',
        desc: `${b.user.name} pujó en ${b.auction.product.title}`,
        time: b.createdAt,
        icon: 'gavel',
        color: 'text-[#d4af35]'
      })),
      ...lastOrders.map(o => ({
        id: `ord-${o.id}`,
        title: 'Nueva Orden',
        desc: `Adquisición de ${o.user?.name || 'Invitado'} por $${(o.totalCents / 100).toLocaleString()}`,
        time: o.createdAt,
        icon: 'shopping_cart',
        color: 'text-green-500'
      })),
      ...lastUsers.map(u => ({
        id: `usr-${u.id}`,
        title: 'Nuevo Coleccionista',
        desc: `${u.name || u.email} se ha unido a la Arena`,
        time: u.createdAt,
        icon: 'person_add',
        color: 'text-blue-500'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

    return apiResponse(notifications)
  } catch (error) {
    return apiError('Failed to fetch notifications', 500, error)
  }
}
