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

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) return apiResponse([])

    // Búsqueda paralela en 3 tablas
    const [products, orders, users] = await Promise.all([
      prisma.product.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: 3,
        select: { id: true, title: true }
      }),
      prisma.order.findMany({
        where: { id: { contains: query, mode: 'insensitive' } },
        take: 3,
        select: { id: true, user: { select: { name: true } } }
      }),
      prisma.user.findMany({
        where: { 
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ],
          role: 'CLIENT'
        },
        take: 3,
        select: { id: true, name: true, email: true }
      })
    ])

    return apiResponse({
      products: products.map(p => ({ id: p.id, label: p.title, type: 'Producto', href: `/dashboard/products` })),
      orders: orders.map(o => ({ id: o.id, label: `Orden #${o.id.slice(-6)}`, type: 'Orden', href: `/dashboard/orders` })),
      users: users.map(u => ({ id: u.id, label: u.name || u.email, type: 'Coleccionista', href: `/dashboard/customers` }))
    })
  } catch (error) {
    return apiError('Search failed', 500, error)
  }
}
