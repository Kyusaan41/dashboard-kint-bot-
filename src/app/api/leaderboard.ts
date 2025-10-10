// /pages/api/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getXPLeaderboard, getCurrencyLeaderboard, getPointsLeaderboard } from '../../utils/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [xpList, currencyList, pointsList] = await Promise.all([
      getXPLeaderboard(),
      getCurrencyLeaderboard(),
      getPointsLeaderboard(),
    ]);

    // On prend le top 1 pour chaque
    const topXP = xpList.length > 0 ? xpList[0] : null;
    const topCurrency = currencyList.length > 0 ? currencyList[0] : null;
    const topPoints = pointsList.length > 0 ? pointsList[0] : null;

    res.status(200).json({ topXP, topCurrency, topPoints });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

