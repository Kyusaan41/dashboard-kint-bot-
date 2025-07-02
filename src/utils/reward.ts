// src/utils/reward.ts

type DailyData = {
  lastClaim: number | null;
};

type RewardResult = {
  success: boolean;
  rewardDetails?: {
    xp: number;
    coins: number;
  };
};

export async function getDailyRewardData(userId: string): Promise<DailyData> {
  // TODO: Récupérer depuis ta DB la date du dernier claim pour userId
  // Exemple statique pour test
  return { lastClaim: null };
}

export async function claimRewardForUser(userId: string): Promise<RewardResult> {
  // TODO: Logique pour donner la récompense (mettre à jour DB)
  // Exemple statique
  return {
    success: true,
    rewardDetails: {
      xp: 50,
      coins: 100,
    },
  };
}
