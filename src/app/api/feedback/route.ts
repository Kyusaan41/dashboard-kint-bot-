import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// L'URL de votre bot qui Ã©coutera les feedbacks
const BOT_FEEDBACK_WEBHOOK_URL = 'http://193.70.34.25:20007/api/submit-feedback';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ message: 'Non autorisÃ©' }, { status: 401 });
    }

    try {
        const { feedbackText } = await request.json();
        if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
            return NextResponse.json({ message: 'Le texte du feedback est invalide.' }, { status: 400 });
        }

        const payload = {
            userId: session.user.id,
            username: session.user.name,
            avatarUrl: session.user.image,
            feedback: feedbackText,
        };

        // Envoyer les donnÃ©es au bot
        const botResponse = await fetch(BOT_FEEDBACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!botResponse.ok) {
            throw new Error('La requÃªte vers le bot a Ã©chouÃ©.');
        }

        return NextResponse.json({ message: 'Feedback envoyÃ© avec succÃ¨s !' });

    } catch (error) {
        console.error("Erreur dans l'API de feedback :", error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
