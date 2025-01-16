import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les instructeurs
export async function GET(request: Request) {
  try {
    const instructors = await prisma.instructor.findMany({
      where: {
        isArchived: false  // Filtre uniquement les non archivés
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        numeroAutorisationPrefectorale: true
      }
    });

    return NextResponse.json(instructors);  // Retourner les instructeurs sous forme de tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des instructeurs", error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des instructeurs' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Créer un instructeur
export async function POST(request: Request) {
  const { email, firstName, lastName, numeroAutorisationPrefectorale, phone } = await request.json();

  try {
    const newInstructor = await prisma.instructor.create({
      data: {
        email,
        firstName,
        lastName,
        numeroAutorisationPrefectorale,
        phone,
      },
    });

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'instructeur", error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'instructeur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
4