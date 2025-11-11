import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const JETONS_FILE_PATH = path.join(process.cwd(), 'data', 'user-jetons.json');

// Helper to read jetons data
async function readJetonsData() {
    try {
        const data = await fs.readFile(JETONS_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(JETONS_FILE_PATH, JSON.stringify({}), 'utf-8');
            return {};
        }
        console.error('Error reading jetons data:', error);
        return {};
    }
}

// Helper to write jetons data
async function writeJetonsData(data: any) {
    await fs.writeFile(JETONS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    try {
        const jetonsData = await readJetonsData();
        const balance = jetonsData[userId]?.balance ?? 0;
        return NextResponse.json({ balance });
    } catch (error) {
        console.error('Error /api/jetons/me GET:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    try {
        const { amount } = await request.json();
        if (typeof amount !== 'number') return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

        const jetonsData = await readJetonsData();
        const currentBalance = jetonsData[userId]?.balance ?? 0;
        const newBalance = currentBalance + amount;

        if (newBalance < 0) {
            return NextResponse.json({ error: 'Insufficient jetons' }, { status: 400 });
        }

        jetonsData[userId] = { ...jetonsData[userId], balance: newBalance };
        await writeJetonsData(jetonsData);

        return NextResponse.json({ updated: true, balance: newBalance });
    } catch (error) {
        console.error('Error /api/jetons/me POST:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
