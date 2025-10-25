import { NextResponse } from 'next/server';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

/**
 * GET /api/casino/stats?type=biggestWin|winCount|totalWins
 * Récupère les statistiques triées selon le type depuis NyxNode
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'biggestWin';
        
        const response = await fetch(`${BOT_API_URL}/casino/stats?type=${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Erreur NyxNode stats:', response.status);
            return NextResponse.json({ players: [] }, { status: 200 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur fetch stats:', error);
        return NextResponse.json({ players: [] }, { status: 200 });
    }
}

/**
 * POST /api/casino/stats
 * Enregistre ou met à jour les statistiques d'un joueur sur NyxNode
 * Body: { username: string, amount: number, isJackpot: boolean }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`${BOT_API_URL}/casino/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('Erreur NyxNode POST stats:', response.status);
            return NextResponse.json({ success: false }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur POST stats:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}