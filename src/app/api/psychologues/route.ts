import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les psychologues, triés par nom de famille
export async function GET() {
  try {
    const psychologists = await prisma.psychologue.findMany({
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
    return NextResponse.json(psychologists);
  } catch (error) {
    console.error("Erreur lors de la récupération des psychologues", error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des psychologues' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Créer un psychologue
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const psychologue = await prisma.psychologue.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        numeroAutorisationPrefectorale: data.numeroAutorisationPrefectorale,
        phone: data.phone,
      },
    });

    return NextResponse.json(psychologue, { status: 201 });  // Retourner le psychologue créé
  } catch (error) {
    console.error("Erreur lors de la création du psychologue", error);
    return NextResponse.json({ error: 'Erreur lors de la création du psychologue' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

