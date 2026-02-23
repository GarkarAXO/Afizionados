import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auctionId } = await params;
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) return apiError('Unauthorized', 401)
    const { userId } = payload

    const body = await req.json()
    const { amountCents } = body

    if (!amountCents) return apiError('Bid amount is required', 400)

    // Transaction to ensure data consistency
    const bidResult = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId }
      })

      if (!auction || auction.status !== 'ACTIVE') {
        throw new Error('Auction is not active')
      }

      if (new Date() > auction.endTime) {
        throw new Error('Auction has already ended')
      }

      if (amountCents <= auction.currentPriceCents) {
        throw new Error('Bid must be higher than current price')
      }

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amountCents
        }
      })

      await tx.auction.update({
        where: { id: auctionId },
        data: { currentPriceCents: amountCents }
      })

      return bid
    })

    return apiResponse(bidResult, 201, 'Bid placed successfully')
  } catch (error: any) {
    return apiError(error.message || 'Error placing bid', 400, error)
  }
}
