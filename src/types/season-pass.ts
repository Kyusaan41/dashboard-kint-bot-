export interface SeasonPassReward {
  id: string
  type: 'currency' | 'tokens' | 'points' | 'xp' | 'orbs' | 'item' | 'card'
  amount?: number
  itemId?: string
  cardId?: string
  name: string
  description: string
}

export interface SeasonPassTier {
  id: string
  level: number
  requiredPoints: number
  normalReward: SeasonPassReward
  vipReward?: SeasonPassReward
  claimed: boolean
  vipClaimed?: boolean
}

export interface SeasonPass {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  tiers: SeasonPassTier[]
  userProgress: {
    currentPoints: number
    claimedTiers: string[]
    vipClaimedTiers: string[]
  }
}

export interface SeasonPassData {
  seasonPass: SeasonPass
  isVip: boolean
  seasonNeedsReset?: boolean
}