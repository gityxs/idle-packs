import { itemManager } from './itemManager'

export interface CollectionBonus {
  type: 'coinProduction' | 'itemValue'
  bonus: number
  requirement: number // Number of items needed for bonus
  description: string
}

export interface CollectionEntry {
  itemId: string
  count: number
  discovered: boolean
  bonuses: CollectionBonus[]
}

export class CollectionManager {
  private collections: Map<string, CollectionEntry> = new Map()

  constructor() {
    // Register all items from itemManager, with or without bonuses
    Array.from(itemManager.getAllItems().values()).forEach(item => {
      // Check if we already have specific bonuses defined
      if (this.collections.has(item.id)) return

      // Register item with no bonuses if none are specifically defined
      this.registerItem(item.id, [])
    })

    // Register items with specific bonuses
    this.registerItem('math-book', [
      { type: 'coinProduction', bonus: 0.05, requirement: 10, description: 'Study harder: +5% coin production' },
      { type: 'itemValue', bonus: 0.1, requirement: 25, description: 'Knowledge is power: +10% item value' },
    ])

    this.registerItem('portal-gun', [
      {
        type: 'coinProduction',
        bonus: 0.15,
        requirement: 3,
        description: 'Dimensional efficiency: +15% coin production',
      },
      { type: 'itemValue', bonus: 0.2, requirement: 5, description: 'Infinite possibilities: +20% item value' },
    ])

    // Add more items with their bonuses...
    this.registerItem('dracelium', [
      { type: 'coinProduction', bonus: 0.25, requirement: 2, description: "Dragon's might: +25% coin production" },
      { type: 'itemValue', bonus: 0.3, requirement: 4, description: "Dragon's hoard: +30% item value" },
    ])

    // Daily pack items with special bonuses
    this.registerItem('rainbow-dracelium', [
      { type: 'coinProduction', bonus: 0.5, requirement: 1, description: 'Rainbow power: +50% coin production' },
      { type: 'itemValue', bonus: 0.4, requirement: 2, description: 'Prismatic value: +40% item value' },
    ])
  }

  getCollectionData() {
    return Array.from(this.collections.values())
  }

  loadSaveData(saveData: CollectionEntry[]) {
    // Reset collection first
    this.resetCollection()

    // Load saved data
    saveData.forEach(savedEntry => {
      const entry = this.collections.get(savedEntry.itemId)
      if (entry) {
        entry.count = savedEntry.count
        entry.discovered = savedEntry.discovered
      }
    })
  }

  registerItem(itemId: string, bonuses: CollectionBonus[]) {
    this.collections.set(itemId, {
      itemId,
      count: 0,
      discovered: false,
      bonuses,
    })
  }

  updateCollection(itemId: string, count: number) {
    const entry = this.collections.get(itemId)
    if (entry) {
      entry.count = count
      entry.discovered = true
    }
  }

  getCollectionEntry(itemId: string): CollectionEntry | undefined {
    return this.collections.get(itemId)
  }

  getAllCollections(): CollectionEntry[] {
    return Array.from(this.collections.values())
  }

  getTotalBonus(type: 'coinProduction' | 'itemValue'): number {
    let totalBonus = 0
    for (const entry of this.collections.values()) {
      if (!entry.discovered) continue

      for (const bonus of entry.bonuses) {
        if (bonus.type === type && entry.count >= bonus.requirement) {
          totalBonus += bonus.bonus
        }
      }
    }
    return totalBonus
  }

  resetCollection() {
    // Reset all collection entries to initial state
    this.collections.forEach(entry => {
      entry.count = 0
      entry.discovered = false
    })
  }
}

export const collectionManager = new CollectionManager()
