import BigNumber from 'bignumber.js'

export interface ItemDefinition {
  id: string
  name: string
  value: number | string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
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
      id: 'wooden-sword',
      name: 'Wooden Sword',
      value: 10,
      rarity: 'common',
    })

    this.registerItem({
      id: 'leather-armor',
      name: 'Leather Armor',
      value: 15,
      rarity: 'common',
    })

    this.registerItem({
      id: 'iron-dagger',
      name: 'Iron Dagger',
      value: 50,
      rarity: 'uncommon',
    })

    this.registerItem({
      id: 'health-potion',
      name: 'Health Potion',
      value: 150,
      rarity: 'rare',
    })

    this.registerItem({
      id: 'magic-staff',
      name: 'Magic Staff',
      value: 250,
      rarity: 'legendary',
    })

    this.registerItem({
      id: 'steel-sword',
      name: 'Steel Sword',
      value: 50,
      rarity: 'uncommon',
    })

    this.registerItem({
      id: 'dragon-scale',
      name: 'Dragon Scale',
      value: 500,
      rarity: 'epic',
    })

    this.registerItem({
      id: 'legendary-gem',
      name: 'Legendary Gem',
      value: 2000,
      rarity: 'legendary',
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
