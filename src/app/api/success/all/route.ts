// src/app/api/success/all/route.ts

import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    try {
        // On assume que votre bot a une route qui renvoie la config des succès
        const res = await fetch(`${BOT_API_URL}/success/all`); 

        if (!res.ok) {
            throw new Error("Impossible de récupérer la configuration des succès depuis le bot.");
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur API /api/success/all:", error);
        return NextResponse.json({}, { status: 500 });
    }
}