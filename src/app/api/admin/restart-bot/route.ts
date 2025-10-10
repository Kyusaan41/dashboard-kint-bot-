import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'AccÃ¨s interdit' }, { status: 403 });
    }

    try {
        const res = await fetch(`${BOT_API_URL}/restart`, { method: 'POST' });
        if (!res.ok) throw new Error('Ã‰chec de l\'ordre de redÃ©marrage');
        
        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
