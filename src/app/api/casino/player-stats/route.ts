import { NextResponse, NextRequest } from 'next/server';
const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Relayer la requête vers l'API du bot
        const botResponse = await fetch(`${BOT_API_URL}/api/casino/xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        // Tenter de parser la réponse du bot, même en cas d'erreur
        const responseData = await botResponse.json();

        // Si le bot a renvoyé une erreur, la relayer au client
        if (!botResponse.ok) {
            return NextResponse.json(responseData, { status: botResponse.status });
        }

        // Si tout s'est bien passé, renvoyer la réponse du bot
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("[PROXY ERROR] Erreur lors du relais vers /api/casino/xp:", error);
        return NextResponse.json({ success: false, message: 'Erreur de communication avec le serveur du bot.' }, { status: 502 });
    }
}