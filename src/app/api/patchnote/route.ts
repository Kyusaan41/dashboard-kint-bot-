// app/api/patchnote/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), './patchnote.json'); // ou juste 'patchnote.json'
    const data = await readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    return NextResponse.json(json);
  } catch (error) {
    console.error('Erreur lecture patchnote:', error);
    return NextResponse.json({ error: 'Erreur lecture patchnote' }, { status: 500 });
  }
}
