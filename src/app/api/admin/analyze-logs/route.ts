import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BOT_API_URL = 'http://51.83.103.24:20077/api';

// Helper pour formater les logs KINT
type MemberInfo = { id: string; username: string; };
const formatKintLogs = (allLogs: any, members: MemberInfo[]): string => {
    const formattedLogs = [];
    for (const userId in allLogs) {
        const memberInfo = members.find((m: MemberInfo) => m.id === userId);
        const username = memberInfo?.username || `ID: ${userId}`;
        for (const log of allLogs[userId]) {
            formattedLogs.push(`${log.date}: ${username} a ${log.actionType.toLowerCase()} ${log.points} points. Raison: ${log.reason}`);
        }
    }
    return formattedLogs.sort((a, b) => new Date(b.split(':')[0]).getTime() - new Date(a.split(':')[0]).getTime()).slice(0, 50).join('\n');
};

export async function GET() {
    console.log("--- Début de l'analyse des logs ---");

    // 1. On vérifie la clé API au début de la requête
    if (!process.env.GEMINI_API_KEY) {
        console.error("ERREUR CRITIQUE: La variable d'environnement GEMINI_API_KEY est manquante ou n'est pas chargée. Avez-vous redémarré le serveur ?");
        return NextResponse.json({ error: "La clé API pour le service IA n'est pas configurée sur le serveur." }, { status: 500 });
    }
    
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Accès interdit. Rôle admin requis.' }, { status: 403 });
        }
        console.log("Étape 1: Vérification admin réussie.");

        // 2. Récupérer les vrais logs
        console.log("Étape 2: Récupération des logs depuis le bot...");
        const [botLogsRes, kintLogsRes, usersRes] = await Promise.all([
            fetch(`${BOT_API_URL}/logs`),
            fetch(`${BOT_API_URL}/points/history/all`),
            fetch(`${BOT_API_URL}/serverinfo`)
        ]);

        if (!botLogsRes.ok || !kintLogsRes.ok || !usersRes.ok) {
            throw new Error(`Impossible de récupérer tous les logs depuis le bot. Statuts: Bot=${botLogsRes.status}, Kint=${kintLogsRes.status}, Users=${usersRes.status}`);
        }
        console.log("Étape 2: Récupération des logs réussie.");
        
        const botLogsData = await botLogsRes.json();
        const kintLogsData = await kintLogsRes.json();
        const serverInfo = await usersRes.json();
        const members: MemberInfo[] = serverInfo.members || [];

        const recentBotLogs = botLogsData.logs.slice(-50).map((l: any) => `${l.timestamp}: ${l.log}`).join('\n');
        const recentKintLogs = formatKintLogs(kintLogsData, members);

        // 3. Construire le prompt pour l'IA
        const prompt = `
            Tu es un assistant expert pour un administrateur de serveur Discord.
            Analyse les logs suivants et fournis un résumé clair, détaillé et concis en français.
            
            Structure ta réponse en trois parties avec des titres en gras :
            1.  **Résumé de l'activité du jour :** Mentionne les événements importants.
            2.  **Analyse KINT :** Fais un résumé des activités des joueurs et points liées au jeu KINT.
            3.  **Anomalies détectées :** Signale tout comportement suspect. Si tu ne vois rien, dis "Aucune anomalie détectée".

            Voici les logs :
            --- LOGS GÉNÉRAUX ---
            ${recentBotLogs}

            --- LOGS POINTS KINT ---
            ${recentKintLogs}
        `;
        
        // 4. Appeler l'IA Gemini
        console.log("Étape 3: Envoi de la requête à l'IA Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Modèle plus rapide
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        console.log("Étape 3: Réponse de l'IA reçue.");

        // 5. Renvoyer la réponse
        console.log("--- Analyse terminée avec succès ---");
        return NextResponse.json({ analysis: analysisText });

    } catch (error) {
        console.error("Erreur dans /api/admin/analyze-logs:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: `Erreur interne du serveur lors de l'analyse: ${errorMessage}` }, { status: 500 });
    }
}