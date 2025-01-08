import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        capacity: {
          gt: 0, // Filtre : sessions avec des places disponibles
        },
      },
      select: {
        id: true,
        numeroStageAnts: true,
        price: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
        instructor: true, // Inclure l'instructeur
        psychologue: true, // Inclure le psychologue
      },
    });

    if (Array.isArray(sessions)) {
      return NextResponse.json(sessions);
    } else {
      return NextResponse.json(
        { error: "Les données ne sont pas au format attendu" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sessions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newSession = await prisma.session.create({
      data: {
        numeroStageAnts: body.numeroStageAnts,
        price: body.price,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        location: body.location,
        capacity: body.capacity,
        instructorId: body.instructorId,
        psychologueId: body.psychologueId,
      },
    });

    return NextResponse.json({
      message: "Session créée avec succès",
      session: newSession,
    });
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la session est requis pour cette requête" },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Session mise à jour avec succès",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la session" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la session est requis pour cette requête" },
        { status: 400 }
      );
    }

    const deletedSession = await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Session supprimée avec succès",
      session: deletedSession,
    });
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la session" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
