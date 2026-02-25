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

    const body = await req.json()
    const { shippingDetails } = body

    // 1. Obtener carrito del usuario
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

    // 2. Transacción de Checkout: Crear Orden, Actualizar Stock y Limpiar Carrito
    const order = await prisma.$transaction(async (tx) => {
      
      // Crear la orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PAID', // Simulamos pago exitoso para esta etapa
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

      // Actualizar el stock de cada producto (Piezas únicas reducen a 0)
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // Limpiar el carrito del usuario
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return apiResponse(order, 201, 'Adquisición procesada con éxito')
  } catch (error) {
    console.error('Checkout error:', error)
    return apiError('Error durante el procesamiento de la orden', 500, error)
  }
}
