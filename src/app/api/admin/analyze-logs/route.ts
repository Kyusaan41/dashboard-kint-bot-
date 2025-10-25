import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BOT_API_URL = 'http://193.70.34.25:20007/api';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("La clÃ© API GEMINI est manquante.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    // On trie par date pour s'assurer que les plus rÃ©cents sont en premier
    return formattedLogs.sort((a, b) => new Date(b.split('Z')[0]).getTime() - new Date(a.split('Z')[0]).getTime()).join('\n');
};

export async function GET() {
    console.log("--- DÃ©but de l'analyse des logs du jour ---");

    if (!process.env.GEMINI_API_KEY) {
        console.error("ERREUR CRITIQUE: La variable d'environnement GEMINI_API_KEY est manquante.");
        return NextResponse.json({ error: "La clÃ© API pour le service IA n'est pas configurÃ©e sur le serveur." }, { status: 500 });
    }
    
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'AccÃ¨s interdit. RÃ´le admin requis.' }, { status: 403 });
        }
        console.log("Ã‰tape 1: VÃ©rification admin rÃ©ussie.");

        // --- NOUVELLE LOGIQUE DE FILTRAGE PAR DATE ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // RÃ¨gle l'heure Ã  minuit aujourd'hui

        console.log(`Ã‰tape 2: RÃ©cupÃ©ration des logs et filtrage Ã  partir du ${today.toISOString()}`);
        
        const [botLogsRes, kintLogsRes, usersRes] = await Promise.all([
            fetch(`${BOT_API_URL}/logs`),
            fetch(`${BOT_API_URL}/points/history/all`),
            fetch(`${BOT_API_URL}/serverinfo`)
        ]);

        if (!botLogsRes.ok || !kintLogsRes.ok || !usersRes.ok) {
            throw new Error("Impossible de rÃ©cupÃ©rer les logs depuis le bot.");
        }
        
        const botLogsData = await botLogsRes.json();
        const kintLogsData = await kintLogsRes.json();
        const serverInfo = await usersRes.json();
        const members: MemberInfo[] = serverInfo.members || [];

        // On filtre les logs gÃ©nÃ©raux pour ne garder que ceux d'aujourd'hui
        const todaysBotLogs = botLogsData.logs
            .filter((log: any) => new Date(log.timestamp) >= today)
            .map((l: any) => `${l.timestamp}: ${l.log}`)
            .join('\n');

        // On filtre les logs KINT pour ne garder que ceux d'aujourd'hui
        const todaysKintLogsData: { [key: string]: any[] } = {};
        for (const userId in kintLogsData) {
            const userLogsToday = kintLogsData[userId].filter((log: any) => new Date(log.date) >= today);
            if (userLogsToday.length > 0) {
                todaysKintLogsData[userId] = userLogsToday;
            }
        }
        const todaysKintLogsFormatted = formatKintLogs(todaysKintLogsData, members);
        // --- FIN DE LA LOGIQUE DE FILTRAGE ---

        // On vÃ©rifie s'il y a eu une activitÃ© aujourd'hui
        if (!todaysBotLogs && !todaysKintLogsFormatted) {
            return NextResponse.json({ analysis: "Aucune activitÃ© enregistrÃ©e aujourd'hui sur le serveur." });
        }

        const prompt = `
            Tu es un analyste de communautÃ© expert pour un bot Discord nommÃ© Kint (CrÃ©er par KyÃ»).
            Analyse les logs d'aujourd'hui uniquement et fournis un rapport de synthÃ¨se en franÃ§ais, clair et structurÃ©.

            Structure ta rÃ©ponse en utilisant des titres en gras et des listes Ã  puces. Voici le format attendu :
            
            **1. ActivitÃ© GÃ©nÃ©rale du Jour**
            * Dis bonjour ou Bonsoir, donne la date du jour. RÃ©sume les Ã©vÃ©nements clÃ©s. Quantifie les actions si possible.

            **2. Analyse de l'Ã‰conomie KINT du Jour**
            * Identifie le plus grand gagnant et le plus grand perdant du jour.
            * RÃ©sume les tendances gÃ©nÃ©rales des points.

            **3. DÃ©tection d'Anomalies du Jour**
            * Cherche des comportements suspects survenus aujourd'hui.
            * Si aucune anomalie n'est dÃ©tectÃ©e, indique-le clairement.

            Voici les logs d'aujourd'hui :
            --- LOGS GÃ‰NÃ‰RAUX ---
            ${todaysBotLogs || "Aucun log gÃ©nÃ©ral aujourd'hui."}

            --- LOGS POINTS KINT ---
            ${todaysKintLogsFormatted || "Aucune transaction KINT aujourd'hui."}
        `;
        
        console.log("Ã‰tape 3: Envoi de la requÃªte Ã  l'IA Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        console.log("Ã‰tape 3: RÃ©ponse de l'IA reÃ§ue.");

        console.log("--- Analyse du jour terminÃ©e avec succÃ¨s ---");
        return NextResponse.json({ analysis: analysisText });

    } catch (error) {
        console.error("Erreur dans /api/admin/analyze-logs:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: `Erreur interne du serveur lors de l'analyse: ${errorMessage}` }, { status: 500 });
    }
}
