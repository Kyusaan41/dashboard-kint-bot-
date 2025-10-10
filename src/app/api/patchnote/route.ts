import { NextResponse } from 'next/server';
const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET() {
    try {
        const res = await fetch(`${BOT_API_URL}/patchnote`);
        if (!res.ok) throw new Error('RÃ©ponse du bot non valide');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ title: 'Erreur', ajouts: ['Impossible de charger les notes de mise Ã  jour.'], ajustements: [] }, { status: 500 });
    }
}
