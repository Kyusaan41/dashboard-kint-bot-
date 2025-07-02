import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  // Await params car Next.js te le demande
  const params = await context.params;
  const userId = params.userId;

  const botApiUrl = `http://51.83.103.24:20077/api/messages/${userId}`;

  try {
    const res = await fetch(botApiUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur lors de la récupération des messages." }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
