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


type SessionUserRequest = {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string;
  prenom2?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  nationalite: string;
  dateNaissance: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  sessionId: number;
  id_recto?: string;
  id_verso?: string;
  permis_recto?: string;
  permis_verso?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as SessionUserRequest;
    console.log('📥 Requête reçue dans /api/session-users :', data);

    if (!data || !data.sessionId) {
      console.log('⚠️ Données invalides détectées.');
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    const requiredFields = [
      'civilite', 'nom', 'prenom', 'adresse', 'codePostal', 'ville', 'telephone',
      'email', 'nationalite', 'dateNaissance', 'codePostalNaissance', 'numeroPermis',
      'dateDelivrancePermis', 'prefecture', 'etatPermis', 'casStage',
    ] as const;
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      console.log('⚠️ Champs manquants :', missingFields);
      return NextResponse.json(
        { error: `Champs obligatoires manquants : ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedUserData = { /* ... idem ... */ };

    console.log('🔍 Vérification de la session avec sessionId :', data.sessionId);
    const session = await prisma.session.findUnique({ where: { id: data.sessionId } });
    if (!session) {
      console.log('⚠️ Session non trouvée pour sessionId :', data.sessionId);
      return NextResponse.json({ error: 'La session n’existe pas.' }, { status: 404 });
    }
    if (session.capacity <= 0) {
      console.log('⚠️ Capacité insuffisante pour sessionId :', data.sessionId);
      return NextResponse.json({ error: 'Plus de places disponibles.' }, { status: 400 });
    }

    const sessionUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: normalizedEmail },
        update: normalizedUserData,
        create: normalizedUserData,
      });

      const existingBySessionId = await tx.sessionUsers.findUnique({
        where: { sessionId_userId: { sessionId: data.sessionId, userId: user.id } },
      });
      if (existingBySessionId) {
        throw new Error('Cet utilisateur est déjà inscrit à cette session.');
      }

      const newSessionUser = await tx.sessionUsers.create({
        data: {
          sessionId: data.sessionId,
          userId: user.id,
        },
      });

      await tx.session.update({
        where: { id: data.sessionId },
        data: { capacity: { decrement: 1 } },
      });

      return newSessionUser;
    });

    console.log('✅ Inscription réussie pour l’utilisateur :', sessionUser.userId);
    return NextResponse.json({
      message: 'Utilisateur inscrit avec succès.',
      sessionUser,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur dans /api/session-users :', errMessage, error instanceof Error ? error.stack : '');
    return NextResponse.json({ error: errMessage }, { status: 500 });
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