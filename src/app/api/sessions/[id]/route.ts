import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const {
      numeroStageAnts,
      location,
      price,
      capacity,
      startDate,
      endDate,
      instructorId,
      psychologueId,
    } = await request.json();

    const parsedId = Number(params.id); // Récupérer l'ID depuis les paramètres
    const parsedPrice = Number(price);
    const parsedCapacity = Number(capacity);
    const parsedInstructorId = Number(instructorId);
    const parsedPsychologueId = Number(psychologueId);

    if (
      !parsedId ||
      isNaN(parsedId) ||
      !numeroStageAnts ||
      !location ||
      isNaN(parsedPrice) ||
      isNaN(parsedCapacity) ||
      !startDate ||
      !endDate ||
      isNaN(parsedInstructorId) ||
      isNaN(parsedPsychologueId)
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis et valides." },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: parsedId },
      data: {
        numeroStageAnts,
        location,
        price: Math.round(parsedPrice),
        capacity: parsedCapacity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructor: { connect: { id: parsedInstructorId } },
        psychologue: { connect: { id: parsedPsychologueId } },
      },
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Session introuvable." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la session." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const parsedId = Number(params.id);
    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json(
        { error: "ID invalide ou manquant pour l'archivage." },
        { status: 400 }
      );
    }
    const archivedSession = await prisma.session.update({
      where: { id: parsedId },
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