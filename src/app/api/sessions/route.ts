import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Récupérer toutes les sessions
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        isArchived: false, // Filtrage des sessions non archivées
      },
      select: {
        id:true,
        price: true,
        numeroStageAnts: true,
        startDate: true,
        endDate: true,
        capacity: true,
        psychologue: {
          select: {
            // Remplacez ces propriétés par celles de votre modèle Psychologue
            id: true,
            firstName: true,
            lastName: true,
          
          },
        },
        instructor: {
          select: {
            // Remplacez ces propriétés par celles de votre modèle Instructor
            id: true,
            firstName: true, 
            lastName: true,
          },
        },
      },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des sessions.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


// POST: Créer une nouvelle session
export async function POST(request: Request) {
  try {
    const { numeroStageAnts, location, price, capacity, startDate, endDate, instructorId, psychologuetId } = await request.json();

    // Validation des données
    if (!numeroStageAnts || !location || !price || !capacity || !startDate || !endDate || !instructorId || !psychologuetId) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis.' },
        { status: 400 }
      );
    }

    const newSession = await prisma.session.create({
      data: {
        numeroStageAnts,
        location,
        price,
        capacity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructorId,
        psychologueId,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la session.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Modifier une session existante
export async function PUT(request: Request) {
  try {
    const { id, numeroStageAnts, location, price, capacity, startDate, endDate, instructorId, psychologuetId } = await request.json();

    // Validation des données
    if (!id || !numeroStageAnts || !location || !price || !capacity || !startDate || !endDate || !instructorId || !psychologuetId) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis.' },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        numeroStageAnts,
        location,
        price,
        capacity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructorId,
        psychologuetId,
      },
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la session.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}