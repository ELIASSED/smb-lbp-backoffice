// pages/api/session-users/archive.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const sessionUser = await prisma.sessionUsers.findUnique({
      where: { id: Number(id) },
      include: { session: true },
    });

    if (!sessionUser) {
      return NextResponse.json({ error: `Inscription avec l'ID ${id} non trouvée` }, { status: 404 });
    }

    if (sessionUser.isArchived) {
      return NextResponse.json({ error: "Cette inscription est déjà archivée" }, { status: 400 });
    }

    const updatedSessionUser = await prisma.$transaction(async (tx) => {
      const archivedSessionUser = await tx.sessionUsers.update({
        where: { id: Number(id) },
        data: { isArchived: true },
      });

      // Restaurer la capacité du stage
      await tx.session.update({
        where: { id: sessionUser.sessionId },
        data: { capacity: { increment: 1 } },
      });

      return archivedSessionUser;
    });

    return NextResponse.json({
      success: true,
      message: `Inscription ${id} archivée avec succès`,
      data: updatedSessionUser,
    });
  } catch (error) {
    console.error("Erreur lors de l'archivage de l'inscription :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}