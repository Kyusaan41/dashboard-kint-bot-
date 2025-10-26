import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backendResponse = await fetch('http://193.70.34.25:20007/api/gacha/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!backendResponse.ok) {
      // On essaie de lire le corps de la réponse d'erreur du backend
      const errorBody = await backendResponse.json().catch(() => ({ error: 'Backend unavailable' }));
      return NextResponse.json(
        // On transmet l'erreur du backend au frontend
        { success: false, error: errorBody.error || `Backend error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }
    
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cardId = searchParams.get('cardId');

    if (!userId || !cardId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or cardId' },
        { status: 400 }
      );
    }

    const backendUrl = `http://193.70.34.25:20007/api/gacha/collection?userId=${userId}&cardId=${cardId}`;
    
    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.json().catch(() => ({ error: 'Backend unavailable' }));
      return NextResponse.json(
        { success: false, error: errorBody.error || `Backend error: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}