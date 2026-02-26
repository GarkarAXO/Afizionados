import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) return apiError('No autorizado', 401)

    const address = await prisma.address.findFirst({
      where: { userId: payload.userId, isDefault: true }
    }) || await prisma.address.findFirst({
      where: { userId: payload.userId }
    })

    return apiResponse(address)
  } catch (error) {
    console.error('Error GET Address:', error)
    return apiError('Error al obtener la dirección', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    const payload = token ? verifyToken(token) : null

    if (!payload) return apiError('No autorizado', 401)

    const body = await req.json()
    const { 
      street, numInterior, numExterior, 
      colonia, municipio, state, zipCode 
    } = body

    if (!street || !state || !zipCode) {
      return apiError('Faltan campos obligatorios: calle, estado o CP', 400)
    }

    // Usamos upsert o simplemente update/create para mantener solo una dirección por ahora
    const existing = await prisma.address.findFirst({
      where: { userId: payload.userId }
    })

    if (existing) {
      const updated = await prisma.address.update({
        where: { id: existing.id },
        data: {
          street, 
          numInterior: numInterior || null, 
          numExterior: numExterior || null,
          colonia: colonia || null, 
          municipio: municipio || null, 
          state, 
          zipCode
        }
      })
      return apiResponse(updated, 200, 'Dirección actualizada')
    } else {
      const created = await prisma.address.create({
        data: {
          userId: payload.userId,
          street, 
          numInterior: numInterior || null, 
          numExterior: numExterior || null,
          colonia: colonia || null, 
          municipio: municipio || null, 
          state, 
          zipCode,
          isDefault: true
        }
      })
      return apiResponse(created, 201, 'Dirección guardada')
    }
  } catch (error) {
    console.error('Error POST Address:', error)
    return apiError('Error al guardar la dirección', 500)
  }
}
