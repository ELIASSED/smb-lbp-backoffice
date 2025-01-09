import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupération des sessions depuis la base de données
    const sessions = await prisma.session.findMany();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des sessions.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}