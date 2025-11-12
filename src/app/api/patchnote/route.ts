import { NextResponse } from 'next/server';
const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        const res = await fetch(`${BOT_API_URL}/patchnote`, { cache: 'no-store' });
        if (!res.ok) throw new Error('RÃ©ponse du bot non valide');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        // Eviter les erreurs 500 qui spamment la console du dashboard
        return NextResponse.json({ title: 'Patch Notes', ajouts: [], ajustements: [] }, { status: 200 });
    }
}
