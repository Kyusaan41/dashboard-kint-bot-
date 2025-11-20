import { NextRequest, NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

// POST /api/gacha/cards/destroy -> proxy vers NyxNode /api/gacha/cards/destroy
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const url = `${NYXNODE_API_URL}/api/gacha/cards/destroy`;

        const botResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await botResponse.json().catch(() => ({}));

        return NextResponse.json(data, {
            status: botResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[API /gacha/cards/destroy] Erreur proxy:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne du serveur (cards/destroy).' },
            { status: 500 },
        );
    }
}
