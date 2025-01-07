import { acceptHMRUpdate, defineStore } from 'pinia'
import BigNumber from 'bignumber.js'
import { itemManager, type ItemDefinition, type ItemDrop, type ItemWithCombatStats } from './managers/itemManager'
import { achievementManager } from './managers/achievementManager'
import { collectionManager, type CollectionEntry } from './managers/collectionManager'
import { useBossStore, type BossSaveData } from './stores/bossStore'

export type Store = ReturnType<typeof useStore>

interface Item {
  id: string
  name: string
  value: BigNumber
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  amount: number
  locked?: boolean
}

interface PackPurchaseLimit {
  amount: number
  minutes: number
  lastPurchaseTime: number
  remainingPurchases: number
}

export interface Pack {
  id: string
  name: string
  price: number
  minItems: number
  maxItems: number
  possibleItems: ItemDrop[]
  purchaseLimit?: PackPurchaseLimit
  hasAutoBuyer: boolean
  autoBuyEnabled: boolean
}

interface OwnedPack extends Pack {
  amount: number
}

// Add new interfaces for upgrades
interface Upgrade {
  id: string
  name: string
  description: string
  basePrice: number
  priceMultiplier: number
  level: number
  maxLevel?: number
  type: 'packLimit' | 'packTimer' | 'storage' | 'equipmentSlot' | 'autoBuy' | 'autoOpener'
  packId?: string
  increaseAmount?: number
  requiresUpgrade?: {
    id: string
    level: number
  }
}

interface SaveData {
  coins: string
  inventory: (Item | ItemWithCombatStats)[]
  ownedPacks: OwnedPack[]
  equippedItems: (Item | ItemWithCombatStats)[]
  maxEquippedItems: number
  maxPackStorage: number
  upgrades: Upgrade[]
  discoveredItems: string[]
  collection: CollectionEntry[]
  lastUpdate: number
  availablePacks: Pack[]
  settings: { showAnimations: boolean }
  hasPerformedFirstAction: boolean
  lastBackupReminder: number
  hasOpenedFirstPack: boolean
  totalPacksOpened: number
  totalDailyPacksOpened: number
  totalCoinsEarned: string
  bossData?: BossSaveData
}

// Add new type for upgrade groups
type UpgradeGroup = {
  name: string
  upgrades: Upgrade[]
}

// Add getter to group upgrades
const getUpgradeGroups = (upgrades: Upgrade[]): UpgradeGroup[] => {
  const groups: Record<string, UpgradeGroup> = {
    general: {
      name: 'General',
      upgrades: [],
    },
  }

  upgrades.forEach(upgrade => {
    if (!upgrade.packId) {
      groups.general.upgrades.push(upgrade)
      return
    }

    const packId = upgrade.packId
    if (!groups[packId]) {
      // Convert packId to display name (e.g., 'morty-pack' -> 'Morty Pack')
      const name = packId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      groups[packId] = {
        name,
        upgrades: [],
      }
    }
    groups[packId].upgrades.push(upgrade)
  })

  return Object.values(groups)
}

export const useStore = defineStore('main', {
  state: () => ({
    debug: import.meta.env.MODE === 'development',
    appMeta: {
      version:
        import.meta.env.MODE === 'development'
          ? import.meta.env.VITE_APP_VERSION + '-dev'
          : import.meta.env.VITE_APP_VERSION,
      builtAt: import.meta.env.VITE_APP_BUILD_EPOCH
        ? new Date(Number(import.meta.env.VITE_APP_BUILD_EPOCH))
        : undefined,
    },
    isInitialized: false,

    // Game state
    coins: new BigNumber(0),
    inventory: [] as Item[],
    ownedPacks: [] as OwnedPack[],

    // Available packs in the shop
    availablePacks: [
      {
        id: 'daily-pack',
        name: 'Daily Pack',
        price: 0,
        minItems: 1,
        maxItems: 3,
        possibleItems: [
          { itemId: 'chromatic-egg', dropChance: 30 },
          { itemId: 'mega-morty-plush', dropChance: 30 },
          { itemId: 'dream-eater', dropChance: 20 },
          { itemId: 'galactic-portal', dropChance: 10 },
          { itemId: 'infinity-ant', dropChance: 9 },
          { itemId: 'rainbow-dracelium', dropChance: 1 },
        ],
        purchaseLimit: {
          amount: 1,
          minutes: 24 * 60,
          lastPurchaseTime: 0,
          remainingPurchases: 1,
        },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
      {
        id: 'morty-pack',
        name: 'Morty Pack',
        price: 75,
        minItems: 3,
        maxItems: 5,
        possibleItems: [
          { itemId: 'math-book', dropChance: 23.33 },
          { itemId: 'interdimensional-remote', dropChance: 23.33 },
          { itemId: 'scuffy-plasma-pistol', dropChance: 23.34 },
          { itemId: 'meeseeks-box', dropChance: 6.67 },
          { itemId: 'portal-fluid-flask', dropChance: 6.67 },
          { itemId: 'cronenberg-sample', dropChance: 6.66 },
          { itemId: 'pickle-experiment', dropChance: 4 },
          { itemId: 'squanchy-collar', dropChance: 4 },
          { itemId: 'portal-gun', dropChance: 1 },
          { itemId: 'lab-coat', dropChance: 1 },
        ],
        purchaseLimit: {
          amount: 10,
          minutes: 5,
          lastPurchaseTime: 0,
          remainingPurchases: 10,
        },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
      {
        id: 'fakemon-pack',
        name: 'Fakemon Pack',
        price: 250,
        minItems: 2,
        maxItems: 4,
        possibleItems: [
          { itemId: 'embermouse', dropChance: 20 },
          { itemId: 'leafling', dropChance: 20 },
          { itemId: 'bubbird', dropChance: 20 },
          { itemId: 'sparkynx', dropChance: 8.33 },
          { itemId: 'terracottaur', dropChance: 8.33 },
          { itemId: 'flickit', dropChance: 8.34 },
          { itemId: 'crystallus', dropChance: 5 },
          { itemId: 'pyroqueen', dropChance: 1 },
          { itemId: 'dracelium', dropChance: 0.2 },
          { itemId: 'astragonia', dropChance: 0.05 },
        ],
        purchaseLimit: {
          amount: 6,
          minutes: 15,
          lastPurchaseTime: 0,
          remainingPurchases: 6,
        },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
      {
        id: 'mythical-pack',
        name: 'Mythical Creatures Pack',
        price: 10_000,
        minItems: 1,
        maxItems: 3,
        possibleItems: [
          // Common/Uncommon (around 5-8% each)
          { itemId: 'griffin-claw', dropChance: 8 },
          { itemId: 'pixie-dust', dropChance: 7 },
          { itemId: 'faun-flute', dropChance: 7 },
          { itemId: 'fairy-lantern', dropChance: 7 },
          { itemId: 'pegasus-feather', dropChance: 6 },
          { itemId: 'salamander-ember', dropChance: 6 },

          // Rare (around 3-5% each)
          { itemId: 'unicorn-horn', dropChance: 5 },
          { itemId: 'dragon-scale', dropChance: 5 },
          { itemId: 'hydra-fang', dropChance: 4 },
          { itemId: 'minotaur-horn', dropChance: 4 },
          { itemId: 'centaur-bow', dropChance: 4 },
          { itemId: 'kelpie-horseshoe', dropChance: 4 },
          { itemId: 'siren-shell', dropChance: 4 },
          { itemId: 'wyvern-wing', dropChance: 4 },
          { itemId: 'yeti-fur', dropChance: 4 },

          // Epic (around 1-2% each)
          { itemId: 'phoenix-feather', dropChance: 2 },
          { itemId: 'manticore-mane', dropChance: 2 },
          { itemId: 'basilisk-eye', dropChance: 2 },
          { itemId: 'sphinx-riddle-stone', dropChance: 2 },
          { itemId: 'leprechaun-coin', dropChance: 2 },
          { itemId: 'kraken-ink', dropChance: 2 },
          { itemId: 'gorgon-hair', dropChance: 2 },

          // Legendary (0.1-0.5% each)
          { itemId: 'mermaid-tear', dropChance: 0.5 },
          { itemId: 'djinn-lamp', dropChance: 0.3 },
          { itemId: 'chimera-heart', dropChance: 0.2 },
        ],
        purchaseLimit: { amount: 3, minutes: 60, lastPurchaseTime: 0, remainingPurchases: 3 },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
      {
        id: 'ancient-civilization-pack',
        name: 'Ancient Civilization Pack',
        price: 100_000,
        minItems: 1,
        maxItems: 3,
        possibleItems: [
          // Common/Uncommon (8-10% each)
          { itemId: 'ziggurat-stone', dropChance: 10 },
          { itemId: 'eye-of-horus', dropChance: 8 },

          // Epic (3-5% each)
          { itemId: 'babylonian-tablet', dropChance: 5 },
          { itemId: 'mayan-dagger', dropChance: 4 },
          { itemId: 'rosetta-fragment', dropChance: 4 },
          { itemId: 'labyrinth-key', dropChance: 3 },

          // Legendary (0.5-2% each)
          { itemId: 'olmec-shard', dropChance: 2 },
          { itemId: 'anubis-ankh', dropChance: 1.5 },
          { itemId: 'oracle-goblet', dropChance: 1 },
          { itemId: 'aztec-calendar', dropChance: 0.8 },
          { itemId: 'nefertiti-crown', dropChance: 0.5 },
          { itemId: 'atlantean-pearl', dropChance: 0.2 },
        ],
        purchaseLimit: { amount: 3, minutes: 60, lastPurchaseTime: 0, remainingPurchases: 3 },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
      {
        id: 'cyber-template-pack',
        name: 'Cyber Temple Pack',
        price: 1_000_000,
        minItems: 1,
        maxItems: 3,
        possibleItems: [
          // Common (10-15%)
          { itemId: 'data-hieroglyph', dropChance: 15 },

          // Uncommon (7-10%)
          { itemId: 'matrix-tablet', dropChance: 10 },
          { itemId: 'holographic-relic', dropChance: 8 },

          // Rare (4-6%)
          { itemId: 'quantum-processor', dropChance: 6 },
          { itemId: 'binary-obelisk', dropChance: 5 },

          // Epic (2-3%)
          { itemId: 'nano-scarab', dropChance: 3 },
          { itemId: 'cyber-sphinx', dropChance: 3 },

          // Legendary (0.5-1%)
          { itemId: 'digital-ankh', dropChance: 0.1 },
          { itemId: 'techno-pharaoh', dropChance: 0.5 },
          { itemId: 'virtual-mummy', dropChance: 0.4 },
        ],
        purchaseLimit: { amount: 3, minutes: 60, lastPurchaseTime: 0, remainingPurchases: 3 },
        hasAutoBuyer: false,
        autoBuyEnabled: false,
      },
    ] as Pack[],

    settings: {
      showAnimations: true,
    },

    equippedItems: [] as Item[],
    maxEquippedItems: 4,

    lastUpdate: Date.now(),

    maxPackStorage: 5, // Base storage limit

    upgrades: [
      {
        id: 'pack-storage',
        name: 'Pack Storage',
        description: 'Increase maximum pack storage by 5',
        basePrice: 500,
        priceMultiplier: 1.3,
        level: 0,
        type: 'storage',
        packId: '',
        increaseAmount: 5,
      },
      {
        id: 'equipment-slot',
        name: 'Equipment Slot',
        description: 'Add another equipment slot',
        basePrice: 5000,
        priceMultiplier: 3,
        level: 0,
        maxLevel: 5,
        type: 'equipmentSlot',
        packId: '',
        increaseAmount: 1,
      },
      {
        id: 'equipment-slot-2',
        name: 'Advanced Equipment Slot',
        description: 'Add another equipment slot',
        basePrice: 500_000,
        priceMultiplier: 5,
        level: 0,
        maxLevel: 3,
        type: 'equipmentSlot',
        packId: '',
        increaseAmount: 1,
      },
      {
        id: 'morty-pack-limit',
        name: 'Morty Pack Capacity',
        description: 'Increase purchase limit of Morty Pack by 2',
        basePrice: 1000,
        priceMultiplier: 1.5,
        level: 0,
        type: 'packLimit',
        packId: 'morty-pack',
        increaseAmount: 2,
      },
      {
        id: 'morty-pack-timer',
        name: 'Morty Pack Efficiency',
        description: 'Reduce Morty Pack reset time by 10%',
        basePrice: 2000,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 9,
        type: 'packTimer',
        packId: 'morty-pack',
        increaseAmount: 0.1,
      },
      {
        id: 'morty-pack-auto',
        name: 'Morty Pack Auto-Buyer',
        description: 'Unlock automatic purchasing for Morty Pack',
        basePrice: 10000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'autoBuy',
        packId: 'morty-pack',
      },
      {
        id: 'fakemon-pack-limit',
        name: 'Fakemon Pack Capacity',
        description: 'Increase purchase limit of Fakemon Pack by 2',
        basePrice: 2500,
        priceMultiplier: 1.5,
        level: 0,
        type: 'packLimit',
        packId: 'fakemon-pack',
        increaseAmount: 2,
      },
      {
        id: 'fakemon-pack-timer',
        name: 'Fakemon Pack Efficiency',
        description: 'Reduce Fakemon Pack reset time by 10%',
        basePrice: 5000,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 9,
        type: 'packTimer',
        packId: 'fakemon-pack',
        increaseAmount: 0.1,
      },
      {
        id: 'fakemon-pack-auto',
        name: 'Fakemon Pack Auto-Buyer',
        description: 'Unlock automatic purchasing for Fakemon Pack',
        basePrice: 25000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'autoBuy',
        packId: 'fakemon-pack',
      },
      {
        id: 'mythical-pack-limit',
        name: 'Mythical Pack Capacity',
        description: 'Increase purchase limit of Mythical Pack by 2',
        basePrice: 10_000,
        priceMultiplier: 1.5,
        level: 0,
        type: 'packLimit',
        packId: 'mythical-pack',
        increaseAmount: 2,
      },
      {
        id: 'mythical-pack-timer',
        name: 'Mythical Pack Efficiency',
        description: 'Reduce Mythical Pack reset time by 10%',
        basePrice: 20_000,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 9,
        type: 'packTimer',
        packId: 'mythical-pack',
        increaseAmount: 0.1,
      },
      {
        id: 'mythical-pack-auto',
        name: 'Mythical Pack Auto-Buyer',
        description: 'Unlock automatic purchasing for Mythical Pack',
        basePrice: 100_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'autoBuy',
        packId: 'mythical-pack',
      },
      {
        id: 'mythical-pack-instant',
        name: 'Mythical Pack Instant Reset',
        description: 'Remove time restriction completely',
        basePrice: 2_000_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'packTimer',
        packId: 'mythical-pack',
        requiresUpgrade: {
          id: 'mythical-pack-timer',
          level: 9,
        },
      },
      {
        id: 'mythical-pack-opener',
        name: 'Mythical Pack Auto-Opener',
        description: 'Automatically opens Mythical Packs every few seconds',
        level: 0,
        maxLevel: 5,
        basePrice: 100_000_000,
        priceMultiplier: 5,
        type: 'autoOpener',
        packId: 'mythical-pack',
      },
      {
        id: 'ancient-pack-limit',
        name: 'Ancient Pack Capacity',
        description: 'Increase purchase limit of Ancient Civilization Pack by 2',
        basePrice: 50_000,
        priceMultiplier: 1.5,
        level: 0,
        type: 'packLimit',
        packId: 'ancient-civilization-pack',
        increaseAmount: 2,
      },
      {
        id: 'ancient-pack-timer',
        name: 'Ancient Pack Efficiency',
        description: 'Reduce Ancient Civilization Pack reset time by 10%',
        basePrice: 100_000,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 9,
        type: 'packTimer',
        packId: 'ancient-civilization-pack',
        increaseAmount: 0.1,
      },
      {
        id: 'ancient-pack-auto',
        name: 'Ancient Pack Auto-Buyer',
        description: 'Unlock automatic purchasing for Ancient Civilization Pack',
        basePrice: 500_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'autoBuy',
        packId: 'ancient-civilization-pack',
      },
      {
        id: 'cyber-pack-limit',
        name: 'Cyber Pack Capacity',
        description: 'Increase purchase limit of Cyber Temple Pack by 2',
        basePrice: 500_000,
        priceMultiplier: 1.5,
        level: 0,
        type: 'packLimit',
        packId: 'cyber-template-pack',
        increaseAmount: 2,
      },
      {
        id: 'cyber-pack-timer',
        name: 'Cyber Pack Efficiency',
        description: 'Reduce Cyber Temple Pack reset time by 10%',
        basePrice: 2_000_000,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 9,
        type: 'packTimer',
        packId: 'cyber-template-pack',
      },
      {
        id: 'cyber-pack-auto',
        name: 'Cyber Pack Auto-Buyer',
        description: 'Unlock automatic purchasing for Cyber Temple Pack',
        basePrice: 10_000_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'autoBuy',
        packId: 'cyber-template-pack',
      },
      {
        id: 'cyber-pack-instant',
        name: 'Cyber Pack Instant Reset',
        description: 'Remove time restriction completely',
        basePrice: 10_000_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'packTimer',
        packId: 'cyber-template-pack',
        requiresUpgrade: {
          id: 'cyber-pack-timer',
          level: 9,
        },
      },
      {
        id: 'ancient-pack-instant',
        name: 'Ancient Pack Instant Reset',
        description: 'Remove time restriction completely',
        basePrice: 5_000_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'packTimer',
        packId: 'ancient-civilization-pack',
        requiresUpgrade: {
          id: 'ancient-pack-timer',
          level: 9,
        },
      },
      {
        id: 'morty-pack-instant',
        name: 'Morty Pack Instant Reset',
        description: 'Remove time restriction completely',
        basePrice: 1_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'packTimer',
        packId: 'morty-pack',
        requiresUpgrade: {
          id: 'morty-pack-timer',
          level: 9,
        },
      },
      {
        id: 'fakemon-pack-instant',
        name: 'Fakemon Pack Instant Reset',
        description: 'Remove time restriction completely',
        basePrice: 50_000,
        priceMultiplier: 1,
        level: 0,
        maxLevel: 1,
        type: 'packTimer',
        packId: 'fakemon-pack',
        requiresUpgrade: {
          id: 'fakemon-pack-timer',
          level: 9,
        },
      },
      {
        id: 'morty-auto-opener',
        name: 'Morty Pack Auto Opener',
        description: 'Automatically opens Morty Packs every few seconds',
        level: 0,
        maxLevel: 5,
        basePrice: 1000000,
        priceMultiplier: 5,
        type: 'autoOpener',
        packId: 'morty-pack',
      },
      {
        id: 'ancient-auto-opener',
        name: 'Ancient Pack Auto Opener',
        description: 'Automatically opens Ancient Packs every few seconds',
        level: 0,
        maxLevel: 5,
        basePrice: 1_000_000_000,
        priceMultiplier: 5,
        type: 'autoOpener',
        packId: 'ancient-civilization-pack',
      },
      {
        id: 'cyber-auto-opener',
        name: 'Cyber Pack Auto Opener',
        description: 'Automatically opens Cyber Packs every few seconds',
        level: 0,
        maxLevel: 5,
        basePrice: 10_000_000_000,
        priceMultiplier: 5,
        type: 'autoOpener',
        packId: 'cyber-template-pack',
      },
      {
        id: 'fakemon-auto-opener',
        name: 'Fakemon Pack Auto Opener',
        description: 'Automatically opens Fakemon Packs every few seconds',
        level: 0,
        maxLevel: 5,
        basePrice: 10000000,
        priceMultiplier: 5,
        type: 'autoOpener',
        packId: 'fakemon-pack',
      },
    ] as Upgrade[],

    discoveredItems: new Set<string>(),

    autoSaveInterval: 60000, // Save every minute

    totalPacksOpened: 0,
    totalDailyPacksOpened: 0,
    totalCoinsEarned: new BigNumber(0),

    hasPerformedFirstAction: false,

    lastBackupReminder: 0, // timestamp of last backup reminder

    hasOpenedFirstPack: false,

    highestBossDefeated: 0,

    autoOpenerIntervals: {},
    lastAutoOpen: {},
  }),

  actions: {
    initApp() {
      // Try to load saved game first
      if (!this.loadFromLocalStorage()) {
        // If no save found, start new game
        this.coins = new BigNumber(500)
        this.lastUpdate = Date.now()
      } else {
        // Calculate offline progress after loading save
        this.calculateOfflineProgress()
      }

      this.isInitialized = true

      // Start intervals
      setInterval(() => {
        this.updateProduction()
        this.updatePurchaseLimits()
        this.tryAutoBuyPacks()
        this.updateAchievements()
      }, 1000)

      // Add auto-save interval
      setInterval(() => {
        this.saveToLocalStorage()
      }, this.autoSaveInterval)

      console.log('Game initialized!')
    },

    buyPack(packId: string, amount = 1) {
      const pack = this.availablePacks.find(p => p.id === packId)
      if (!pack) return false

      // Check purchase limits
      if (pack.purchaseLimit) {
        this.updatePurchaseLimits()
        if (amount > pack.purchaseLimit.remainingPurchases) return false
      }

      // Calculate current total packs
      const currentTotal = this.ownedPacks.reduce((sum, p) => sum + p.amount, 0)

      // Check if we would exceed storage limit
      if (currentTotal + amount > this.maxPackStorage) {
        // Adjust amount to fit remaining space
        amount = Math.max(0, this.maxPackStorage - currentTotal)
        if (amount === 0) return false
      }

      const totalCost = new BigNumber(pack.price).times(amount)
      if (this.coins.isLessThan(totalCost)) return false

      // Update purchase limit
      if (pack.purchaseLimit) {
        pack.purchaseLimit.remainingPurchases -= amount
        if (pack.purchaseLimit.remainingPurchases === pack.purchaseLimit.amount - amount) {
          pack.purchaseLimit.lastPurchaseTime = Date.now()
        }
      }

      this.coins = this.coins.minus(totalCost)

      // Add to owned packs
      const existingPack = this.ownedPacks.find(p => p.id === packId)
      if (existingPack) {
        existingPack.amount += amount
      } else {
        this.ownedPacks.push({
          ...pack,
          amount,
        })
      }
      return true
    },

    getMaxBuyable(packId: string): number {
      const pack = this.availablePacks.find(p => p.id === packId)
      if (!pack) return 0

      const maxByCoins = Math.floor(this.coins.dividedBy(pack.price).toNumber())
      const currentTotal = this.ownedPacks.reduce((sum, p) => sum + p.amount, 0)
      const maxByStorage = Math.max(0, this.maxPackStorage - currentTotal)

      let maxAmount = Math.min(maxByCoins, maxByStorage)

      if (pack.purchaseLimit) {
        this.updatePurchaseLimits()
        maxAmount = Math.min(maxAmount, pack.purchaseLimit.remainingPurchases)
      }

      return maxAmount
    },

    openPack(packId: string, amount = 1) {
      const pack = this.ownedPacks.find(p => p.id === packId)
      if (!pack || pack.amount < amount) return false

      // Limit the number of packs that can be opened at once
      const numPacks = Math.min(amount, pack.amount, 1000)
      const allItems: Item[] = []

      for (let i = 0; i < numPacks; i++) {
        const numItems = Math.floor(Math.random() * (pack.maxItems - pack.minItems + 1)) + pack.minItems

        for (let j = 0; j < numItems; j++) {
          const item = this.generateItemFromPack(pack)
          if (item) allItems.push(item)
        }
      }

      // Remove opened packs
      pack.amount -= numPacks
      if (pack.amount <= 0) {
        const index = this.ownedPacks.indexOf(pack)
        this.ownedPacks.splice(index, 1)
      }

      // Track achievements
      this.totalPacksOpened += amount
      if (packId === 'daily-pack') {
        this.totalDailyPacksOpened += amount
      }

      this.updateAchievements()

      this.saveToLocalStorage()

      this.hasOpenedFirstPack = true

      return allItems
    },

    generateItemFromPack(pack: Pack): Item | null {
      const itemId = itemManager.rollForItem(pack.possibleItems)
      if (!itemId) {
        // Fallback to first common item
        const fallbackId = pack.possibleItems[0]?.itemId
        return fallbackId ? itemManager.createItem(fallbackId) : null
      }

      return itemManager.createItem(itemId)
    },

    addItemToInventory(newItem: Item) {
      // Try to find existing item stack
      const existingItem = this.inventory.find(item => item.id === newItem.id)

      if (existingItem) {
        existingItem.amount += newItem.amount
      } else {
        this.inventory.push(newItem)
      }
    },

    sellItem(itemId: string, amount = 1): boolean {
      const item = this.inventory.find(i => i.id === itemId)
      if (!item || item.amount < amount) return false

      // Calculate total value with bonuses
      const totalValue = item.value.times(amount)
      const collectionBonus = collectionManager.getTotalBonus('itemValue')
      const achievementBonus = achievementManager.getTotalBonus('itemValue')
      const totalBonus = collectionBonus + achievementBonus
      const finalValue = totalValue.times(new BigNumber(1).plus(totalBonus))

      // Update inventory and add coins
      item.amount -= amount
      if (item.amount <= 0) {
        const index = this.inventory.indexOf(item)
        this.inventory.splice(index, 1)
      }

      this.coins = this.coins.plus(finalValue)
      this.totalCoinsEarned = this.totalCoinsEarned.plus(finalValue)

      this.hasPerformedFirstAction = true

      this.saveToLocalStorage()

      return true
    },

    addItemsToInventory(items: Item[]) {
      items.forEach(item => {
        this.discoveredItems.add(item.id)
        this.addItemToInventory(item)

        // Update collection
        const totalCollected = this.inventory.filter(i => i.id === item.id).reduce((sum, i) => sum + i.amount, 0)
        collectionManager.updateCollection(item.id, totalCollected)

        this.saveToLocalStorage()
      })
    },

    toggleAnimations() {
      this.settings.showAnimations = !this.settings.showAnimations
    },

    sellAllItems() {
      const unlockedItems = this.inventory.filter(item => !item.locked)
      const totalValue = unlockedItems.reduce((total, item) => {
        return total.plus(item.value.times(item.amount))
      }, new BigNumber(0))

      // Apply achievement bonus
      const multiplier = achievementManager.getTotalBonus('itemValue')
      const totalValueWithMultiplier = totalValue.times(new BigNumber(1).plus(multiplier))

      if (totalValueWithMultiplier.isGreaterThan(0)) {
        this.coins = this.coins.plus(totalValueWithMultiplier)
        this.totalCoinsEarned = this.totalCoinsEarned.plus(totalValueWithMultiplier)
        this.inventory = this.inventory.filter(item => item.locked)
      }

      this.updateAchievements()
      this.hasPerformedFirstAction = true
      this.saveToLocalStorage()
    },

    equipItem(itemId: string) {
      // Check if item exists in inventory
      const inventoryItem = this.inventory.find(item => item.id === itemId)
      if (!inventoryItem) return false

      // Check if we have available slots
      if (this.equippedItems.length >= this.maxEquippedItems) return false

      // Check if item is already equipped
      if (this.equippedItems.some(item => item.id === itemId)) {
        // Could optionally show a notification/message here
        console.log('This item is already equipped')
        return false
      }

      // Create a new equipped item
      const equippedItem = {
        ...inventoryItem,
        amount: 1,
      }

      // Add to equipped items
      this.equippedItems.push(equippedItem)

      // Remove one from inventory
      inventoryItem.amount--
      if (inventoryItem.amount <= 0) {
        const index = this.inventory.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.inventory.splice(index, 1)
        }
      }

      this.hasPerformedFirstAction = true
      this.saveToLocalStorage()

      return true
    },

    unequipItem(itemId: string) {
      const equippedItem = this.equippedItems.find(i => i.id === itemId)
      if (!equippedItem) return false

      // Remove from equipped
      const index = this.equippedItems.indexOf(equippedItem)
      this.equippedItems.splice(index, 1)

      // Add back to inventory
      this.addItemToInventory(equippedItem)

      this.saveToLocalStorage()

      return true
    },

    updateProduction() {
      const now = Date.now()
      const deltaMinutes = (now - this.lastUpdate) / (1000 * 60)

      // Use totalProduction getter instead of calculating production here
      const production = this.totalProduction

      this.coins = this.coins.plus(production.times(deltaMinutes))
      this.totalCoinsEarned = this.totalCoinsEarned.plus(production.times(deltaMinutes))
      this.updateAchievements()
      this.lastUpdate = now
    },

    updatePurchaseLimits() {
      const now = Date.now()

      this.availablePacks.forEach(pack => {
        if (!pack.purchaseLimit) return

        const minutesSinceLastPurchase = (now - pack.purchaseLimit.lastPurchaseTime) / (1000 * 60)
        const cyclesCompleted = Math.floor(minutesSinceLastPurchase / pack.purchaseLimit.minutes)

        if (cyclesCompleted > 0) {
          pack.purchaseLimit.remainingPurchases = pack.purchaseLimit.amount
          pack.purchaseLimit.lastPurchaseTime =
            now - (minutesSinceLastPurchase % pack.purchaseLimit.minutes) * 60 * 1000
        }
      })
    },

    buyUpgrade(upgradeId: string) {
      const upgrade = this.upgrades.find(u => u.id === upgradeId)
      if (!upgrade) return false

      if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false

      const cost = this.getUpgradeCost(upgrade)
      if (this.coins.isLessThan(cost)) return false

      this.coins = this.coins.minus(cost)
      upgrade.level++

      // Apply upgrade effects
      this.applyUpgradeEffects(upgrade)

      return true
    },

    getUpgradeCost(upgrade: Upgrade): BigNumber {
      if (upgrade.maxLevel === 1) {
        // For one-time purchases like instant reset upgrades
        return new BigNumber(upgrade.basePrice)
      }

      // For upgrades with multiple levels
      return new BigNumber(upgrade.basePrice).times(Math.pow(upgrade.priceMultiplier, upgrade.level))
    },

    applyUpgradeEffects(upgrade: Upgrade) {
      if (upgrade.type === 'autoOpener' && upgrade.packId) {
        this.startAutoOpener(upgrade.packId)
      }
      switch (upgrade.type) {
        case 'storage':
          this.maxPackStorage += upgrade.increaseAmount || 0
          break

        case 'equipmentSlot':
          this.maxEquippedItems += upgrade.increaseAmount || 0
          break

        case 'packLimit': {
          const pack = this.availablePacks.find(p => p.id === upgrade.packId)
          if (pack?.purchaseLimit) {
            pack.purchaseLimit.amount += upgrade.increaseAmount || 0
            pack.purchaseLimit.remainingPurchases += upgrade.increaseAmount || 0
          }
          break
        }

        case 'packTimer': {
          const pack = this.availablePacks.find(p => p.id === upgrade.packId)
          if (pack?.purchaseLimit) {
            // Get the base timer for this pack type
            const baseTimer = pack.purchaseLimit.minutes

            // Calculate total reduction from all levels of this upgrade
            const totalReduction = (upgrade.increaseAmount || 0) * upgrade.level

            // Apply the reduction to the base timer (minimum 10% of original time)
            pack.purchaseLimit.minutes = Math.max(baseTimer * 0.1, baseTimer * (1 - totalReduction))
          }
          break
        }

        case 'autoBuy': {
          const pack = this.availablePacks.find(p => p.id === upgrade.packId)
          if (pack) {
            pack.hasAutoBuyer = true
          }
          break
        }
      }
    },

    hasAllItemsOfRarity(rarity: string): boolean {
      const allItemsOfRarity = Array.from(itemManager.getAllItems().values()).filter(item => item.rarity === rarity)

      return allItemsOfRarity.every(item => this.discoveredItems.has(item.id))
    },

    toggleAutoBuy(packId: string) {
      const pack = this.availablePacks.find(p => p.id === packId)
      if (!pack || !pack.hasAutoBuyer) return
      pack.autoBuyEnabled = !pack.autoBuyEnabled
    },

    tryAutoBuyPacks() {
      for (const pack of this.availablePacks) {
        if (pack.hasAutoBuyer && pack.autoBuyEnabled) {
          const maxBuyable = this.getMaxBuyable(pack.id)
          if (maxBuyable > 0) {
            this.buyPack(pack.id, maxBuyable)
          }
        }
      }
    },

    getSaveData(): SaveData {
      const bossStore = useBossStore()
      return {
        coins: this.coins.toString(),
        inventory: this.inventory.map(item => ({
          ...item,
          value: item.value.toString(),
        })),
        equippedItems: this.equippedItems.map(item => ({
          ...item,
          value: item.value.toString(),
        })),
        ownedPacks: this.ownedPacks,
        maxEquippedItems: this.maxEquippedItems,
        maxPackStorage: this.maxPackStorage,
        upgrades: this.upgrades,
        discoveredItems: Array.from(this.discoveredItems),
        collection: collectionManager.getCollectionData(),
        lastUpdate: this.lastUpdate,
        availablePacks: this.availablePacks,
        settings: { showAnimations: this.settings.showAnimations },
        hasPerformedFirstAction: this.hasPerformedFirstAction,
        lastBackupReminder: this.lastBackupReminder,
        hasOpenedFirstPack: this.hasOpenedFirstPack,
        totalPacksOpened: this.totalPacksOpened,
        totalDailyPacksOpened: this.totalDailyPacksOpened,
        totalCoinsEarned: this.totalCoinsEarned.toString(),
        bossData: bossStore.getSaveData(),
      }
    },

    loadSaveData(saveData: SaveData) {
      try {
        // Load basic values with defaults
        this.coins = new BigNumber(saveData.coins)
        this.maxEquippedItems = saveData.maxEquippedItems ?? 4
        this.maxPackStorage = saveData.maxPackStorage ?? 5
        this.settings = {
          showAnimations: saveData.settings?.showAnimations ?? true,
        }

        // Load inventory with combat stats
        this.inventory = saveData.inventory.map(item => {
          const newItem = {
            ...item,
            value: new BigNumber(item.value),
          }

          // Properly reinitialize combat stats if the item definition has them
          const definition = itemManager.getItem(item.id)
          if (definition?.combatStats) {
            const savedCombatStats = (item as ItemWithCombatStats).combatStats || {}
            ;(newItem as ItemWithCombatStats).combatStats = {
              ...definition.combatStats,
              level: savedCombatStats.level || 1,
              experience: savedCombatStats.experience || 0,
              requiredExperience:
                savedCombatStats.requiredExperience ||
                itemManager.calculateRequiredExperience(savedCombatStats.level || 1),
            }

            // Recalculate stats based on level
            if ((newItem as ItemWithCombatStats).combatStats.level > 1) {
              const stats = itemManager.calculateStatsForLevel(
                definition.combatStats,
                (newItem as ItemWithCombatStats).combatStats.level
              )
              ;(newItem as ItemWithCombatStats).combatStats.attack = stats.attack
              ;(newItem as ItemWithCombatStats).combatStats.defense = stats.defense
              ;(newItem as ItemWithCombatStats).combatStats.health = stats.health
            }

            return newItem as ItemWithCombatStats
          }
          return newItem
        })

        // Load equipped items with combat stats (same logic as inventory)
        this.equippedItems = saveData.equippedItems.map(item => {
          const newItem = {
            ...item,
            value: new BigNumber(item.value),
          }

          const definition = itemManager.getItem(item.id)
          if (definition?.combatStats) {
            const savedCombatStats = (item as ItemWithCombatStats).combatStats || {}
            ;(newItem as ItemWithCombatStats).combatStats = {
              ...definition.combatStats,
              level: savedCombatStats.level || 1,
              experience: savedCombatStats.experience || 0,
              requiredExperience:
                savedCombatStats.requiredExperience ||
                itemManager.calculateRequiredExperience(savedCombatStats.level || 1),
            }

            if ((newItem as ItemWithCombatStats).combatStats.level > 1) {
              const stats = itemManager.calculateStatsForLevel(
                definition.combatStats,
                (newItem as ItemWithCombatStats).combatStats.level
              )
              ;(newItem as ItemWithCombatStats).combatStats.attack = stats.attack
              ;(newItem as ItemWithCombatStats).combatStats.defense = stats.defense
              ;(newItem as ItemWithCombatStats).combatStats.health = stats.health
            }

            return newItem as ItemWithCombatStats
          }
          return newItem
        })

        // Load owned packs
        this.ownedPacks = saveData.ownedPacks ?? []

        // Merge available packs with new content
        const defaultState = useStore().$state
        this.availablePacks = defaultState.availablePacks.map(defaultPack => {
          const savedPack = saveData.availablePacks?.find((p: Pack) => p.id === defaultPack.id)
          if (savedPack) {
            // Preserve saved state but ensure all properties exist
            return {
              ...defaultPack,
              ...savedPack,
              // Ensure purchase limit is properly merged
              purchaseLimit: savedPack.purchaseLimit
                ? {
                    ...defaultPack.purchaseLimit,
                    ...savedPack.purchaseLimit,
                  }
                : defaultPack.purchaseLimit,
              // Ensure auto buyer properties exist
              hasAutoBuyer: savedPack.hasAutoBuyer ?? defaultPack.hasAutoBuyer ?? false,
              autoBuyEnabled: savedPack.autoBuyEnabled ?? defaultPack.autoBuyEnabled ?? false,
            }
          }
          return defaultPack // Use default for new packs
        })

        // Merge upgrades with new content
        this.upgrades = defaultState.upgrades.map(defaultUpgrade => {
          const savedUpgrade = saveData.upgrades?.find((u: Upgrade) => u.id === defaultUpgrade.id)
          if (savedUpgrade) {
            // Preserve saved state but ensure all properties exist
            return {
              ...defaultUpgrade,
              ...savedUpgrade,
            }
          }
          return defaultUpgrade // Use default for new upgrades
        })

        // Load discovered items
        this.discoveredItems = new Set(saveData.discoveredItems ?? [])

        // Load collection
        if (saveData.collection) {
          collectionManager.loadSaveData(saveData.collection)
        }

        // Load last update time
        this.lastUpdate = saveData.lastUpdate ?? Date.now()

        this.hasPerformedFirstAction = saveData.hasPerformedFirstAction ?? false

        this.lastBackupReminder = saveData.lastBackupReminder ?? 0
        this.checkBackupReminder()

        this.hasOpenedFirstPack = saveData.hasOpenedFirstPack ?? false

        // Load totals
        this.totalPacksOpened = saveData.totalPacksOpened ?? 0
        this.totalDailyPacksOpened = saveData.totalDailyPacksOpened ?? 0
        this.totalCoinsEarned = new BigNumber(saveData.totalCoinsEarned ?? '0')

        // Update achievements based on loaded totals
        this.updateAchievements()

        // Load boss data if it exists
        if (saveData.bossData) {
          const bossStore = useBossStore()
          bossStore.loadSaveData(saveData.bossData)
        }

        console.log('Save data loaded successfully')
      } catch (error) {
        console.error('Failed to load save data:', error)
        throw new Error('Invalid save data')
      }
    },

    saveToLocalStorage() {
      try {
        const saveData = {
          ...this.getSaveData(),
          lastUpdate: Date.now(),
        }
        localStorage.setItem('gameState', JSON.stringify(saveData))
        localStorage.setItem('lastSaved', Date.now().toString())

        window.dispatchEvent(new Event('gameSaved'))
      } catch (error) {
        console.error('Failed to save game:', error)
      }
    },

    loadFromLocalStorage() {
      try {
        const savedState = localStorage.getItem('gameState')
        if (savedState) {
          this.loadSaveData(JSON.parse(savedState))
          return true
        }
      } catch (error) {
        console.error('Failed to load saved game:', error)
      }
      return false
    },

    resetGame() {
      localStorage.removeItem('gameState')
      localStorage.removeItem('lastSaved')
      window.location.reload()
    },

    calculateOfflineProgress() {
      const now = Date.now()
      const timeDiff = now - this.lastUpdate

      if (timeDiff <= 0) return

      // Calculate offline coins from equipped items
      const minutesOffline = timeDiff / (1000 * 60)
      const productionPerMinute = this.totalProduction
      const offlineEarnings = productionPerMinute.times(minutesOffline)

      // Add offline earnings
      if (offlineEarnings.isGreaterThan(0)) {
        this.coins = this.coins.plus(offlineEarnings)
        this.totalCoinsEarned = this.totalCoinsEarned.plus(offlineEarnings)
        this.updateAchievements()
      }

      // Update pack purchase limits
      this.availablePacks.forEach(pack => {
        if (pack.purchaseLimit) {
          const resetTime = pack.purchaseLimit.minutes * 60 * 1000
          const resetsPossible = Math.floor((now - pack.purchaseLimit.lastPurchaseTime) / resetTime)

          if (resetsPossible > 0) {
            // Reset purchase limit
            pack.purchaseLimit.remainingPurchases = pack.purchaseLimit.amount
            pack.purchaseLimit.lastPurchaseTime = now - ((now - pack.purchaseLimit.lastPurchaseTime) % resetTime)
          }
        }
      })

      // Check for backup reminder
      this.checkBackupReminder()

      // Update last update time
      this.lastUpdate = now
    },

    calculateSynergyBonus(item: ItemDefinition): number {
      if (!item.synergyEffect) return 0

      const { condition } = item.synergyEffect

      switch (condition.type) {
        case 'itemType':
          const typesArray = Array.isArray(condition.value) ? condition.value : [condition.value]
          const matchingItems = this.equippedItems.filter(equipped => {
            const def = itemManager.getItem(equipped.id)
            return def?.types?.some(type => typesArray.includes(type))
          })
          return matchingItems.length * item.synergyEffect.bonus

        case 'specificItem':
          const hasItem = this.equippedItems.some(equipped => equipped.id === condition.value)
          return hasItem ? item.synergyEffect.bonus : 0

        case 'itemCount':
          const types = Array.isArray(condition.value) ? condition.value : [condition.value]
          const counts = types.map(
            type =>
              this.equippedItems.filter(equipped => {
                const def = itemManager.getItem(equipped.id)
                return def?.types?.includes(type as ItemType)
              }).length
          )
          return counts.every(count => count >= (condition.minCount || 1)) ? item.synergyEffect.bonus : 0

        default:
          return 0
      }
    },

    updateAchievements() {
      // Track pack openings
      achievementManager.updateProgress('pack-opener-1', this.totalPacksOpened)
      achievementManager.updateProgress('pack-opener-2', this.totalPacksOpened)
      achievementManager.updateProgress('pack-opener-3', this.totalPacksOpened)
      achievementManager.updateProgress('pack-opener-4', this.totalPacksOpened)
      achievementManager.updateProgress('pack-opener-5', this.totalPacksOpened)

      // Track daily packs
      achievementManager.updateProgress('daily-collector-1', this.totalDailyPacksOpened)
      achievementManager.updateProgress('daily-collector-2', this.totalDailyPacksOpened)

      // Track unique items
      achievementManager.updateProgress('collector-1', this.discoveredItems.size)
      achievementManager.updateProgress('collector-2', this.discoveredItems.size)
      achievementManager.updateProgress('collector-3', this.discoveredItems.size)
      achievementManager.updateProgress('collector-4', this.discoveredItems.size)

      // Track total coins
      achievementManager.updateProgress('wealthy-1', this.totalCoinsEarned.toNumber())
      achievementManager.updateProgress('wealthy-2', this.totalCoinsEarned.toNumber())
      achievementManager.updateProgress('wealthy-3', this.totalCoinsEarned.toNumber())
      achievementManager.updateProgress('wealthy-4', this.totalCoinsEarned.toNumber())
      achievementManager.updateProgress('wealthy-5', this.totalCoinsEarned.toNumber())
    },

    toggleItemLock(itemId: string) {
      const item = this.inventory.find(i => i.id === itemId)
      if (item) {
        item.locked = !item.locked
      }
    },

    updateCollectionFromInventory() {
      // Clear existing collection data
      collectionManager.resetCollection()

      // Update collection based on current inventory
      const itemCounts = new Map<string, number>()

      // Count items in inventory
      this.inventory.forEach(item => {
        const currentCount = itemCounts.get(item.id) || 0
        itemCounts.set(item.id, currentCount + item.amount)
      })

      // Update collection with counts
      itemCounts.forEach((count, itemId) => {
        collectionManager.updateCollection(itemId, count)
      })
    },

    checkBackupReminder() {
      const TWELVE_HOURS = 12 * 60 * 60 * 1000
      const now = Date.now()

      if (now - this.lastBackupReminder >= TWELVE_HOURS) {
        this.lastBackupReminder = now
        this.saveToLocalStorage()

        // Show backup reminder
        const reminder = document.createElement('div')
        reminder.className =
          'fixed z-50 px-4 py-3 text-yellow-700 bg-yellow-100 border border-yellow-400 rounded top-4 right-4'
        reminder.innerHTML = `
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-bold">Backup Reminder</p>
              <p class="text-sm">Please download a backup of your save file to prevent progress loss.</p>
            </div>
            <button class="ml-4 text-yellow-700 hover:text-yellow-900" onclick="this.parentElement.parentElement.remove()">
              ×
            </button>
          </div>
        `
        document.body.appendChild(reminder)

        // Auto-remove after 1 minute
        setTimeout(() => {
          if (reminder && reminder.parentElement) {
            reminder.remove()
          }
        }, 60000)
      }
    },

    getItemDefinition(itemId: string): ItemDefinition | undefined {
      return itemManager.getItem(itemId)
    },

    updateHighestBoss(bossId: number) {
      if (bossId > this.highestBossDefeated) {
        this.highestBossDefeated = bossId
      }
    },

    startAutoOpener(packId: string) {
      const upgrade = this.upgrades.find(u => u.type === 'autoOpener' && u.packId === packId)
      if (!upgrade || upgrade.level === 0) return

      // Clear existing interval if any
      if (this.autoOpenerIntervals[packId]) {
        clearInterval(this.autoOpenerIntervals[packId])
      }

      // Calculate interval based on upgrade level (faster at higher levels)
      // Level 1: 10 seconds, Level 5: 2 seconds
      const interval = Math.max(2000, 10000 - (upgrade.level - 1) * 2000)

      this.autoOpenerIntervals[packId] = setInterval(() => {
        const now = Date.now()
        const pack = this.availablePacks.find(p => p.id === packId)

        // Check if pack exists and if we can open it
        if (!pack || !this.canOpenPack(pack)) return

        // Check if enough time has passed since last purchase
        if (pack.purchaseLimit && pack.purchaseLimit.minutes > 0) {
          const lastOpen = this.lastAutoOpen[packId] || 0
          if (now - lastOpen < pack.purchaseLimit.minutes * 60 * 1000) return
        }

        // Open the pack silently (without modal)
        this.openPackSilently(pack)
        this.lastAutoOpen[packId] = now
      }, interval)
    },

    openPackSilently(pack: Pack) {
      const items = this.generatePackItems(pack)
      items.forEach(item => {
        const existingItem = this.inventory.find(i => i.id === item.id)
        if (existingItem) {
          existingItem.amount += item.amount
        } else {
          this.inventory.push(item)
        }
      })
      this.saveToLocalStorage()
    },

    stopAutoOpener(packId: string) {
      if (this.autoOpenerIntervals[packId]) {
        clearInterval(this.autoOpenerIntervals[packId])
        delete this.autoOpenerIntervals[packId]
      }
    },

    initAutoOpeners() {
      this.upgrades
        .filter(u => u.type === 'autoOpener' && u.level > 0)
        .forEach(u => {
          if (u.packId) this.startAutoOpener(u.packId)
        })
    },
  },

  getters: {
    isReady: state => state.isInitialized,
    canBuyPack: state => (packId: string) => {
      const pack = state.availablePacks.find(p => p.id === packId)
      return pack ? state.coins.isGreaterThanOrEqualTo(pack.price) : false
    },

    // Add formatters
    formattedCoins: state => formatNumber(state.coins),

    totalProduction(): BigNumber {
      let production = this.baseProduction
      const achievementBonus = achievementManager.getTotalBonus('coinProduction')
      const collectionBonus = collectionManager.getTotalBonus('coinProduction')
      const totalBonus = achievementBonus + collectionBonus
      return production.times(1 + totalBonus)
    },

    formattedProduction(): string {
      return `${formatNumber(this.totalProduction)}/min`
    },

    baseProduction(): BigNumber {
      return this.equippedItems.reduce((total, item) => {
        const definition = itemManager.getItem(item.id)
        if (!definition) return total

        let production = new BigNumber(definition.coinsPerMinute || 0)

        const multiplier = achievementManager.getTotalBonus('coinProduction')
        production = production.times(new BigNumber(1).plus(multiplier))

        // Apply synergy effects
        if (definition.synergyEffect && definition.synergyEffect.type === 'coinGen') {
          const bonus = useStore().calculateSynergyBonus(definition)
          production = production.times(new BigNumber(1).plus(bonus))
        }

        return total.plus(production)
      }, new BigNumber(0))
    },

    getPackTimeRemaining: state => (packId: string) => {
      const pack = state.availablePacks.find(p => p.id === packId)
      if (!pack?.purchaseLimit) return null

      const now = Date.now()
      const timeSinceLastPurchase = now - pack.purchaseLimit.lastPurchaseTime
      const resetTime = pack.purchaseLimit.minutes * 60 * 1000
      const timeRemaining = Math.max(0, resetTime - timeSinceLastPurchase)

      return timeRemaining
    },

    packStorageUsed(): number {
      return this.ownedPacks.reduce((sum, pack) => sum + pack.amount, 0)
    },

    packStorageRemaining(): number {
      return this.maxPackStorage - this.packStorageUsed
    },

    upgradeGroups(): UpgradeGroup[] {
      return getUpgradeGroups(this.upgrades)
    },
  },

  onUnmounted() {
    // Clear all auto-opener intervals
    Object.values(this.autoOpenerIntervals).forEach(interval => clearInterval(interval))
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}

// Utility function to format numbers
function formatNumber(num: BigNumber | number): string {
  const n = new BigNumber(num)

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

  // If number is less than 1000, return it as is
  if (n.isLessThan(1000)) {
    return n.toFixed(0)
  }

  // Find the suffix index
  const suffixIndex = Math.floor(n.e / 3)

  if (suffixIndex >= suffixes.length) {
    return n.toExponential(2)
  }

  // Format the number
  const formatted = n.dividedBy(new BigNumber(1000).pow(suffixIndex)).toFixed(2)
  return `${formatted}${suffixes[suffixIndex]}`
}
