import { NextResponse } from 'next/server';

const NYXNODE_API = 'http://193.70.34.25:20007/api';

/**
 * GET /api/casino/top-wins?type=biggestWin|winCount|totalWins
 * Récupère les meilleurs gains des joueurs au casino
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'biggestWin';
        
        const response = await fetch(`${NYXNODE_API}/casino/top-wins?type=${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Erreur NyxNode top-wins:', response.status);
            return NextResponse.json({ players: [] }, { status: 200 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur fetch top-wins:', error);
        return NextResponse.json({ players: [] }, { status: 200 });
    }
}

/**
 * POST /api/casino/top-wins
 * Enregistre ou met à jour le plus gros gain d'un joueur
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`${NYXNODE_API}/casino/top-wins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('Erreur NyxNode POST top-wins:', response.status);
            return NextResponse.json({ success: false }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur POST top-wins:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}