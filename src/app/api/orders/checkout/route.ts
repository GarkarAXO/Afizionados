import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) return apiError('No autorizado', 401)
    const { userId } = payload

    const body = await req.json()
    const { items: clientItems } = body // Solo tomamos los IDs y cantidades

    if (!clientItems || clientItems.length === 0) {
      return apiError('El manifiesto de adquisición está vacío', 400)
    }

    // 1. OBTENER DATOS REALES DE LA DB (Protección contra manipulación de precios)
    const productIds = clientItems.map((i: any) => i.productId)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    // 2. TRANSACCIÓN ATÓMICA
    const order = await prisma.$transaction(async (tx) => {
      let serverCalculatedTotal = 0
      const orderItemsToCreate = []

      for (const clientItem of clientItems) {
        const product = dbProducts.find(p => p.id === clientItem.productId)

        if (!product) throw new Error(`La pieza con ID ${clientItem.productId} no existe.`)
        
        // Verificación estricta de stock
        if (product.stock < clientItem.quantity) {
          throw new Error(`La pieza "${product.title}" ya ha sido adquirida por otro coleccionista.`)
        }

        // USAMOS EL PRECIO DE LA DB, NO EL DEL CLIENTE
        serverCalculatedTotal += product.priceCents * clientItem.quantity
        
        orderItemsToCreate.push({
          productId: product.id,
          quantity: clientItem.quantity,
          priceAtPurchaseCents: product.priceCents // Precio real de la DB
        })
      }

      // Crear la orden con el total verificado por el servidor
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PAID',
          totalCents: serverCalculatedTotal,
          currency: 'MXN',
          items: {
            create: orderItemsToCreate
          }
        }
      })

      // Reducir stock de forma segura
      for (const item of orderItemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      return newOrder
    })

    return apiResponse(order, 201, 'Adquisición procesada con éxito y verificada')
  } catch (error: any) {
    console.error('Security Checkout Error:', error.message)
    return apiError(error.message || 'Error de seguridad en la transacción', 400)
  }
}
