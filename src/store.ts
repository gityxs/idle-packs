import { acceptHMRUpdate, defineStore } from 'pinia'
import BigNumber from 'bignumber.js'
import { itemManager, type ItemDrop } from './managers/itemManager'

interface Item {
  id: string
  name: string
  value: BigNumber
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  amount: number
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
  type: 'packLimit' | 'packTimer' | 'storage' | 'equipmentSlot'
  packId: string
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
      },
      {
        id: 'equipment-slot',
        name: 'Equipment Slot',
        description: 'Add another equipment slot',
        basePrice: 5000,
        priceMultiplier: 3,
        level: 0,
        maxLevel: 4,
        type: 'equipmentSlot',
        packId: '',
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
      },
    ] as Upgrade[],

    discoveredItems: new Set<string>(),
  }),

  actions: {
    initApp() {
      this.isInitialized = true
      this.coins = new BigNumber(500)

      // Start production interval and purchase limit updates
      setInterval(() => {
        this.updateProduction()
        this.updatePurchaseLimits()
      }, 1000)

      console.log('Game initialized!')
      this.discoveredItems = new Set()
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

    sellItem(itemId: string, amount = 1) {
      const item = this.inventory.find(i => i.id === itemId)
      if (!item || item.amount < amount) return false

      // Calculate total value
      const totalValue = item.value.times(amount)

      // Update inventory
      item.amount -= amount
      if (item.amount <= 0) {
        const index = this.inventory.indexOf(item)
        this.inventory.splice(index, 1)
      }

      // Add coins
      this.coins = this.coins.plus(totalValue)
      return true
    },

    addItemsToInventory(items: Item[]) {
      items.forEach(item => {
        this.discoveredItems.add(item.id)
        this.addItemToInventory(item)
      })
    },

    toggleAnimations() {
      this.settings.showAnimations = !this.settings.showAnimations
    },

    sellAllItems() {
      // Calculate total value of all items
      const totalValue = this.inventory.reduce((sum, item) => {
        return sum.plus(item.value.times(item.amount))
      }, new BigNumber(0))

      // Add coins
      this.coins = this.coins.plus(totalValue)

      // Clear inventory
      this.inventory = []

      return totalValue
    },

    equipItem(itemId: string) {
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
      if (upgrade.type === 'storage') {
        this.maxPackStorage += 5
        return
      }

      if (upgrade.type === 'equipmentSlot') {
        this.maxEquippedItems++
        return
      }

      const pack = this.availablePacks.find(p => p.id === upgrade.packId)
      if (!pack?.purchaseLimit) return

      if (upgrade.type === 'packLimit') {
        const increaseAmount = upgrade.packId === 'morty-pack' ? 2 : 1
        pack.purchaseLimit.amount += increaseAmount
        pack.purchaseLimit.remainingPurchases = pack.purchaseLimit.amount
      } else if (upgrade.type === 'packTimer') {
        pack.purchaseLimit.minutes = Math.max(1, Math.floor(pack.purchaseLimit.minutes * 0.9))
      }
    },

    hasAllItemsOfRarity(rarity: string): boolean {
      const allItemsOfRarity = Array.from(itemManager.getAllItems().values()).filter(item => item.rarity === rarity)

      return allItemsOfRarity.every(item => this.discoveredItems.has(item.id))
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
      return this.equippedItems.reduce((total, item) => {
        const definition = itemManager.getItem(item.id)
        if (!definition) return total
        return total.plus(new BigNumber(definition.coinsPerMinute))
      }, new BigNumber(0))
    },

    formattedProduction(): string {
      return `${formatNumber(this.totalProduction)}/min`
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
