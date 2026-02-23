import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) return apiError('Unauthorized', 401)
    const { userId } = payload

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    })

    if (!cart || cart.items.length === 0) {
      return apiError('Cart is empty', 400)
    }

    const totalCents = cart.items.reduce(
      (acc, item) => acc + item.product.priceCents * item.quantity,
      0
    )

    // Simulación de Checkout: crear orden y limpiar carrito
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PAID', // Simulación: Pago inmediato
          totalCents,
          currency: 'MXN',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchaseCents: item.product.priceCents
            }))
          }
        }
      })

      // Limpiar carrito
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return apiResponse(order, 201, 'Order placed successfully (Simulated)')
  } catch (error) {
    return apiError('Error during checkout', 500, error)
  }
}
