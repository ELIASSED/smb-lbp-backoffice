import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    // Vérifier si l'inscription existe
    const existingSessionUser = await prisma.sessionUsers.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingSessionUser) {
      return NextResponse.json({ error: "Inscription non trouvée" }, { status: 404 });
    }

    // Mise à jour des données de l'utilisateur associé
    const updatedUser = await prisma.user.update({
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

    // Mise à jour de la session associée et du statut de paiement
    const updatedSessionUser = await prisma.sessionUsers.update({
      where: { id },
      data: {
        sessionId: data.sessionId ? Number(data.sessionId) : existingSessionUser.sessionId,
        isPaid: data.isPaid ?? existingSessionUser.isPaid,
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
            id_recto: true,
            id_verso: true,
            permis_recto: true,
            permis_verso: true,
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

    return NextResponse.json(updatedSessionUser, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'inscription." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}