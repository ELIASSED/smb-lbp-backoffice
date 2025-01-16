import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Modifier un instructeur
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

    // Vérifier si l'instructeur existe
    const existingInstructor = await prisma.instructor.findUnique({ where: { id } });
    if (!existingInstructor) {
      return NextResponse.json({ error: 'Instructeur introuvable' }, { status: 404 });
    }

    // Mettre à jour les données de l'instructeur
    const updatedInstructor = await prisma.instructor.update({
      where: { id },
      data: { firstName, lastName, email, phone, numeroAutorisationPrefectorale },
    });

    return NextResponse.json(updatedInstructor);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'instructeur :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Archiver un instructeur
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Vérifier si l'instructeur existe
    const existingInstructor = await prisma.instructor.findUnique({ where: { id } });
    if (!existingInstructor) {
      return NextResponse.json({ error: 'Instructeur introuvable' }, { status: 404 });
    }

    // Archiver l'instructeur
    const archivedInstructor = await prisma.instructor.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ message: 'Instructeur archivé avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'archivage de l'instructeur :", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
