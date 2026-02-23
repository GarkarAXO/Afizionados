import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { gte: new Date() } // Solo subastas que no han terminado
      },
      include: {
        product: {
          include: { images: true }
        },
        _count: { select: { bids: true } }
      },
      orderBy: { endTime: 'asc' }
    })

    return apiResponse(auctions, 200, 'Active auctions fetched')
  } catch (error) {
    return apiError('Error fetching auctions', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, startingPriceCents, startTime, endTime } = body

    const auction = await prisma.auction.create({
      data: {
        productId,
        startingPriceCents,
        currentPriceCents: startingPriceCents,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'ACTIVE'
      }
    })

    return apiResponse(auction, 201, 'Auction created successfully')
  } catch (error) {
    return apiError('Error creating auction', 500, error)
  }
}
