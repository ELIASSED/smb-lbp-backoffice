import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// PUT: Modifier une session existante
export async function PUT(request: Request) {
  try {
    const {
      id,
      numeroStageAnts,
      location,
      price,
      capacity,
      startDate,
      endDate,
      instructorId, // Changement ici : utiliser instructorId
      psychologueId // Changement ici : utiliser psychologueId
    } = await request.json();

    // Validation des données
    if (
      !id ||
      !numeroStageAnts ||
      !location ||
      typeof price !== "number" ||
      !capacity ||
      !startDate ||
      !endDate ||
      !instructorId ||
      !psychologueId
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis et valides." },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: Number(id) }, // Assure-toi que id est un nombre
      data: {
        numeroStageAnts,
        location,
        price: Math.round(price),
        capacity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructor: { connect: { id: Number(instructorId) } }, // Relation avec instructor
        psychologue: { connect: { id: Number(psychologueId) } }, // Relation avec psychologue
      },
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la session." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = Number(params.id); // Convertir l'ID string en number
  
      // Validation de l'ID
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: "ID invalide ou manquant pour l'archivage." },
          { status: 400 }
        );
      }
  
      // Archivage de la session
      const archivedSession = await prisma.session.update({
        where: { id },
        data: { isArchived: true },
      });
  
      return NextResponse.json(archivedSession, { status: 200 });
    } catch (error) {
      console.error("Erreur lors de l'archivage de la session:", error);
  
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Session introuvable." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { error: "Une erreur est survenue lors de l'archivage de la session." },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }