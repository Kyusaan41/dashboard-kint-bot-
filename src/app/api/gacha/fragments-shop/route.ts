import { NextResponse } from 'next/server';
import { NYXNODE_API_URL } from '@/config/api';

// GET /api/gacha/fragments-shop -> proxy vers NyxNode /api/gacha/fragments-shop
export async function GET(): Promise<NextResponse> {
    try {
        const url = `${NYXNODE_API_URL}/api/gacha/fragments-shop`;
        const botResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await botResponse.json().catch(() => ({}));

        return NextResponse.json(data, {
            status: botResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[API /gacha/fragments-shop] Erreur proxy:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne du serveur (fragments-shop).' },
            { status: 500 },
        );
    }
}
