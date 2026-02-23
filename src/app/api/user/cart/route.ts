import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

// Función auxiliar para obtener el usuario del token
const getUserIdFromAuth = (req: NextRequest) => {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('Unauthorized', 401)

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!cart) {
      // Crear carrito si no existe
      const newCart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      })
      return apiResponse(newCart)
    }

    return apiResponse(cart)
  } catch (error) {
    return apiError('Error fetching cart', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('Unauthorized', 401)

    const { productId, quantity } = await req.json()
    if (!productId) return apiError('Product ID is required', 400)

    // Buscar o crear carrito
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }

    // Upsert CartItem
    const cartItem = await prisma.cartItem.upsert({
      where: {
        id: (await prisma.cartItem.findFirst({
          where: { cartId: cart.id, productId }
        }))?.id || 'temp-id'
      },
      update: { quantity: quantity || { increment: 1 } },
      create: { cartId: cart.id, productId, quantity: quantity || 1 }
    })

    return apiResponse(cartItem, 201, 'Cart updated')
  } catch (error) {
    return apiError('Error updating cart', 500, error)
  }
}
