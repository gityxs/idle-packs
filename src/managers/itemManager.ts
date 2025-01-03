import BigNumber from 'bignumber.js'

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'artifact'

export interface ItemDefinition {
  id: string
  name: string
  value: number | string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  coinsPerMinute: number
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
    })

    this.registerItem({
      id: 'interdimensional-remote',
      name: 'Interdimensional Cable Remote',
      value: 10,
      rarity: 'common',
      coinsPerMinute: 15, // 0.25 * 60
    })

    this.registerItem({
      id: 'scuffy-plasma-pistol',
      name: 'Scruffy Plasma Pistol',
      value: 12,
      rarity: 'common',
      coinsPerMinute: 18, // 0.3 * 60
    })

    this.registerItem({
      id: 'meeseeks-box',
      name: 'Mr. Meeseeks Box (Broken)',
      value: 25,
      rarity: 'uncommon',
      coinsPerMinute: 48, // 0.8 * 60
    })

    this.registerItem({
      id: 'portal-fluid-flask',
      name: 'Portal Fluid Flask',
      value: 30,
      rarity: 'uncommon',
      coinsPerMinute: 60, // 1.0 * 60
    })

    this.registerItem({
      id: 'cronenberg-sample',
      name: 'Cronenberg Sample',
      value: 35,
      rarity: 'uncommon',
      coinsPerMinute: 72, // 1.2 * 60
    })

    this.registerItem({
      id: 'pickle-experiment',
      name: '"Pickle" Experiment',
      value: 80,
      rarity: 'rare',
      coinsPerMinute: 240, // 4 * 60
    })

    this.registerItem({
      id: 'squanchy-collar',
      name: "Squanchy's Laser Collar",
      value: 120,
      rarity: 'rare',
      coinsPerMinute: 300, // 5 * 60
    })

    this.registerItem({
      id: 'portal-gun',
      name: 'Portal Gun',
      value: 300,
      rarity: 'epic',
      coinsPerMinute: 900, // 15 * 60
    })

    this.registerItem({
      id: 'lab-coat',
      name: "Rick's Lab Coat (Genuine)",
      value: 600,
      rarity: 'epic',
      coinsPerMinute: 1800, // 30 * 60
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
}

export const itemManager = new ItemManager()
