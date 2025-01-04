import { acceptHMRUpdate, defineStore } from 'pinia'
import BigNumber from 'bignumber.js'
import { itemManager, type ItemDefinition, type ItemDrop } from './managers/itemManager'
import { achievementManager } from './managers/achievementManager'
import { collectionManager } from './managers/collectionManager'

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
  type: 'packLimit' | 'packTimer' | 'storage' | 'equipmentSlot' | 'autoBuy'
  packId: string
  increaseAmount?: number
}

interface SaveData {
  coins: string
  inventory: Item[]
  ownedPacks: OwnedPack[]
  equippedItems: Item[]
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
        maxLevel: 5,
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
        maxLevel: 5,
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
        maxLevel: 5,
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
        maxLevel: 5,
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
    ] as Upgrade[],

    discoveredItems: new Set<string>(),

    autoSaveInterval: 60000, // Save every minute

    totalPacksOpened: 0,
    totalDailyPacksOpened: 0,
    totalCoinsEarned: new BigNumber(0),

    hasPerformedFirstAction: false,

    lastBackupReminder: 0, // timestamp of last backup reminder
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

      if (this.inventory.length > 0) {
        this.hasPerformedFirstAction = true
        this.saveToLocalStorage()
      }
    },

    equipItem(itemId: string): boolean {
      const item = this.inventory.find(i => i.id === itemId)
      if (!item || item.amount < 1) return false

      // Check if we have room for more items
      if (this.equippedItems.length >= this.maxEquippedItems) return false

      // Remove from inventory
      item.amount--
      if (item.amount <= 0) {
        const index = this.inventory.indexOf(item)
        this.inventory.splice(index, 1)
      }

      // Add to equipped items
      this.equippedItems.push({ ...item, amount: 1 })

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

      // Calculate total production from equipped items
      const production = this.equippedItems.reduce((total, item) => {
        if (!item) return total
        const definition = itemManager.getItem(item.id)
        if (!definition) return total
        return total.plus(new BigNumber(definition.coinsPerMinute))
      }, new BigNumber(0))

      this.coins = this.coins.plus(production.times(deltaMinutes))
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
      return new BigNumber(upgrade.basePrice).times(new BigNumber(upgrade.priceMultiplier).pow(upgrade.level))
    },

    applyUpgradeEffects(upgrade: Upgrade) {
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
            const reduction = upgrade.increaseAmount || 0
            pack.purchaseLimit.minutes *= 1 - reduction
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
      return {
        coins: this.coins.toString(),
        inventory: this.inventory,
        ownedPacks: this.ownedPacks,
        equippedItems: this.equippedItems,
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

        // Load inventory with BigNumber conversion
        this.inventory = (saveData.inventory ?? []).map((item: any) => ({
          ...item,
          value: new BigNumber(item.value),
        }))

        // Load equipped items with BigNumber conversion
        this.equippedItems = (saveData.equippedItems ?? []).map((item: any) => ({
          ...item,
          value: new BigNumber(item.value),
        }))

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

        // Show notification of offline earnings
        const formattedEarnings = formatNumber(offlineEarnings)
        const formattedMinutes = Math.floor(minutesOffline)
        console.log(`Earned ${formattedEarnings} coins while away for ${formattedMinutes} minutes!`)
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

      // Track daily packs
      achievementManager.updateProgress('daily-collector-1', this.totalDailyPacksOpened)

      // Track unique items
      achievementManager.updateProgress('collector-1', this.discoveredItems.size)
      achievementManager.updateProgress('collector-2', this.discoveredItems.size)

      // Track total coins
      achievementManager.updateProgress('wealthy-1', this.totalCoinsEarned.toNumber())
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
          'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50'
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

        let production = new BigNumber(definition.coinsPerMinute)

        let multiplier = achievementManager.getTotalBonus('coinProduction')
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
