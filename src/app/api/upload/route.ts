import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier uploadé" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(process.cwd(), "public/uploads", file.name);
    await writeFile(filePath, buffer);

    const url = `/uploads/${file.name}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}