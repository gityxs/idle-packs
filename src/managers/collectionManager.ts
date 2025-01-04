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

    // Add new collection items with bonuses
    this.registerItem('meeseeks-box', [
      { type: 'coinProduction', bonus: 0.1, requirement: 5, description: 'Can do!: +10% coin production' },
      { type: 'itemValue', bonus: 0.15, requirement: 10, description: 'Look at me!: +15% item value' },
    ])

    this.registerItem('crystallus', [
      { type: 'itemValue', bonus: 0.2, requirement: 3, description: 'Crystal clarity: +20% item value' },
      { type: 'coinProduction', bonus: 0.12, requirement: 6, description: 'Crystalline focus: +12% coin production' },
    ])

    this.registerItem('astragonia', [
      { type: 'coinProduction', bonus: 0.3, requirement: 1, description: 'Cosmic power: +30% coin production' },
      { type: 'itemValue', bonus: 0.35, requirement: 2, description: 'Stellar worth: +35% item value' },
    ])

    this.registerItem('mermaid-tear', [
      { type: 'itemValue', bonus: 0.45, requirement: 1, description: "Ocean's blessing: +45% item value" },
      { type: 'coinProduction', bonus: 0.4, requirement: 2, description: 'Tidal fortune: +40% coin production' },
    ])

    this.registerItem('atlantean-pearl', [
      { type: 'coinProduction', bonus: 0.6, requirement: 1, description: 'Lost wisdom: +60% coin production' },
      { type: 'itemValue', bonus: 0.5, requirement: 2, description: 'Ancient treasure: +50% item value' },
    ])

    this.registerItem('phoenix-feather', [
      { type: 'coinProduction', bonus: 0.35, requirement: 2, description: 'Eternal flame: +35% coin production' },
      { type: 'itemValue', bonus: 0.4, requirement: 3, description: 'Rebirth riches: +40% item value' },
    ])

    this.registerItem('basilisk-eye', [
      { type: 'itemValue', bonus: 0.45, requirement: 2, description: 'Petrifying gaze: +45% item value' },
      { type: 'coinProduction', bonus: 0.38, requirement: 3, description: 'Serpent wisdom: +38% coin production' },
    ])

    this.registerItem('sphinx-riddle-stone', [
      { type: 'coinProduction', bonus: 0.42, requirement: 2, description: 'Ancient wisdom: +42% coin production' },
      { type: 'itemValue', bonus: 0.48, requirement: 3, description: 'Riddle master: +48% item value' },
    ])

    this.registerItem('chimera-heart', [
      { type: 'coinProduction', bonus: 0.55, requirement: 1, description: 'Triple essence: +55% coin production' },
      { type: 'itemValue', bonus: 0.52, requirement: 2, description: 'Mythical fusion: +52% item value' },
    ])

    this.registerItem('djinn-lamp', [
      { type: 'itemValue', bonus: 0.58, requirement: 1, description: 'Infinite wishes: +58% item value' },
      { type: 'coinProduction', bonus: 0.54, requirement: 2, description: 'Magical fortune: +54% coin production' },
    ])

    this.registerItem('aztec-calendar', [
      { type: 'coinProduction', bonus: 0.65, requirement: 1, description: 'Time mastery: +65% coin production' },
      { type: 'itemValue', bonus: 0.6, requirement: 2, description: 'Golden age: +60% item value' },
    ])

    this.registerItem('nefertiti-crown', [
      { type: 'itemValue', bonus: 0.7, requirement: 1, description: 'Royal treasury: +70% item value' },
      { type: 'coinProduction', bonus: 0.62, requirement: 2, description: 'Divine rule: +62% coin production' },
    ])

    this.registerItem('olmec-shard', [
      { type: 'coinProduction', bonus: 0.58, requirement: 1, description: 'Ancient power: +58% coin production' },
      { type: 'itemValue', bonus: 0.55, requirement: 2, description: 'Lost civilization: +55% item value' },
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
