import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
    })

    return apiResponse(products, 200, 'Products fetched successfully')
  } catch (error) {
    return apiError('Error fetching products', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, priceCents, description, categoryId, stock, isAuction } = body

    if (!title || !priceCents) {
      return apiError('Title and priceCents are required', 400)
    }

    const product = await prisma.product.create({
      data: {
        title,
        priceCents,
        description,
        categoryId,
        stock: stock ?? 1,
        isAuction: isAuction ?? false,
      },
    })

    return apiResponse(product, 201, 'Product created successfully')
  } catch (error) {
    return apiError('Error creating product', 500, error)
  }
}
