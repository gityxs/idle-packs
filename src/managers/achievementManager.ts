export interface Achievement {
  id: string
  name: string
  description: string
  requirement: number
  progress: number
  completed: boolean
  reward: {
    type: 'coinProduction' | 'itemValue'
    bonus: number
  }
  category: 'packs' | 'items' | 'coins' | 'daily'
}

export class AchievementManager {
  private achievements: Achievement[] = [
    // Pack Opening Achievements
    {
      id: 'pack-opener-1',
      name: 'Pack Opener I',
      description: 'Open 10 packs',
      requirement: 10,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.05, // 5% coin production
      },
      category: 'packs',
    },
    {
      id: 'pack-opener-2',
      name: 'Pack Opener II',
      description: 'Open 100 packs',
      requirement: 100,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.1,
      },
      category: 'packs',
    },
    {
      id: 'pack-opener-3',
      name: 'Pack Opener III',
      description: 'Open 1,000 packs',
      requirement: 1000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.15,
      },
      category: 'packs',
    },
    {
      id: 'pack-opener-4',
      name: 'Pack Opener IV',
      description: 'Open 10,000 packs',
      requirement: 10000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.2,
      },
      category: 'packs',
    },
    {
      id: 'pack-opener-5',
      name: 'Pack Opener V',
      description: 'Open 100,000 packs',
      requirement: 100000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.25,
      },
      category: 'packs',
    },
    // Daily Pack Achievements
    {
      id: 'daily-collector-1',
      name: 'Daily Collector I',
      description: 'Open 5 daily packs',
      requirement: 5,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.05,
      },
      category: 'daily',
    },
    {
      id: 'daily-collector-2',
      name: 'Daily Collector II',
      description: 'Open 15 daily packs',
      requirement: 15,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.1,
      },
      category: 'daily',
    },
    // Item Collection Achievements
    {
      id: 'collector-1',
      name: 'Collector I',
      description: 'Collect 10 different items',
      requirement: 10,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.05,
      },
      category: 'items',
    },
    {
      id: 'collector-2',
      name: 'Collector II',
      description: 'Collect 25 different items',
      requirement: 25,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.1,
      },
      category: 'items',
    },
    {
      id: 'collector-3',
      name: 'Collector III',
      description: 'Collect 50 different items',
      requirement: 50,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.15,
      },
      category: 'items',
    },
    {
      id: 'collector-4',
      name: 'Collector IV',
      description: 'Collect 100 different items',
      requirement: 100,
      progress: 0,
      completed: false,
      reward: {
        type: 'itemValue',
        bonus: 0.2,
      },
      category: 'items',
    },
    // Coin Achievements
    {
      id: 'wealthy-1',
      name: 'Wealthy I',
      description: 'Earn 10,000 coins total',
      requirement: 10000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.05,
      },
      category: 'coins',
    },
    {
      id: 'wealthy-2',
      name: 'Wealthy II',
      description: 'Earn 100,000 coins total',
      requirement: 100000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.1,
      },
      category: 'coins',
    },
    {
      id: 'wealthy-3',
      name: 'Wealthy III',
      description: 'Earn 1,000,000 coins total',
      requirement: 1000000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.15,
      },
      category: 'coins',
    },
    {
      id: 'wealthy-4',
      name: 'Wealthy IV',
      description: 'Earn 10,000,000 coins total',
      requirement: 10000000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.2,
      },
      category: 'coins',
    },
    {
      id: 'wealthy-5',
      name: 'Wealthy V',
      description: 'Earn 100,000,000 coins total',
      requirement: 100000000,
      progress: 0,
      completed: false,
      reward: {
        type: 'coinProduction',
        bonus: 0.25,
      },
      category: 'coins',
    },
  ]

  getAchievements(): Achievement[] {
    return this.achievements
  }

  getAchievement(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id)
  }

  updateProgress(id: string, progress: number) {
    const achievement = this.getAchievement(id)
    if (!achievement || achievement.completed) return false

    achievement.progress = Math.min(progress, achievement.requirement)
    if (achievement.progress >= achievement.requirement) {
      achievement.completed = true
      return true // Return true if newly completed
    }
    return false
  }

  getCategoryAchievements(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category)
  }

  getTotalBonus(type: 'coinProduction' | 'itemValue'): number {
    return this.achievements
      .filter(a => a.completed && a.reward.type === type)
      .reduce((sum, a) => sum + a.reward.bonus, 0)
  }
}

export const achievementManager = new AchievementManager()
