import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // <--- On importe depuis le nouveau fichier

const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET() {
    const session = await getServerSession(authOptions); // On utilise la config importée

    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ message: 'Accès interdit' }, { status: 403 });
    }

    try {
        const response = await fetch(`${BOT_API_URL}/users`);
        if (!response.ok) {
            return NextResponse.json({ message: "Impossible de récupérer les utilisateurs" }, { status: response.status });
        }
        const users = await response.json();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: 'Serveur du bot injoignable.' }, { status: 500 });
    }
}