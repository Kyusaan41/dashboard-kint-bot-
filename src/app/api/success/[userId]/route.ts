import { NextResponse } from 'next/server';
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    try {
        const res = await fetch(`${BOT_API_URL}/success/${params.userId}`);
        if (!res.ok) throw new Error('Réponse du bot non valide');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ succes: [] }, { status: 500 });
    }
}