// pages/api/session-users/[id].ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const existingSessionUser = await prisma.sessionUsers.findUnique({
      where: { id },
      include: { user: true, session: true },
    });

    if (!existingSessionUser) {
      return NextResponse.json({ error: "Inscription non trouvée" }, { status: 404 });
    }

    const updatedSessionUser = await prisma.$transaction(async (tx) => {
      // Mise à jour des données utilisateur
      const updatedUser = await tx.user.update({
        where: { id: existingSessionUser.userId },
        data: {
          nom: data.nom ?? existingSessionUser.user.nom,
          prenom: data.prenom ?? existingSessionUser.user.prenom,
          email: data.email ?? existingSessionUser.user.email,
          telephone: data.telephone ?? existingSessionUser.user.telephone,
          numeroPermis: data.numeroPermis ?? existingSessionUser.user.numeroPermis,
          dateDelivrancePermis: data.dateDelivrancePermis
            ? new Date(data.dateDelivrancePermis)
            : existingSessionUser.user.dateDelivrancePermis,
          prefecture: data.prefecture ?? existingSessionUser.user.prefecture,
          etatPermis: data.etatPermis ?? existingSessionUser.user.etatPermis,
          casStage: data.casStage ?? existingSessionUser.user.casStage,
          id_recto: data.id_recto ?? existingSessionUser.user.id_recto,
          id_verso: data.id_verso ?? existingSessionUser.user.id_verso,
          permis_recto: data.permis_recto ?? existingSessionUser.user.permis_recto,
          permis_verso: data.permis_verso ?? existingSessionUser.user.permis_verso,
        },
      });

      // Gestion du changement de session
      const newSessionId = data.sessionId ? Number(data.sessionId) : existingSessionUser.sessionId;
      if (newSessionId !== existingSessionUser.sessionId) {
        // Vérifier la nouvelle session
        const newSession = await tx.session.findUnique({ where: { id: newSessionId } });
        if (!newSession) {
          throw new Error(`Session avec l'ID ${newSessionId} non trouvée`);
        }
        if (newSession.capacity <= 0 && !existingSessionUser.isPaid) {
          throw new Error("Plus de places disponibles dans la nouvelle session");
        }

        // Restaurer la capacité de l’ancien stage
        await tx.session.update({
          where: { id: existingSessionUser.sessionId },
          data: { capacity: { increment: 1 } },
        });

        // Réduire la capacité du nouveau stage
        await tx.session.update({
          where: { id: newSessionId },
          data: { capacity: { decrement: 1 } },
        });
      }

      // Mise à jour de SessionUsers
      const updatedSessionUser = await tx.sessionUsers.update({
        where: { id },
        data: {
          sessionId: newSessionId,
          isPaid: data.isPaid ?? existingSessionUser.isPaid,
        },
        include: { user: true, session: true },
      });

      return updatedSessionUser;
    });

    return NextResponse.json(updatedSessionUser, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}