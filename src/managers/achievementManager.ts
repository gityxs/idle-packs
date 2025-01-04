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
