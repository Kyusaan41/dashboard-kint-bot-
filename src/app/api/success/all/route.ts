// src/app/api/success/all/route.ts

import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        // On assume que votre bot a une route qui renvoie la config des succÃ¨s
        const res = await fetch(`${BOT_API_URL}/success/all`); 

        if (!res.ok) {
            throw new Error("Impossible de rÃ©cupÃ©rer la configuration des succÃ¨s depuis le bot.");
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erreur API /api/success/all:", error);
        return NextResponse.json({}, { status: 500 });
    }
}
