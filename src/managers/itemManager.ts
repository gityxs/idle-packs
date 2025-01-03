import BigNumber from 'bignumber.js'

export type ItemType = 'egg' | 'mystical' | 'rick' | 'morty' | 'psychic' | 'dragon' | 'colony' | 'fakemon'

export interface ItemDefinition {
  id: string
  name: string
  value: number | string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  coinsPerMinute: number
  types?: ItemType[]
  synergyEffect?: {
    type: 'coinGen'
    bonus: number
    condition: {
      type: 'itemType' | 'specificItem' | 'itemCount'
      value: string | string[] | number
      minCount?: number
    }
  }
}

export interface ItemDrop {
  itemId: string
  dropChance: number
}

export class ItemManager {
  private items: Map<string, ItemDefinition> = new Map()

  constructor() {
    // Register all items
    this.registerItem({
      id: 'math-book',
      name: "Morty's Math Book",
      value: 8,
      rarity: 'common',
      coinsPerMinute: 12, // 0.2 * 60
      types: ['morty'],
    })

    this.registerItem({
      id: 'interdimensional-remote',
      name: 'Interdimensional Cable Remote',
      value: 10,
      rarity: 'common',
      coinsPerMinute: 15, // 0.25 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'scuffy-plasma-pistol',
      name: 'Scruffy Plasma Pistol',
      value: 12,
      rarity: 'common',
      coinsPerMinute: 18, // 0.3 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'meeseeks-box',
      name: 'Mr. Meeseeks Box (Broken)',
      value: 25,
      rarity: 'uncommon',
      coinsPerMinute: 48, // 0.8 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'portal-fluid-flask',
      name: 'Portal Fluid Flask',
      value: 30,
      rarity: 'uncommon',
      coinsPerMinute: 60, // 1.0 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'cronenberg-sample',
      name: 'Cronenberg Sample',
      value: 35,
      rarity: 'uncommon',
      coinsPerMinute: 72, // 1.2 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'pickle-experiment',
      name: '"Pickle" Experiment',
      value: 80,
      rarity: 'rare',
      coinsPerMinute: 240, // 4 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'squanchy-collar',
      name: "Squanchy's Laser Collar",
      value: 120,
      rarity: 'rare',
      coinsPerMinute: 300, // 5 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'portal-gun',
      name: 'Portal Gun',
      value: 300,
      rarity: 'epic',
      coinsPerMinute: 900, // 15 * 60
      types: ['rick'],
    })

    this.registerItem({
      id: 'lab-coat',
      name: "Rick's Lab Coat (Genuine)",
      types: ['rick'],
      value: 600,
      rarity: 'epic',
      coinsPerMinute: 1800, // 30 * 60
    })

    // Fakemon Items
    this.registerItem({
      id: 'embermouse',
      name: 'Embermouse',
      value: 15,
      rarity: 'common',
      coinsPerMinute: 20,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'leafling',
      name: 'Leafling',
      value: 15,
      rarity: 'common',
      coinsPerMinute: 20,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'bubbird',
      name: 'Bubbird',
      value: 15,
      rarity: 'common',
      coinsPerMinute: 20,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'sparkynx',
      name: 'Sparkynx',
      value: 40,
      rarity: 'uncommon',
      coinsPerMinute: 80,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'terracottaur',
      name: 'Terracottaur',
      value: 40,
      rarity: 'uncommon',
      coinsPerMinute: 80,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'flickit',
      name: 'Flickit',
      value: 40,
      rarity: 'uncommon',
      coinsPerMinute: 80,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'crystallus',
      name: 'Crystallus',
      value: 100,
      rarity: 'rare',
      coinsPerMinute: 300,
      types: ['fakemon'],
    })

    this.registerItem({
      id: 'pyroqueen',
      name: 'Pyroqueen',
      value: 100,
      rarity: 'rare',
      coinsPerMinute: 500,
      types: ['fakemon', 'dragon'],
    })

    this.registerItem({
      id: 'dracelium',
      name: 'Dracelium',
      value: 400,
      rarity: 'epic',
      coinsPerMinute: 1200,
      types: ['fakemon', 'dragon'],
    })

    this.registerItem({
      id: 'astragonia',
      name: 'Astragonia',
      value: 1000,
      rarity: 'legendary',
      coinsPerMinute: 3000,
      types: ['fakemon', 'dragon'],
    })

    // Daily Pack Items
    this.registerItem({
      id: 'chromatic-egg',
      name: 'Chromatic Egg',
      value: 175,
      rarity: 'rare',
      coinsPerMinute: 270, // 4.5 coins/sec
      types: ['egg', 'mystical'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.1, // 10%
        condition: {
          type: 'itemType',
          value: ['egg', 'mystical'],
        },
      },
    })

    this.registerItem({
      id: 'mega-morty-plush',
      name: 'Mega Morty Plush',
      value: 215,
      rarity: 'rare',
      coinsPerMinute: 330, // 5.5 coins/sec
      types: ['morty'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.15,
        condition: {
          type: 'itemType',
          value: ['rick'],
        },
      },
    })

    this.registerItem({
      id: 'dream-eater',
      name: 'Dream Eater',
      value: 450,
      rarity: 'epic',
      coinsPerMinute: 1050, // 17.5 coins/sec
      types: ['psychic'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.1,
        condition: {
          type: 'itemType',
          value: ['psychic'],
        },
      },
    })

    this.registerItem({
      id: 'galactic-portal',
      name: 'Galactic Portal',
      value: 525,
      rarity: 'epic',
      coinsPerMinute: 1200, // 20 coins/sec
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.05,
        condition: {
          type: 'itemCount',
          value: ['morty', 'fakemon'],
          minCount: 2,
        },
      },
    })

    this.registerItem({
      id: 'infinity-ant',
      name: 'Infinity Ant',
      value: 700,
      rarity: 'epic',
      coinsPerMinute: 1650, // 27.5 coins/sec
      types: ['colony'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.25,
        condition: {
          type: 'itemType',
          value: ['colony'],
        },
      },
    })

    this.registerItem({
      id: 'rainbow-dracelium',
      name: 'Rainbow Dracelium',
      value: 2500,
      rarity: 'legendary',
      coinsPerMinute: 4200, // 70 coins/sec
      types: ['dragon'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.15, // 10% for dragons + 5% global with normal Dracelium
        condition: {
          type: 'specificItem',
          value: 'dracelium',
        },
      },
    })
  }

  registerItem(item: ItemDefinition) {
    this.items.set(item.id, item)
  }

  getItem(id: string): ItemDefinition | undefined {
    return this.items.get(id)
  }

  createItem(id: string, amount = 1): Item | null {
    const definition = this.getItem(id)
    if (!definition) return null

    return {
      ...definition,
      value: new BigNumber(definition.value),
      amount,
    }
  }

  rollForItem(drops: ItemDrop[]): string | null {
    const roll = Math.random() * 100
    let chanceSum = 0

    for (const drop of drops) {
      chanceSum += drop.dropChance
      if (roll <= chanceSum) {
        return drop.itemId
      }
    }

    return null
  }

  getAllItems(): Map<string, ItemDefinition> {
    return this.items
  }
}

export const itemManager = new ItemManager()
