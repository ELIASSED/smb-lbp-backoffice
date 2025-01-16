import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = Number(params.id); // Convertir l'ID string en number
  
      // Validation de l'ID
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: "ID invalide ou manquant pour l'archivage." },
          { status: 400 }
        );
      }
  
      // Archivage de la session
      const archivedSession = await prisma.session.update({
        where: { id },
        data: { isArchived: true },
      });
  
      return NextResponse.json(archivedSession, { status: 200 });
    } catch (error) {
      console.error("Erreur lors de l'archivage de la session:", error);
  
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Session introuvable." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { error: "Une erreur est survenue lors de l'archivage de la session." },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }