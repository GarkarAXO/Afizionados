import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

const getUserIdFromAuth = (req: NextRequest) => {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId || null
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('No autorizado', 401)

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { 
            product: { 
              include: { images: true } 
            } 
          }
        }
      }
    })

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      })
      return apiResponse(newCart)
    }

    return apiResponse(cart)
  } catch (error) {
    return apiError('Error al obtener el carrito', 500, error)
  }
}

// Sincronizar carrito local con la DB
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('No autorizado', 401)

    const { items } = await req.json() // Array de { productId, quantity }

    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }

    // Usamos una transacción para limpiar y re-poblar
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          cartId: cart!.id,
          productId: item.productId,
          quantity: item.quantity || 1
        }))
      })
    ])

    return apiResponse(null, 200, 'Carrito sincronizado')
  } catch (error) {
    return apiError('Error al sincronizar el carrito', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromAuth(req)
    if (!userId) return apiError('No autorizado', 401)

    const { productId, quantity } = await req.json()
    
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) cart = await prisma.cart.create({ data: { userId } })

    const cartItem = await prisma.cartItem.upsert({
      where: {
        id: (await prisma.cartItem.findFirst({
          where: { cartId: cart.id, productId }
        }))?.id || 'new-item'
      },
      update: { quantity: quantity || { increment: 1 } },
      create: { cartId: cart.id, productId, quantity: quantity || 1 }
    })

    return apiResponse(cartItem, 201, 'Ítem añadido al carrito')
  } catch (error) {
    return apiError('Error al actualizar ítem del carrito', 500, error)
  }
}
