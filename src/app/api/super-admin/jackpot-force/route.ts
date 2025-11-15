import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { store, addAuditLog } from '@/lib/dataStore';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

const SUPER_ADMIN_IDS = (process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS ?? '').split(',').map(id => id.trim());

// GET /api/super-admin/jackpot-force - Récupérer la liste des utilisateurs marqués pour le jackpot
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer depuis Redis si disponible, sinon depuis le store en mémoire
    try {
      await ensureRedisConnection();
      const redisData = await redisClient.get('jackpot_forces');
      if (redisData) {
        const forces = JSON.parse(redisData);
        return NextResponse.json({ forces });
      }
    } catch (redisError) {
      console.warn('Redis non disponible, utilisation du store en mémoire');
    }

    return NextResponse.json({ forces: store.jackpotForces });
  } catch (error) {
    console.error('Erreur GET jackpot-force:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/super-admin/jackpot-force/check - Vérifier si un utilisateur est marqué pour gagner le jackpot (pour le bot)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer depuis Redis si disponible, sinon depuis le store en mémoire
    let forces = store.jackpotForces;
    try {
      await ensureRedisConnection();
      const redisData = await redisClient.get('jackpot_forces');
      if (redisData) {
        forces = JSON.parse(redisData);
      }
    } catch (redisError) {
      console.warn('Redis non disponible');
    }

    // Chercher si l'utilisateur est marqué et actif
    const forceEntry = forces.find(f => f.userId === userId && f.active);

    if (forceEntry) {
      // Marquer comme utilisé (désactiver après utilisation)
      forceEntry.active = false;

      // Sauvegarder dans Redis
      try {
        await ensureRedisConnection();
        await redisClient.set('jackpot_forces', JSON.stringify(forces));
      } catch (redisError) {
        console.warn('Impossible de sauvegarder dans Redis');
      }

      // Ajouter au log d'audit
      addAuditLog({
        adminId: 'system',
        adminName: 'Système Casino',
        action: 'jackpot_force_used',
        targetId: userId,
        targetName: forceEntry.username,
        details: `Utilisateur a gagné le jackpot forcé`,
        status: 'success'
      });

      return NextResponse.json({
        forceWin: true,
        username: forceEntry.username,
        message: 'Cet utilisateur doit gagner le jackpot'
      });
    }

    return NextResponse.json({ forceWin: false });
  } catch (error) {
    console.error('Erreur PATCH jackpot-force:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/super-admin/jackpot-force - Marquer ou démarquer un utilisateur pour le jackpot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !SUPER_ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { userId, username, action } = await request.json();

    if (!userId || !username || !['mark', 'unmark'].includes(action)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    let forces = [...store.jackpotForces];

    // Essayer de récupérer depuis Redis
    try {
      await ensureRedisConnection();
      const redisData = await redisClient.get('jackpot_forces');
      if (redisData) {
        forces = JSON.parse(redisData);
      }
    } catch (redisError) {
      console.warn('Redis non disponible');
    }

    if (action === 'mark') {
      // Vérifier si déjà marqué
      const existing = forces.find(f => f.userId === userId && f.active);
      if (existing) {
        return NextResponse.json({ error: 'Utilisateur déjà marqué pour le jackpot' }, { status: 400 });
      }

      // Marquer l'utilisateur
      const newForce = {
        id: Date.now().toString(),
        userId,
        username,
        markedAt: new Date().toISOString(),
        markedBy: session.user.id,
        active: true
      };

      forces.push(newForce);
      store.jackpotForces = forces;

      // Sauvegarder dans Redis
      try {
        await ensureRedisConnection();
        await redisClient.set('jackpot_forces', JSON.stringify(forces));
      } catch (redisError) {
        console.warn('Impossible de sauvegarder dans Redis');
      }

      // Ajouter au log d'audit
      addAuditLog({
        adminId: session.user.id,
        adminName: session.user.name || 'Unknown',
        action: 'jackpot_force_mark',
        targetId: userId,
        targetName: username,
        details: `Utilisateur marqué pour gagner le prochain jackpot`,
        status: 'success'
      });

      return NextResponse.json({
        success: true,
        message: `${username} marqué pour gagner le prochain jackpot`,
        force: newForce
      });
    } else {
      // Démarquer l'utilisateur
      const index = forces.findIndex(f => f.userId === userId && f.active);
      if (index === -1) {
        return NextResponse.json({ error: 'Utilisateur non trouvé ou déjà démarqué' }, { status: 400 });
      }

      forces[index].active = false;
      store.jackpotForces = forces;

      // Sauvegarder dans Redis
      try {
        await ensureRedisConnection();
        await redisClient.set('jackpot_forces', JSON.stringify(forces));
      } catch (redisError) {
        console.warn('Impossible de sauvegarder dans Redis');
      }

      // Ajouter au log d'audit
      addAuditLog({
        adminId: session.user.id,
        adminName: session.user.name || 'Unknown',
        action: 'jackpot_force_unmark',
        targetId: userId,
        targetName: username,
        details: `Marquage jackpot retiré pour l'utilisateur`,
        status: 'success'
      });

      return NextResponse.json({
        success: true,
        message: `Marquage jackpot retiré pour ${username}`
      });
    }
  } catch (error) {
    console.error('Erreur POST jackpot-force:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}