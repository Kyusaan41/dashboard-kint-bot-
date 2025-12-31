import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Configuration des récompenses du calendrier de l'Avent
const ADVENT_REWARDS = [
  { day: 1, type: 'currency', amount: 100, name: 'Pièces d\'or', description: '100 pièces scintillantes' },
  { day: 2, type: 'tokens', amount: 50, name: 'Jetons magiques', description: '50 jetons pour le casino' },
  { day: 3, type: 'orbs', amount: 5, name: 'Orbes mystiques', description: '5 orbes pour les gachas' },
  { day: 4, type: 'currency', amount: 150, name: 'Pièces d\'or', description: '150 pièces scintillantes' },
  { day: 5, type: 'tokens', amount: 75, name: 'Jetons magiques', description: '75 jetons pour le casino' },
  { day: 6, type: 'orbs', amount: 7, name: 'Orbes mystiques', description: '7 orbes pour les gachas' },
  { day: 7, type: 'currency', amount: 200, name: 'Pièces d\'or', description: '200 pièces scintillantes' },
  { day: 8, type: 'tokens', amount: 100, name: 'Jetons magiques', description: '100 jetons pour le casino' },
  { day: 9, type: 'orbs', amount: 10, name: 'Orbes mystiques', description: '10 orbes pour les gachas' },
  { day: 10, type: 'currency', amount: 250, name: 'Pièces d\'or', description: '250 pièces scintillantes' },
  { day: 11, type: 'tokens', amount: 125, name: 'Jetons magiques', description: '125 jetons pour le casino' },
  { day: 12, type: 'orbs', amount: 12, name: 'Orbes mystiques', description: '12 orbes pour les gachas' },
  { day: 13, type: 'currency', amount: 300, name: 'Pièces d\'or', description: '300 pièces scintillantes' },
  { day: 14, type: 'tokens', amount: 150, name: 'Jetons magiques', description: '150 jetons pour le casino' },
  { day: 15, type: 'orbs', amount: 15, name: 'Orbes mystiques', description: '15 orbes pour les gachas' },
  { day: 16, type: 'currency', amount: 350, name: 'Pièces d\'or', description: '350 pièces scintillantes' },
  { day: 17, type: 'tokens', amount: 175, name: 'Jetons magiques', description: '175 jetons pour le casino' },
  { day: 18, type: 'orbs', amount: 18, name: 'Orbes mystiques', description: '18 orbes pour les gachas' },
  { day: 19, type: 'currency', amount: 400, name: 'Pièces d\'or', description: '400 pièces scintillantes' },
  { day: 20, type: 'tokens', amount: 200, name: 'Jetons magiques', description: '200 jetons pour le casino' },
  { day: 21, type: 'orbs', amount: 20, name: 'Orbes mystiques', description: '20 orbes pour les gachas' },
  { day: 22, type: 'currency', amount: 500, name: 'Pièces d\'or', description: '500 pièces scintillantes' },
  { day: 23, type: 'tokens', amount: 250, name: 'Jetons magiques', description: '250 jetons pour le casino' },
  { day: 24, type: 'orbs', amount: 25, name: 'Orbes mystiques', description: '25 orbes pour les gachas + bonus spécial' },
];

const ADVENT_DATA_FILE = path.join(__dirname, '..', '..', '..', '..', 'data', 'advent-calendar-bot.json');
const CURRENCY_FILE = path.join(__dirname, '..', '..', '..', '..', 'currency.json');

function isChristmasPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  return now >= new Date(year, 11, 1) && now <= new Date(year, 11, 24, 23, 59, 59);
}

function getCurrentDay(): number {
  return Math.min(24, Math.max(1, new Date().getDate()));
}

function readCurrency() {
  try {
    return JSON.parse(readFileSync(CURRENCY_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeCurrency(data: any) {
  writeFileSync(CURRENCY_FILE, JSON.stringify(data, null, 2));
}

function readAdventData() {
  try {
    if (!existsSync(ADVENT_DATA_FILE)) {
      writeFileSync(ADVENT_DATA_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    return JSON.parse(readFileSync(ADVENT_DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeAdventData(data: any) {
  writeFileSync(ADVENT_DATA_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const body = await request.json();
  const { day } = body;

  if (!day || day < 1 || day > 24) return NextResponse.json({ error: 'Jour invalide' }, { status: 400 });
  if (!isChristmasPeriod()) return NextResponse.json({ error: 'Calendrier non disponible' }, { status: 400 });

  const currentDay = getCurrentDay();
  if (day > currentDay) return NextResponse.json({ error: 'Jour non débloqué' }, { status: 400 });

  const data = readAdventData();
  if (data[userId] && data[userId].includes(day)) return NextResponse.json({ error: 'Déjà réclamé' }, { status: 400 });

  const reward = ADVENT_REWARDS.find(r => r.day === day);
  if (!reward) return NextResponse.json({ error: 'Récompense introuvable' }, { status: 404 });

  // Charger currency
  const currency = readCurrency();
  if (!currency[userId]) currency[userId] = { balance: 0, tokens: 0 };

  let success = false;

  switch (reward.type) {
    case 'currency':
      currency[userId].balance += reward.amount;
      writeCurrency(currency);
      console.log(`[ADVENT-CALENDAR-DASHBOARD] Added ${reward.amount} coins to ${userId}. New balance: ${currency[userId].balance}`);
      success = true;
      break;

    case 'tokens':
      currency[userId].tokens += reward.amount;
      writeCurrency(currency);
      console.log(`[ADVENT-CALENDAR-DASHBOARD] Added ${reward.amount} tokens to ${userId}. New tokens: ${currency[userId].tokens}`);
      success = true;
      break;

    case 'orbs': {
        const gachaFile = path.join(__dirname, '..', '..', '..', '..', 'gacha_wishes.json');
        let gacha: any = {};

        try {
          gacha = JSON.parse(readFileSync(gachaFile, 'utf-8'));
        } catch {
          gacha = {};
        }

        // Structure utilisateur
        if (!gacha[userId]) {
          gacha[userId] = { wishes: 0, pity: {} };
        }

        if (typeof gacha[userId].wishes !== 'number') {
          gacha[userId].wishes = 0;
        }

        // Ajout des orbes
        gacha[userId].wishes += reward.amount;

        writeFileSync(gachaFile, JSON.stringify(gacha, null, 2));

        console.log(`[ADVENT-CALENDAR-DASHBOARD] Added ${reward.amount} orbs to ${userId}. Total wishes: ${gacha[userId].wishes}`);

        success = true;
        break;
      }
  }

  if (!success) {
    return NextResponse.json({ error: 'Erreur lors de la distribution' }, { status: 500 });
  }

  // Enregistrement du jour réclamé
  if (!data[userId]) data[userId] = [];
  data[userId].push(day);
  writeAdventData(data);

  return NextResponse.json({ success: true, reward });
}