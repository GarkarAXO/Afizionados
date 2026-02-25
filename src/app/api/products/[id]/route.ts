import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { 
        details: true, 
        images: true, 
        certificates: true, 
        category: true,
        auctions: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      }
    })
    if (!product) return apiError('Producto no encontrado', 404)
    return apiResponse(product)
  } catch (error) {
    return apiError('Error al obtener el producto', 500, error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload || payload.role !== 'ADMIN') {
      return apiError('Unauthorized', 403)
    }

    const { id } = await params
    
    // Eliminamos el producto (las relaciones se manejarían por cascade si está configurado, 
    // si no Prisma fallará, pero aquí borramos lo principal)
    await prisma.product.delete({ where: { id } })
    
    return apiResponse(null, 200, 'Producto eliminado')
  } catch (error) {
    return apiError('Error al eliminar el producto', 500, error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { 
      title, priceCents, description, categoryId, stock, isAuction,
      mainImageUrl, details, certificates 
    } = body

    // Pre-procesar datos fuera de la transacción para ganar velocidad
    const finalPriceCents = Math.round(Number(priceCents) * 100)
    const finalStock = parseInt(stock) || 0
    
    // 1. Actualizar datos básicos (Sin transacción interactiva para mayor velocidad)
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title,
        priceCents: finalPriceCents,
        description,
        stock: finalStock,
        isAuction: !!isAuction,
        categoryId: categoryId || null,
      }
    })

    // 2. Detalles (upsert)
    if (details) {
      await prisma.productDetail.upsert({
        where: { productId: id },
        update: {
          fichaTecnica: details.fichaTecnica,
          infoColeccionista: details.infoColeccionista,
          cuidadosProduct: details.cuidadosProduct,
          videoUrl: details.videoUrl
        },
        create: {
          productId: id,
          fichaTecnica: details.fichaTecnica,
          infoColeccionista: details.infoColeccionista,
          cuidadosProduct: details.cuidadosProduct,
          videoUrl: details.videoUrl
        }
      })
    }

    // 3. Imagen Principal
    if (mainImageUrl) {
      await prisma.productImage.deleteMany({ where: { productId: id, type: 'MAIN' } })
      await prisma.productImage.create({
        data: { productId: id, url: mainImageUrl, type: 'MAIN', alt: title }
      })
    }

    // 4. Certificados
    if (certificates) {
      await prisma.productCertificate.deleteMany({ where: { productId: id } })
      if (certificates.length > 0) {
        await prisma.productCertificate.createMany({
          data: certificates.map((cert: any) => ({
            productId: id,
            title: cert.title,
            issuedBy: cert.issuedBy,
            description: cert.description,
            fileUrl: cert.fileUrl
          }))
        })
      }
    }

    return apiResponse(updated, 200, 'Bóveda actualizada con éxito')
  } catch (error) {
    console.error('Error updating product:', error)
    return apiError('Error al actualizar el producto', 500, error)
  }
}
