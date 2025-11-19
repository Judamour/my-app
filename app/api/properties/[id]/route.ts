import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyType } from '@prisma/client'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété non trouvée' },
        { status: 404 }
      )
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à voir cette propriété' },
        { status: 403 }
      )
    }

    return NextResponse.json(property, { status: 200 })
  } catch (error) {
    console.error('GET /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la propriété' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Propriété non trouvée' },
        { status: 404 }
      )
    }

    if (existingProperty.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette propriété' },
        { status: 403 }
      )
    }

    if (body.surface !== undefined && (typeof body.surface !== 'number' || body.surface <= 0)) {
      return NextResponse.json(
        { error: 'La surface doit être un nombre positif' },
        { status: 400 }
      )
    }

    if (body.rent !== undefined && (typeof body.rent !== 'number' || body.rent <= 0)) {
      return NextResponse.json(
        { error: 'Le loyer doit être un nombre positif' },
        { status: 400 }
      )
    }

    // ✅ Type correct avec Partial
 const updateData: {
  title?: string
  address?: string
  type?: PropertyType
  surface?: number
  rooms?: number
  bedrooms?: number
  rent?: number
  description?: string | null
  available?: boolean
} = {}

if (body.title !== undefined) updateData.title = body.title
if (body.address !== undefined) updateData.address = body.address
if (body.type !== undefined) updateData.type = body.type as PropertyType
if (body.surface !== undefined) updateData.surface = Number(body.surface)
if (body.rooms !== undefined) updateData.rooms = Number(body.rooms)
if (body.bedrooms !== undefined) updateData.bedrooms = Number(body.bedrooms)
if (body.rent !== undefined) updateData.rent = Number(body.rent)
if (body.description !== undefined) updateData.description = body.description
if (body.available !== undefined) updateData.available = body.available

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedProperty, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la propriété' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété non trouvée' },
        { status: 404 }
      )
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer cette propriété' },
        { status: 403 }
      )
    }

    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Propriété supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/properties/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la propriété' },
      { status: 500 }
    )
  }
}
