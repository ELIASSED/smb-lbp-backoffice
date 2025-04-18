import { NextResponse } from 'next/server';
import { PrismaClient, SessionUsers, User, Session } from '@prisma/client';
import generateAttestation from '@/lib/generateAttestation';

const prisma = new PrismaClient();

interface GenerateAttestationRequest {
  sessionId: number;
  userId: number;
}

export async function POST(request: Request) {
  try {
    const { sessionId, userId } = (await request.json()) as GenerateAttestationRequest;

    // Validate input
    if (!sessionId || !userId) {
      console.warn('⚠️ Données manquantes:', { sessionId, userId });
      return NextResponse.json({ error: 'sessionId et userId sont requis.' }, { status: 400 });
    }

    // Check if SessionUsers exists and is paid
    const sessionUser = await prisma.sessionUsers.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
      include: { user: true, session: true },
    });

    if (!sessionUser) {
      console.warn('⚠️ Inscription non trouvée:', { sessionId, userId });
      return NextResponse.json({ error: 'Inscription non trouvée.' }, { status: 404 });
    }

    if (!sessionUser.isPaid) {
      console.warn('⚠️ Paiement non confirmé:', { sessionId, userId });
      return NextResponse.json({ error: 'Paiement non confirmé pour cette inscription.' }, { status: 400 });
    }

    // Generate attestation PDF
    const pdfBuffer = await generateAttestation(sessionUser as SessionUsers & { user: User; session: Session });

    // Store PDF in User.attestationPdf
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { attestationPdf: pdfBuffer },
    });

    console.log('✅ Attestation générée et stockée:', { sessionId, userId });

    return NextResponse.json({
      message: 'Attestation générée et stockée avec succès.',
      userId: updatedUser.id,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur dans /api/generate-attestation:', errMessage);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}