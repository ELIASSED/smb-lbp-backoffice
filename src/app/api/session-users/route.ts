import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Récupérer toutes les inscriptions utilisateur à des sessions
    const sessionUsers = await prisma.sessionUsers.findMany({
      include: {
        user: true,         // Inclure les informations de l'utilisateur
        session: true,      // Inclure les informations de la session
      },
      orderBy: {
        createdAt: 'desc',  // Trier par date de création de l'inscription
      },
    });

    return NextResponse.json(sessionUsers);  // Retourner les inscriptions sous forme de tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions utilisateur", error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des inscriptions utilisateur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
