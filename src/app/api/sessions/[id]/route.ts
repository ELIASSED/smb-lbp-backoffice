import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Récupérer les détails d'un stage et ses session users par ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Attendre params
    const sessionId = parseInt(params.id);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "ID de session invalide" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        numeroStageAnts: true,
        startDate: true,
        endDate: true,
        location: true,
        users: {
          select: {
            id: true,
            userId: true,
            sessionId: true,
            isPaid: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                numeroPermis: true,
                casStage: true,
                id_recto: true,
                id_verso: true,
                permis_recto: true,
                permis_verso: true,
                letter_48N: true,
                extraDocument: true,
              },
            },
            session: {
              select: {
                numeroStageAnts: true,
                startDate: true,
                endDate: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 }
      );
    }

    // Convertir les dates en chaînes ISO pour la sérialisation
    return NextResponse.json({
      id: session.id,
      numeroAnts: session.numeroStageAnts,
      dateDebut: session.startDate.toISOString(),
      dateFin: session.endDate.toISOString(),
      lieu: session.location || "Non spécifié",
      sessionUsers: session.users.map((sessionUser) => ({
        id: sessionUser.id,
        userId: sessionUser.userId,
        sessionId: sessionUser.sessionId,
        isPaid: sessionUser.isPaid,
        createdAt: sessionUser.createdAt.toISOString(),
        user: {
          id: sessionUser.user.id,
          nom: sessionUser.user.nom,
          prenom: sessionUser.user.prenom,
          email: sessionUser.user.email,
          telephone: sessionUser.user.telephone,
          numeroPermis: sessionUser.user.numeroPermis,
          casStage: sessionUser.user.casStage,
          id_recto: sessionUser.user.id_recto,
          id_verso: sessionUser.user.id_verso,
          permis_recto: sessionUser.user.permis_recto,
          permis_verso: sessionUser.user.permis_verso,
          letter_48N: sessionUser.user.letter_48N,
          extraDocument: sessionUser.user.extraDocument,
        },
        session: {
          numeroStageAnts: sessionUser.session.numeroStageAnts,
          startDate: sessionUser.session.startDate.toISOString(),
          endDate: sessionUser.session.endDate.toISOString(),
          location: sessionUser.session.location || "Non spécifié",
        },
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la session:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const {
      numeroStageAnts,
      location,
      price,
      capacity,
      startDate,
      endDate,
      instructorId,
      psychologueId,
    } = await request.json();

    const parsedId = Number(params.id);
    const parsedPrice = Number(price);
    const parsedCapacity = Number(capacity);
    const parsedInstructorId = Number(instructorId);
    const parsedPsychologueId = Number(psychologueId);

    if (
      !parsedId ||
      isNaN(parsedId) ||
      !numeroStageAnts ||
      !location ||
      isNaN(parsedPrice) ||
      isNaN(parsedCapacity) ||
      !startDate ||
      !endDate ||
      isNaN(parsedInstructorId) ||
      isNaN(parsedPsychologueId)
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis et valides." },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id: parsedId },
      data: {
        numeroStageAnts,
        location,
        price: Math.round(parsedPrice),
        capacity: parsedCapacity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructor: { connect: { id: parsedInstructorId } },
        psychologue: { connect: { id: parsedPsychologueId } },
      },
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la session:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Session introuvable." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la session." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json(
        { error: "ID invalide ou manquant pour l'archivage." },
        { status: 400 }
      );
    }
    const session = await prisma.session.update({
      where: { id: parsedId },
      data: { isArchived: true },
    });
    console.log(`Session ${parsedId} archivée:`, session);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Erreur DELETE /api/sessions/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json(
        { error: "ID invalide ou manquant pour le désarchivage." },
        { status: 400 }
      );
    }
    const session = await prisma.session.update({
      where: { id: parsedId },
      data: { isArchived: false },
    });
    console.log(`Session ${parsedId} désarchivée:`, session);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Erreur PATCH /api/sessions/[id]:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Session introuvable." },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}