import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId manquant.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { nom: true, prenom: true, attestationPdf: true },
    });

    if (!user || !user.attestationPdf) {
      return NextResponse.json({ error: 'Aucune attestation trouvée.' }, { status: 404 });
    }

    return new NextResponse(user.attestationPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="attestation_${user.nom}_${user.prenom}.pdf"`,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l’attestation:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}