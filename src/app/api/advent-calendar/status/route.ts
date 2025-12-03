import { NextResponse } from 'next/server'
import path from 'path'
import { readFileSync } from 'fs'

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

function isChristmasPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  return now >= new Date(year, 11, 1) && now <= new Date(year, 11, 24, 23, 59, 59);
}

function getCurrentDay(): number {
  return Math.min(24, Math.max(1, new Date().getDate()));
}

export async function GET() {
  if (!isChristmasPeriod()) {
    return NextResponse.json({ active: false, message: 'Disponible du 1er au 24 décembre' });
  }

  const currentDay = getCurrentDay();
  const response = {
    active: true,
    currentDay,
    calendar: ADVENT_REWARDS.map(r => ({
      ...r,
      unlocked: r.day <= currentDay,
      claimed: false // This will be set per user in claimed route
    }))
  };

  return NextResponse.json(response);
}