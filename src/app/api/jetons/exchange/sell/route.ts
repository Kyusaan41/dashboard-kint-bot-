import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { amount } = await request.json();
        
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        const SELL_RATE = 0.02; // 1000 Jetons = 20 Pièces (soit 1 Jeton = 0.02 Pièce)
        const gainInCurrency = amount * SELL_RATE;

        // 1. Déduire les jetons
        const jetonsRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jetons/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ amount: -amount }),
        });

        if (!jetonsRes.ok) {
            const errorData = await jetonsRes.json();
            return NextResponse.json({ 
                error: errorData.error || 'Solde de jetons insuffisant' 
            }, { status: 400 });
        }

        // 2. Ajouter les pièces
        const currencyRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/currency/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({ amount: gainInCurrency }),
        });

        if (!currencyRes.ok) {
            // Rembourser les jetons en cas d'erreur
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jetons/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({ amount: amount }),
            });
            
            const errorData = await currencyRes.json();
            return NextResponse.json({ 
                error: errorData.error || 'Erreur lors de l\'ajout des pièces' 
            }, { status: 500 });
        }

        const updatedJetons = await jetonsRes.json();
        const updatedCurrency = await currencyRes.json();

        return NextResponse.json({
            success: true,
            currencyBalance: updatedCurrency.balance,
            jetonsBalance: updatedJetons.balance,
            gain: gainInCurrency,
            sold: amount
        });

    } catch (error) {
        console.error('Erreur vente jetons:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}