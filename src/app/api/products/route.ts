import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: true,
        details: true,
        certificates: true
      },
    })
    return apiResponse(products)
  } catch (error) {
    return apiError('Error fetching products', 500, error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized: Admin access required', 403)
    }

    const body = await req.json()
    const { 
      title, priceCents, description, categoryId, stock, isAuction,
      mainImageUrl, images, details, certificates 
    } = body

    if (!title || !priceCents) {
      return apiError('Title and priceCents are required', 400)
    }

    // Creación del producto con relaciones anidadas
    const product = await prisma.product.create({
      data: {
        title,
        priceCents,
        description,
        categoryId: categoryId || null,
        stock: parseInt(stock) || 1,
        isAuction: isAuction || false,
        // Imagen Principal y Galería
        images: {
          create: [
            ...(mainImageUrl ? [{ url: mainImageUrl, type: 'MAIN', alt: title }] : []),
            ...(images || []).map((url: string) => ({ url, type: 'GALLERY', alt: title }))
          ]
        },
        // Detalles técnicos
        details: details ? {
          create: {
            fichaTecnica: details.fichaTecnica,
            infoColeccionista: details.infoColeccionista,
            cuidadosProduct: details.cuidadosProduct
          }
        } : undefined,
        // Certificados
        certificates: certificates ? {
          create: certificates.map((cert: any) => ({
            title: cert.title,
            issuedBy: cert.issuedBy,
            fileUrl: cert.fileUrl
          }))
        } : undefined
      },
      include: {
        images: true,
        details: true,
        certificates: true
      }
    })

    return apiResponse(product, 201, 'Product created successfully')
  } catch (error) {
    console.error('Error in POST /api/products:', error)
    return apiError('Error creating product', 500, error)
  }
}
