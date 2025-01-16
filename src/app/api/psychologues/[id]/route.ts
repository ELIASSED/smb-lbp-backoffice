import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Modifier un psychologue
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const data = await request.json();
    const { firstName, lastName, email, phone, numeroAutorisationPrefectorale } = data;

    // Vérifier si le psychologue existe
    const existingPsychologue = await prisma.psychologue.findUnique({ where: { id } });
    if (!existingPsychologue) {
      return NextResponse.json({ error: 'Psychologue introuvable' }, { status: 404 });
    }

    // Mettre à jour les données du psychologue
    const updatedPsychologue = await prisma.psychologue.update({
      where: { id },
      data: { firstName, lastName, email, phone, numeroAutorisationPrefectorale },
    });

    return NextResponse.json(updatedPsychologue);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du psychologue :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Archiver un psychologue
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Vérifier si le psychologue existe
    const existingPsychologue = await prisma.psychologue.findUnique({ where: { id } });
    if (!existingPsychologue) {
      return NextResponse.json({ error: 'Psychologue introuvable' }, { status: 404 });
    }

    // Archiver le psychologue
    const archivedPsychologue = await prisma.psychologue.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ message: 'Psychologue archivé avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'archivage du psychologue :", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
