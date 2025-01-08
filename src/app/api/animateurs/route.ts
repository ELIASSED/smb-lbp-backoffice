import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: [
        { lastName: 'asc' }, // Tri des instructeurs par nom de famille
      ],
    });

    // Si instructeurs sont trouvés, vérifier la structure des données
    console.log(instructors);  // Pour vérifier la structure des données dans la réponse

    return NextResponse.json(instructors);  // Retourner les instructeurs sous forme de tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des instructeurs", error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des instructeurs' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

