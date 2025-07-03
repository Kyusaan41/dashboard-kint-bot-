import { NextResponse, NextRequest } from 'next/server';
const BOT_API_URL = 'http://51.83.103.24:20077/api';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const res = await fetch(`${BOT_API_URL}/points/${params.userId}/history`);
        if (!res.ok) throw new Error('Bot API error');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}