import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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
            attestationPdf: true, // Inclure le champ attestationPdf
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
      orderBy: { createdAt: "desc" },
    });

    const formattedSessionUsers = sessionUsers.map((sessionUser) => ({
      ...sessionUser,
      user: {
        ...sessionUser.user,
        attestationPdfUrl: sessionUser.user.attestationPdf
          ? `/api/attestations?userId=${sessionUser.user.id}`
          : null,
      },
    }));

    return NextResponse.json(formattedSessionUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des inscriptions utilisateur." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const {
    civilite, nom, prenom, adresse, codePostal, ville, telephone, email,
    nationalite, dateNaissance, codePostalNaissance, numeroPermis,
    dateDelivrancePermis, prefecture, etatPermis, casStage, sessionId,
    id_recto, id_verso, permis_recto, permis_verso,
  } = await request.json();

  try {
    const newUser = await prisma.user.create({
      data: {
        civilite, nom, prenom, adresse, codePostal, ville, telephone, email,
        nationalite, dateNaissance: new Date(dateNaissance), codePostalNaissance,
        numeroPermis, dateDelivrancePermis: new Date(dateDelivrancePermis),
        prefecture, etatPermis, casStage,
        id_recto, id_verso, permis_recto, permis_verso,
      },
    });

    const sessionUser = await prisma.sessionUsers.create({
      data: {
        sessionId: Number(sessionId),
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
            id_recto: true,
            id_verso: true,
            permis_recto: true,
            permis_verso: true,
            attestationPdf: true,
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

    const formattedSessionUser = {
      ...sessionUser,
      user: {
        ...sessionUser.user,
        attestationPdfUrl: sessionUser.user.attestationPdf
          ? `/api/attestations?userId=${sessionUser.user.id}`
          : null,
      },
    };

    return NextResponse.json(formattedSessionUser, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'inscription." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Ajout de la méthode PUT pour gérer "Marquer comme payé"
export async function PUT(request: Request) {
  const { id, isPaid } = await request.json();

  try {
    const updatedSessionUser = await prisma.sessionUsers.update({
      where: { id: Number(id) },
      data: { isPaid },
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
            attestationPdf: true,
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

    const formattedSessionUser = {
      ...updatedSessionUser,
      user: {
        ...updatedSessionUser.user,
        attestationPdfUrl: updatedSessionUser.user.attestationPdf
          ? `/api/attestations?userId=${updatedSessionUser.user.id}`
          : null,
      },
    };

    return NextResponse.json(formattedSessionUser);
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