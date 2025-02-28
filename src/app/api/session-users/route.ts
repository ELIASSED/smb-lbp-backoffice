import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const sessionUsers = await prisma.sessionUsers.findMany({
      where: {
        session: { isArchived: false },
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            numeroPermis: true,
            dateDelivrancePermis: true,
            prefecture: true,
            etatPermis: true,
            casStage: true,
          },
        },
        session: {
          select: {
            id: true,
            numeroStageAnts: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sessionUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions utilisateur:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions utilisateur.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


// POST: Créer une nouvelle inscription (SessionUser)
export async function POST(request: Request) {
  const {
    civilite, nom, prenom, adresse, codePostal, ville, telephone, email,
    nationalite, dateNaissance, codePostalNaissance, numeroPermis,
    dateDelivrancePermis, prefecture, etatPermis, casStage, sessionId
  } = await request.json();

  const newUser = await prisma.user.create({
    data: {
      civilite, nom, prenom, adresse, codePostal, ville, telephone, email,
      nationalite, dateNaissance: new Date(dateNaissance), codePostalNaissance,
      numeroPermis, dateDelivrancePermis: new Date(dateDelivrancePermis),
      prefecture, etatPermis, casStage
    },
  });

  const sessionUser = await prisma.sessionUsers.create({
    data: {
      sessionId: Number(sessionId), // Assure-toi que sessionId est un nombre
      userId: newUser.id,
      isPaid: false,
    },
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          numeroPermis: true,
          dateDelivrancePermis: true,
          prefecture: true,
          etatPermis: true,
          casStage: true,
        },
      },
      session: {
        select: {
          id: true,
          numeroStageAnts: true,
          location: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return NextResponse.json(sessionUser, { status: 201 });
}