import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Récupérer tous les psychologues
    const psychologues = await prisma.psychologue.findMany();

    if (psychologues.length === 0) {
      return NextResponse.json({ message: "Aucun psychologue trouvé" });
    }

    return NextResponse.json({ psychologues });
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des psychologues" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
