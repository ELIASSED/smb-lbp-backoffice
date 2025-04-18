import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const { id } = await req.json();

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    // Transaction pour garantir la cohérence
    const result = await prisma.$transaction(async (prisma) => {
      // Étape 1 : Récupérer l'inscription pour vérifier son état et obtenir le sessionId
      const sessionUser = await prisma.sessionUsers.findUnique({
        where: { id: Number(id) },
        include: { session: true },
      });

      if (!sessionUser) {
        throw new Error(`Inscription avec l'ID ${id} non trouvée`);
      }

      if (sessionUser.isPaid) {
        throw new Error("Cette inscription est déjà marquée comme payée");
      }

      if (sessionUser.session.capacity <= 0) {
        throw new Error("La capacité du stage est déjà épuisée");
      }

      // Étape 2 : Mettre à jour isPaid à true
      const updatedSessionUser = await prisma.sessionUsers.update({
        where: { id: Number(id) },
        data: { isPaid: true },
      });

      // Étape 3 : Décrémenter la capacité du stage
      const updatedSession = await prisma.session.update({
        where: { id: sessionUser.sessionId },
        data: { capacity: { decrement: 1 } },
      });

      

      return { updatedSessionUser, updatedSession };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Inscription ${id} marquée comme payée et capacité mise à jour`,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}