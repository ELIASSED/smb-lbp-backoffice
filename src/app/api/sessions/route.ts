import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        numeroStageAnts: true,
        price: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
        isArchived: true, // Critical: include isArchived
        instructor: {
          select: { firstName: true, lastName: true },
        },
        psychologue: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur GET /api/sessions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// POST: Créer une nouvelle session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/sessions body:", body);

    const {
      numeroStageAnts,
      description,
      location,
      price,
      capacity,
      startDate,
      endDate,
      instructorId,
      psychologueId,
    } = body;

    // --- Vérification des champs obligatoires ---
    const missingFields: string[] = [];
    if (!numeroStageAnts) missingFields.push("numeroStageAnts");
    if (price === undefined) missingFields.push("price");
    if (capacity === undefined) missingFields.push("capacity");
    if (!startDate) missingFields.push("startDate");
    if (!endDate) missingFields.push("endDate");
    if (!instructorId) missingFields.push("instructorId");
    if (!psychologueId) missingFields.push("psychologueId");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Les champs suivants sont obligatoires : ${missingFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // --- Conversion en nombres ---
    const numericPrice = Number(price);
    const numericCapacity = Number(capacity);
    const numericInstructorId = Number(instructorId);
    const numericPsychologueId = Number(psychologueId);

    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericCapacity) ||
      Number.isNaN(numericInstructorId) ||
      Number.isNaN(numericPsychologueId)
    ) {
      return NextResponse.json(
        {
          error:
            "Les champs 'price', 'capacity', 'instructorId' et 'psychologueId' doivent être des nombres valides.",
        },
        { status: 400 }
      );
    }

    // --- Vérification des dates ---
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        {
          error: "Les champs 'startDate' et 'endDate' doivent être des dates valides (format ISO).",
        },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        {
          error: "La date de début (startDate) doit être strictement antérieure à la date de fin (endDate).",
        },
        { status: 400 }
      );
    }

    // --- Vérification de l'existence de l'instructeur et du psychologue ---
    const instructorExists = await prisma.instructor.findUnique({
      where: { id: numericInstructorId },
    });
    const psychologistExists = await prisma.psychologue.findUnique({
      where: { id: numericPsychologueId },
    });

    if (!instructorExists) {
      return NextResponse.json(
        {
          error: `Aucun instructeur trouvé avec l'ID ${numericInstructorId}.`,
        },
        { status: 400 }
      );
    }
    if (!psychologistExists) {
      return NextResponse.json(
        {
          error: `Aucun psychologue trouvé avec l'ID ${numericPsychologueId}.`,
        },
        { status: 400 }
      );
    }

    // --- Création de la session ---
    const newSession = await prisma.session.create({
      data: {
        numeroStageAnts,
        price: numericPrice,
        capacity: numericCapacity,
        startDate: start,
        endDate: end,
        instructorId: numericInstructorId,
        psychologueId: numericPsychologueId,
        // isArchived: false, // => pas nécessaire, déjà par défaut dans votre schéma
      },
    });

    console.log("Session créée avec succès:", newSession);

    // --- Réponse réussie ---
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Une erreur interne est survenue lors de la création de la session.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Une erreur inconnue est survenue lors de la création de la session.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
