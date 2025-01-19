import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Récupérer toutes les inscriptions utilisateur avec les informations nécessaires
    const sessionUsers = await prisma.sessionUsers.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            numeroPermis: true, // Champs spécifiques de l'utilisateur
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
      orderBy: {
        createdAt: 'desc', // Trier par la date de création
      },
    });

    return NextResponse.json(sessionUsers); // Retourner les inscriptions avec les données liées
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
  try {
    const data = await request.json();
    const {
      numeroPermis,
      dateDelivrancePermis,
      prefecture,
      etatPermis,
      casStage,
      sessionId,
      userId,
    } = data;

    // Validation des données requises
    if (!numeroPermis || !dateDelivrancePermis || !prefecture || !etatPermis || !casStage || !sessionId || !userId) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    // Vérification des relations
    const session = await prisma.session.findUnique({ where: { id: Number(sessionId) } });
    if (!session) {
      return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Création de l'inscription
    const newSessionUser = await prisma.sessionUsers.create({
      data: {
        numeroPermis,
        dateDelivrancePermis: new Date(dateDelivrancePermis),
        prefecture,
        etatPermis,
        casStage,
        sessionId: Number(sessionId),
        userId: Number(userId),
      },
    });

    return NextResponse.json(newSessionUser, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription :', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
