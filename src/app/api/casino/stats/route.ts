import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'data', 'casino-stats.json');

// Type pour les statistiques d'un joueur
interface PlayerStats {
    username: string;
    biggestWin: number;
    totalWins: number;
    winCount: number;
    lastUpdated: string;
}

interface StatsData {
    players: PlayerStats[];
}

// Fonction pour lire les stats
function readStats(): StatsData {
    try {
        if (!fs.existsSync(STATS_FILE)) {
            const initialData: StatsData = { players: [] };
            fs.writeFileSync(STATS_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture stats:', error);
        return { players: [] };
    }
}

// Fonction pour écrire les stats
function writeStats(data: StatsData): void {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur écriture stats:', error);
    }
}

/**
 * GET /api/casino/stats?type=biggestWin|winCount|totalWins
 * Récupère les statistiques triées selon le type
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'biggestWin';
        
        const data = readStats();
        
        // Trier selon le type demandé
        let sortedPlayers = [...data.players];
        
        switch (type) {
            case 'winCount':
                sortedPlayers.sort((a, b) => b.winCount - a.winCount);
                break;
            case 'totalWins':
                sortedPlayers.sort((a, b) => b.totalWins - a.totalWins);
                break;
            case 'biggestWin':
            default:
                sortedPlayers.sort((a, b) => b.biggestWin - a.biggestWin);
                break;
        }
        
        return NextResponse.json({ players: sortedPlayers });
    } catch (error) {
        console.error('Erreur GET stats:', error);
        return NextResponse.json({ players: [] }, { status: 200 });
    }
}

/**
 * POST /api/casino/stats
 * Enregistre ou met à jour les statistiques d'un joueur
 * Body: { username: string, winAmount: number }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, winAmount } = body;
        
        if (!username || typeof winAmount !== 'number') {
            return NextResponse.json(
                { success: false, error: 'Données invalides' },
                { status: 400 }
            );
        }
        
        const data = readStats();
        
        // Trouver ou créer le joueur
        let player = data.players.find(p => p.username === username);
        
        if (player) {
            // Mettre à jour les stats existantes
            player.winCount += 1;
            player.totalWins += winAmount;
            if (winAmount > player.biggestWin) {
                player.biggestWin = winAmount;
            }
            player.lastUpdated = new Date().toISOString();
        } else {
            // Créer un nouveau joueur
            player = {
                username,
                biggestWin: winAmount,
                totalWins: winAmount,
                winCount: 1,
                lastUpdated: new Date().toISOString(),
            };
            data.players.push(player);
        }
        
        writeStats(data);
        
        return NextResponse.json({ success: true, player });
    } catch (error) {
        console.error('Erreur POST stats:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}