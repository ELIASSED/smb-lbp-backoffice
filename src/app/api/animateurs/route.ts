import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les instructeurs
export async function GET(request: Request) {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: [
        { lastName: 'asc' },
      ],
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

// Modifier un instructeur
export async function PUT(request: Request) {
  const { id, email, firstName, lastName, numeroAutorisationPrefectorale, phone } = await request.json();

  try {
    const updatedInstructor = await prisma.instructor.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        numeroAutorisationPrefectorale,
        phone,
      },
    });

    return NextResponse.json(updatedInstructor);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'instructeur", error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'instructeur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Archiver un instructeur (en le marquant comme archivé)
export async function DELETE(request: Request) {
  const { id } = await request.json();

  try {
    const archivedInstructor = await prisma.instructor.update({
      where: { id },
      data: {
        // Vous pouvez ajouter un champ "archivé" ou autre méthode pour marquer l'archivage
        isArchived: true,
      },
    });

    return NextResponse.json(archivedInstructor);
  } catch (error) {
    console.error("Erreur lors de l'archivage de l'instructeur", error);
    return NextResponse.json({ error: 'Erreur lors de l\'archivage de l\'instructeur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
