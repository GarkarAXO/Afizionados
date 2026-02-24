import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/api-response'

// GET: Listar subastas (Con filtros para admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAdminView = searchParams.get('admin') === 'true'
    
    const where: any = {}
    if (!isAdminView) {
      where.status = 'ACTIVE'
      where.endTime = { gte: new Date() }
    }

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        product: {
          include: { images: true, category: true }
        },
        _count: { select: { bids: true } }
      },
      orderBy: isAdminView ? { createdAt: 'desc' } : { endTime: 'asc' }
    })

    return apiResponse(auctions)
  } catch (error) {
    return apiError('Error fetching auctions', 500, error)
  }
}

// POST: Crear subasta (Solo ADMIN)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const body = await req.json()
    const { productId, startingPriceCents, startTime, endTime } = body

    if (!productId || !startingPriceCents || !startTime || !endTime) {
      return apiError('Missing required fields', 400)
    }

    const auction = await prisma.auction.create({
      data: {
        productId,
        startingPriceCents: Math.round(Number(startingPriceCents)),
        currentPriceCents: Math.round(Number(startingPriceCents)),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'ACTIVE'
      },
      include: { product: true }
    })

    return apiResponse(auction, 201, 'Subasta iniciada con éxito')
  } catch (error) {
    return apiError('Error creating auction', 500, error)
  }
}
