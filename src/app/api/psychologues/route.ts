import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les psychologues, triés par nom de famille
export async function GET(request: Request) {
  try {
    const psychologues = await prisma.psychologue.findMany({
      orderBy: [
        { lastName: 'asc' }, // Tri des psychologues par nom de famille
      ],
    });

    return NextResponse.json(psychologues);  // Retourner les psychologues sous forme de tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des psychologues", error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des psychologues' }, { status: 500 });
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

// Modifier un psychologue existant
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, firstName, lastName, email, numeroAutorisationPrefectorale, phone } = data;

    const psychologue = await prisma.psychologue.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        numeroAutorisationPrefectorale,
        phone,
      },
    });

    return NextResponse.json(psychologue);  // Retourner le psychologue modifié
  } catch (error) {
    console.error("Erreur lors de la modification du psychologue", error);
    return NextResponse.json({ error: 'Erreur lors de la modification du psychologue' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Archiver un psychologue (par exemple, mettre à jour un champ `archived` pour marquer comme archivé)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    const psychologue = await prisma.psychologue.update({
      where: { id },
      data: {
        isArchived: true,  // Mettre à jour le champ 'archived' à true pour archiver
      },
    });

    return NextResponse.json(psychologue);  // Retourner le psychologue archivé
  } catch (error) {
    console.error("Erreur lors de l'archivage du psychologue", error);
    return NextResponse.json({ error: 'Erreur lors de l\'archivage du psychologue' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
