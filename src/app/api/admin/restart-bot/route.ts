import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/restart`, { method: 'POST' });
        if (!res.ok) throw new Error('Échec de l\'ordre de redémarrage');
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}