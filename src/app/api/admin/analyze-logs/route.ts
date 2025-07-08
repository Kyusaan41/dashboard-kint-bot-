import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BOT_API_URL = 'http://51.83.103.24:20077/api';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("La clé API GEMINI est manquante.");
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
    // On trie par date pour s'assurer que les plus récents sont en premier
    return formattedLogs.sort((a, b) => new Date(b.split('Z')[0]).getTime() - new Date(a.split('Z')[0]).getTime()).join('\n');
};

export async function GET() {
    console.log("--- Début de l'analyse des logs du jour ---");

    if (!process.env.GEMINI_API_KEY) {
        console.error("ERREUR CRITIQUE: La variable d'environnement GEMINI_API_KEY est manquante.");
        return NextResponse.json({ error: "La clé API pour le service IA n'est pas configurée sur le serveur." }, { status: 500 });
    }
    
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Accès interdit. Rôle admin requis.' }, { status: 403 });
        }
        console.log("Étape 1: Vérification admin réussie.");

        // --- NOUVELLE LOGIQUE DE FILTRAGE PAR DATE ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Règle l'heure à minuit aujourd'hui

        console.log(`Étape 2: Récupération des logs et filtrage à partir du ${today.toISOString()}`);
        
        const [botLogsRes, kintLogsRes, usersRes] = await Promise.all([
            fetch(`${BOT_API_URL}/logs`),
            fetch(`${BOT_API_URL}/points/history/all`),
            fetch(`${BOT_API_URL}/serverinfo`)
        ]);

        if (!botLogsRes.ok || !kintLogsRes.ok || !usersRes.ok) {
            throw new Error("Impossible de récupérer les logs depuis le bot.");
        }
        
        const botLogsData = await botLogsRes.json();
        const kintLogsData = await kintLogsRes.json();
        const serverInfo = await usersRes.json();
        const members: MemberInfo[] = serverInfo.members || [];

        // On filtre les logs généraux pour ne garder que ceux d'aujourd'hui
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

        // On vérifie s'il y a eu une activité aujourd'hui
        if (!todaysBotLogs && !todaysKintLogsFormatted) {
            return NextResponse.json({ analysis: "Aucune activité enregistrée aujourd'hui sur le serveur." });
        }

        const prompt = `
            Tu es un analyste de communauté expert pour un bot Discord nommé Kint (Créer par Kyû).
            Analyse les logs d'aujourd'hui uniquement et fournis un rapport de synthèse en français, clair et structuré.

            Structure ta réponse en utilisant des titres en gras et des listes à puces. Voici le format attendu :
            
            **1. Activité Générale du Jour**
            * Dis bonjour ou Bonsoir, donne la date du jour. Résume les événements clés. Quantifie les actions si possible.

            **2. Analyse de l'Économie KINT du Jour**
            * Identifie le plus grand gagnant et le plus grand perdant du jour.
            * Résume les tendances générales des points.

            **3. Détection d'Anomalies du Jour**
            * Cherche des comportements suspects survenus aujourd'hui.
            * Si aucune anomalie n'est détectée, indique-le clairement.

            Voici les logs d'aujourd'hui :
            --- LOGS GÉNÉRAUX ---
            ${todaysBotLogs || "Aucun log général aujourd'hui."}

            --- LOGS POINTS KINT ---
            ${todaysKintLogsFormatted || "Aucune transaction KINT aujourd'hui."}
        `;
        
        console.log("Étape 3: Envoi de la requête à l'IA Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        console.log("Étape 3: Réponse de l'IA reçue.");

        console.log("--- Analyse du jour terminée avec succès ---");
        return NextResponse.json({ analysis: analysisText });

    } catch (error) {
        console.error("Erreur dans /api/admin/analyze-logs:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: `Erreur interne du serveur lors de l'analyse: ${errorMessage}` }, { status: 500 });
    }
}