// app/api/session-users/[id]/route.ts (PUT)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { isPaid } = await request.json();
  const id = parseInt(params.id);

  const sessionUser = await prisma.sessionUsers.update({
    where: { id },
    data: { isPaid },
  });

  return NextResponse.json(sessionUser, { status: 200 });
}