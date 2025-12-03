import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const ADVENT_DATA_FILE = path.join(__dirname, '..', '..', '..', '..', 'data', 'advent-calendar-bot.json');

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

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const data = readAdventData();
  const claimed = data[params.userId] || [];
  return NextResponse.json({ claimed });
}