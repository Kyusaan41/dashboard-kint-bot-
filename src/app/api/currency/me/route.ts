import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NYXNODE_API_URL } from '@/config/api';

const BOT_API_URL = 'http://193.70.34.25:20007/api';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = session.user.id;

    try {
        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, { cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ balance: 0, tokens: 0 }, { status: 502 });
        const data = await res.json();
        // Try to read tokens from currency payload
        let tokensValue = Number(data.tokens ?? data.tokkens ?? data.token ?? NaN);

        // Fallback: fetch tokens balance from dedicated tokens endpoint if missing/NaN
        if (!isFinite(tokensValue)) {
            try {
                const tokRes = await fetch(`${NYXNODE_API_URL}/api/tokens/balance/${userId}`, { cache: 'no-store' });
                if (tokRes.ok) {
                    const tok = await tokRes.json();
                    // tokenRoute balance returns { userId, balance }
                    tokensValue = Number(tok.balance ?? 0);
                } else {
                    tokensValue = 0;
                }
            } catch {
                tokensValue = 0;
            }
        }

        // Normalize to { balance, tokens, level?, xp?, xpForNextLevel? }
        return NextResponse.json({
            balance: Number(data.balance ?? data.coins ?? 0),
            tokens: Number(tokensValue ?? 0),
            level: data.level ?? undefined,
            xp: data.xp ?? undefined,
            xpForNextLevel: data.xpForNextLevel ?? undefined,
        });
    } catch (error) {
        console.error('Erreur /api/currency/me GET:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = session.user.id;

    try {
        const body = await request.json();
        const action: 'add' | 'spend' | undefined = body?.action;
        const amount: number | undefined = body?.amount;
        const type: 'coins' | 'tokens' | undefined = body?.type;

        if (typeof amount !== 'number' || !isFinite(amount)) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        // Fetch current state from bot
        const currentRes = await fetch(`${BOT_API_URL}/currency/${userId}`, { cache: 'no-store' });
        if (!currentRes.ok) return NextResponse.json({ error: 'Impossible de récupérer le solde actuel' }, { status: 502 });
        const currentData = await currentRes.json();
        const currentBalance = currentData.balance ?? currentData.coins ?? 0;
        const currentTokens = (currentData.tokens ?? currentData.tokkens ?? currentData.token ?? 0);

        const isTokens = type === 'tokens';
        const sign = action === 'spend' ? -1 : 1; // default add if action undefined

        const newCoins = isTokens ? currentBalance : currentBalance + sign * amount;
        const newTokens = isTokens ? currentTokens + sign * amount : currentTokens;

        // Sanity: avoid negative values
        if ((isTokens && newTokens < 0) || (!isTokens && newCoins < 0)) {
            return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 });
        }

        // Send new totals to bot
        const payload: Record<string, number> = {};
        if (!isTokens) {
            payload.coins = newCoins;
            // Optionally also include 'balance' for compatibility
            payload.balance = newCoins;
        }
        if (isTokens) {
            // Send both keys to be compatible with bot API variations
            payload.tokens = newTokens;
            payload.tokkens = newTokens;
        }

        const res = await fetch(`${BOT_API_URL}/currency/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) return NextResponse.json({ error: data?.error || 'Erreur bot' }, { status: 502 });

        return NextResponse.json({ 
            updated: true, 
            balance: Number(newCoins), 
            tokens: Number(newTokens) 
        });
    } catch (error) {
        console.error('Erreur /api/currency/me POST:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
