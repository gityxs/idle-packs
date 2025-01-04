import type { Item } from '@/types'
import BigNumber from 'bignumber.js'

export type ItemType =
  | 'egg'
  | 'mystical'
  | 'rick'
  | 'morty'
  | 'psychic'
  | 'dragon'
  | 'colony'
  | 'fakemon'
  | 'mythical'
  | 'ancient'

export interface CombatStats {
  attack: number
  defense: number
  health: number
  level: number
  experience: number
  requiredExperience: number
}

export interface ItemDefinition {
  id: string
  name: string
  value: number | string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  coinsPerMinute: number
  types?: ItemType[]
  combatStats?: {
    attack: number
    defense: number
    health: number
  }
  synergyEffect?: {
    type: 'coinGen' | 'combat'
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

export interface ItemWithCombatStats extends Item {
  combatStats: CombatStats
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
      combatStats: {
        attack: 15,
        defense: 5,
        health: 25,
      },
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
      combatStats: {
        attack: 35,
        defense: 15,
        health: 50,
      },
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
      coinsPerMinute: 900,
      types: ['rick'],
      combatStats: {
        attack: 50,
        defense: 20,
        health: 100,
      },
      synergyEffect: {
        type: 'combat',
        bonus: 0.2,
        condition: {
          type: 'itemType',
          value: ['rick', 'morty'],
        },
      },
    })

    this.registerItem({
      id: 'lab-coat',
      name: "Rick's Lab Coat (Genuine)",
      types: ['rick'],
      value: 600,
      rarity: 'epic',
      coinsPerMinute: 1800, // 30 * 60
      combatStats: {
        attack: 25,
        defense: 75,
        health: 150,
      },
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
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.15, // 15% bonus
        condition: {
          type: 'itemType',
          value: ['fakemon'],
          minCount: 3,
        },
      },
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
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.25, // 25% bonus
        condition: {
          type: 'itemType',
          value: ['dragon'],
        },
      },
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

    this.registerItem({
      id: 'unicorn-horn',
      name: 'Unicorn Horn',
      value: 2500,
      rarity: 'rare',
      coinsPerMinute: 3800,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'phoenix-feather',
      name: 'Phoenix Feather',
      value: 3000,
      rarity: 'epic',
      coinsPerMinute: 4200,
      types: ['mythical'],
      combatStats: {
        attack: 85,
        defense: 45,
        health: 150,
      },
      synergyEffect: {
        type: 'combat',
        bonus: 0.25,
        condition: {
          type: 'itemType',
          value: ['dragon'],
          minCount: 2,
        },
      },
    })

    this.registerItem({
      id: 'dragon-scale',
      name: 'Dragon Scale',
      value: 2800,
      rarity: 'rare',
      coinsPerMinute: 4000,
      types: ['mythical', 'dragon'],
      combatStats: {
        attack: 20,
        defense: 100,
        health: 200,
      },
      synergyEffect: {
        type: 'combat',
        bonus: 0.15,
        condition: {
          type: 'itemType',
          value: ['dragon', 'mythical'],
        },
      },
    })

    this.registerItem({
      id: 'griffin-claw',
      name: 'Griffin Claw',
      value: 2400,
      rarity: 'uncommon',
      coinsPerMinute: 3600,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'manticore-mane',
      name: 'Manticore Mane',
      value: 3500,
      rarity: 'epic',
      coinsPerMinute: 4500,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'basilisk-eye',
      name: 'Basilisk Eye',
      value: 4000,
      rarity: 'epic',
      coinsPerMinute: 5000,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'hydra-fang',
      name: 'Hydra Fang',
      value: 3200,
      rarity: 'rare',
      coinsPerMinute: 4300,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'pegasus-feather',
      name: 'Pegasus Feather',
      value: 2600,
      rarity: 'uncommon',
      coinsPerMinute: 3800,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'sphinx-riddle-stone',
      name: 'Sphinx Riddle Stone',
      value: 4500,
      rarity: 'epic',
      coinsPerMinute: 5500,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'minotaur-horn',
      name: 'Minotaur Horn',
      value: 2800,
      rarity: 'rare',
      coinsPerMinute: 4000,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'centaur-bow',
      name: 'Centaur Bow',
      value: 3000,
      rarity: 'rare',
      coinsPerMinute: 4200,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'mermaid-tear',
      name: 'Mermaid Tear',
      value: 20_000,
      rarity: 'legendary',
      coinsPerMinute: 10_000,
      types: ['mythical'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.3, // 30% bonus
        condition: {
          type: 'itemType',
          value: ['mythical'],
          minCount: 3,
        },
      },
    })

    this.registerItem({
      id: 'leprechaun-coin',
      name: 'Leprechaun Coin',
      value: 5000,
      rarity: 'epic',
      coinsPerMinute: 6000,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'pixie-dust',
      name: 'Pixie Dust',
      value: 2500,
      rarity: 'uncommon',
      coinsPerMinute: 3700,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'faun-flute',
      name: 'Faun Flute',
      value: 2300,
      rarity: 'uncommon',
      coinsPerMinute: 3500,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'yeti-fur',
      name: 'Yeti Fur',
      value: 3200,
      rarity: 'rare',
      coinsPerMinute: 4300,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'kraken-ink',
      name: 'Kraken Ink',
      value: 4800,
      rarity: 'epic',
      coinsPerMinute: 5800,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'djinn-lamp',
      name: 'Djinn Lamp',
      value: 15_000,
      rarity: 'legendary',
      coinsPerMinute: 9000,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'wyvern-wing',
      name: 'Wyvern Wing Membrane',
      value: 3500,
      rarity: 'rare',
      coinsPerMinute: 4500,
      types: ['mythical', 'dragon'],
    })

    this.registerItem({
      id: 'salamander-ember',
      name: 'Salamander Ember',
      value: 2700,
      rarity: 'uncommon',
      coinsPerMinute: 3900,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'chimera-heart',
      name: 'Chimera Heart',
      value: 18_000,
      rarity: 'legendary',
      coinsPerMinute: 9500,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'fairy-lantern',
      name: 'Fairy Lantern',
      value: 2600,
      rarity: 'uncommon',
      coinsPerMinute: 3800,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'kelpie-horseshoe',
      name: 'Kelpie Horseshoe',
      value: 3300,
      rarity: 'rare',
      coinsPerMinute: 4400,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'siren-shell',
      name: 'Siren Shell',
      value: 3100,
      rarity: 'rare',
      coinsPerMinute: 4200,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'gorgon-hair',
      name: 'Gorgon Hair Strand',
      value: 4200,
      rarity: 'epic',
      coinsPerMinute: 5200,
      types: ['mythical'],
    })

    this.registerItem({
      id: 'eye-of-horus',
      name: 'Eye of Horus Amulet',
      value: 25000,
      rarity: 'rare',
      coinsPerMinute: 8500,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'babylonian-tablet',
      name: 'Babylonian Clay Tablet',
      value: 45000,
      rarity: 'epic',
      coinsPerMinute: 12000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'mayan-dagger',
      name: 'Mayan Jade Dagger',
      value: 75000,
      rarity: 'epic',
      coinsPerMinute: 15000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'olmec-shard',
      name: 'Olmec Head Shard',
      value: 150000,
      rarity: 'legendary',
      coinsPerMinute: 25000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'atlantean-pearl',
      name: 'Atlantean Pearl',
      value: 500000,
      rarity: 'legendary',
      coinsPerMinute: 45000,
      types: ['ancient'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.4, // 40% bonus
        condition: {
          type: 'itemType',
          value: ['ancient'],
          minCount: 3,
        },
      },
    })

    this.registerItem({
      id: 'rosetta-fragment',
      name: 'Rosetta Stone Fragment',
      value: 250000,
      rarity: 'epic',
      coinsPerMinute: 30000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'anubis-ankh',
      name: "Anubis' Ankh",
      value: 350000,
      rarity: 'legendary',
      coinsPerMinute: 35000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'labyrinth-key',
      name: 'Labyrinth Key',
      value: 180000,
      rarity: 'epic',
      coinsPerMinute: 28000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'aztec-calendar',
      name: 'Aztec Calendar Disc',
      value: 750000,
      rarity: 'legendary',
      coinsPerMinute: 55000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'oracle-goblet',
      name: "Oracle's Goblet",
      value: 450000,
      rarity: 'legendary',
      coinsPerMinute: 40000,
      types: ['ancient'],
    })

    this.registerItem({
      id: 'nefertiti-crown',
      name: "Nefertiti's Crown",
      value: 850000,
      rarity: 'legendary',
      coinsPerMinute: 65000,
      types: ['ancient'],
      synergyEffect: {
        type: 'coinGen',
        bonus: 0.2, // 20% bonus
        condition: {
          type: 'specificItem',
          value: 'eye-of-horus',
        },
      },
    })

    this.registerItem({
      id: 'ziggurat-stone',
      name: 'Carved Ziggurat Stone',
      value: 95000,
      rarity: 'epic',
      coinsPerMinute: 18000,
      types: ['ancient'],
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

    const item: Item = {
      ...definition,
      value: new BigNumber(definition.value),
      amount,
    }

    // Initialize combat stats if the item has them
    if (definition.combatStats) {
      ;(item as ItemWithCombatStats).combatStats = {
        ...definition.combatStats,
        level: 1,
        experience: 0,
        requiredExperience: this.calculateRequiredExperience(1),
      }
    }

    return item
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

  calculateRequiredExperience(level: number): number {
    // Experience formula: 100 * (level ^ 1.5)
    return Math.floor(100 * Math.pow(level, 1.5))
  }

  calculateStatsForLevel(baseStats: { attack: number; defense: number; health: number }, level: number) {
    const multiplier = 1 + (level - 1) * 0.1 // 10% increase per level
    return {
      attack: Math.floor(baseStats.attack * multiplier),
      defense: Math.floor(baseStats.defense * multiplier),
      health: Math.floor(baseStats.health * multiplier),
    }
  }
}

export const itemManager = new ItemManager()
