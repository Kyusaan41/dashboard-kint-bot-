import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON qui stocke le jackpot global
const JACKPOT_FILE_PATH = path.join('C:', 'Users', 'Kyusa', 'Documents', 'NyxBot', 'casino_jackpot.json');

// Valeur par défaut du jackpot
const DEFAULT_JACKPOT = 10000;

interface JackpotData {
    amount: number;
    lastWinner?: string;
    lastWinDate?: string;
    totalWins?: number;
}

// Fonction pour lire le jackpot depuis le fichier
function readJackpot(): JackpotData {
    try {
        // Créer le répertoire s'il n'existe pas
        const dir = path.dirname(JACKPOT_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Lire le fichier s'il existe
        if (fs.existsSync(JACKPOT_FILE_PATH)) {
            const data = fs.readFileSync(JACKPOT_FILE_PATH, 'utf-8');
            return JSON.parse(data);
        }

        // Créer le fichier avec la valeur par défaut
        const defaultData: JackpotData = { 
            amount: DEFAULT_JACKPOT,
            totalWins: 0
        };
        fs.writeFileSync(JACKPOT_FILE_PATH, JSON.stringify(defaultData, null, 2));
        return defaultData;
    } catch (error) {
        console.error('Erreur lecture jackpot:', error);
        return { amount: DEFAULT_JACKPOT, totalWins: 0 };
    }
}

// Fonction pour écrire le jackpot dans le fichier
function writeJackpot(data: JackpotData): void {
    try {
        const dir = path.dirname(JACKPOT_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(JACKPOT_FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur écriture jackpot:', error);
    }
}

// GET - Récupérer le jackpot actuel
export async function GET() {
    try {
        const jackpotData = readJackpot();
        return NextResponse.json(jackpotData);
    } catch (error) {
        console.error('Erreur GET jackpot:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du jackpot' },
            { status: 500 }
        );
    }
}

// POST - Augmenter le jackpot (quand un joueur perd)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount } = body;

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Montant invalide' },
                { status: 400 }
            );
        }

        const jackpotData = readJackpot();
        jackpotData.amount += amount;
        writeJackpot(jackpotData);

        return NextResponse.json({ 
            success: true, 
            newAmount: jackpotData.amount 
        });
    } catch (error) {
        console.error('Erreur POST jackpot:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'augmentation du jackpot' },
            { status: 500 }
        );
    }
}

// PUT - Réinitialiser le jackpot (quand quelqu'un gagne)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { winner, winAmount } = body;

        const jackpotData = readJackpot();
        const oldAmount = jackpotData.amount;

        // Réinitialiser le jackpot
        jackpotData.amount = DEFAULT_JACKPOT;
        jackpotData.lastWinner = winner;
        jackpotData.lastWinDate = new Date().toISOString();
        jackpotData.totalWins = (jackpotData.totalWins || 0) + 1;

        writeJackpot(jackpotData);

        return NextResponse.json({ 
            success: true, 
            oldAmount,
            newAmount: jackpotData.amount,
            winner,
            totalWins: jackpotData.totalWins
        });
    } catch (error) {
        console.error('Erreur PUT jackpot:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la réinitialisation du jackpot' },
            { status: 500 }
        );
    }
}