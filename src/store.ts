import { acceptHMRUpdate, defineStore } from 'pinia'
import BigNumber from 'bignumber.js'

interface Item {
  id: string
  name: string
  value: BigNumber
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  amount: number
}

interface ItemTemplate {
  id: string
  name: string
  value: number | string // Base value that will be converted to BigNumber
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  dropChance: number
}

interface Pack {
  id: string
  name: string
  price: number
  minItems: number
  maxItems: number
  possibleItems: ItemTemplate[]
}

interface OwnedPack extends Pack {
  amount: number
}

// Add new interfaces for generators
interface Generator {
  id: string
  name: string
  baseProduction: number | string // Amount of coins generated per second
  baseCost: number | string
  amount: number
  description: string
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
        id: 'basic-pack',
        name: 'Basic Pack',
        price: 50,
        minItems: 3,
        maxItems: 5,
        possibleItems: [
          {
            id: 'wooden-sword',
            name: 'Wooden Sword',
            value: 10,
            rarity: 'common',
            dropChance: 40,
          },
          {
            id: 'leather-armor',
            name: 'Leather Armor',
            value: 15,
            rarity: 'common',
            dropChance: 35,
          },
          {
            id: 'iron-dagger',
            name: 'Iron Dagger',
            value: 75,
            rarity: 'uncommon',
            dropChance: 20,
          },
          {
            id: 'health-potion',
            name: 'Health Potion',
            value: 200,
            rarity: 'rare',
            dropChance: 5,
          },
          {
            id: 'magic-staff',
            name: 'Magic Staff',
            value: 250,
            rarity: 'legendary',
            dropChance: 1,
          },
        ],
      },
      {
        id: 'premium-pack',
        name: 'Premium Pack',
        price: 300,
        minItems: 4,
        maxItems: 6,
        possibleItems: [
          {
            id: 'steel-sword',
            name: 'Steel Sword',
            value: 50,
            rarity: 'uncommon',
            dropChance: 40,
          },
          {
            id: 'magic-staff',
            name: 'Magic Staff',
            value: 250,
            rarity: 'rare',
            dropChance: 35,
          },
          {
            id: 'dragon-scale',
            name: 'Dragon Scale',
            value: 750,
            rarity: 'epic',
            dropChance: 20,
          },
          {
            id: 'legendary-gem',
            name: 'Legendary Gem',
            value: 2000,
            rarity: 'legendary',
            dropChance: 0.01,
          },
        ],
      },
    ] as Pack[],

    settings: {
      showAnimations: true,
    },

    generators: [
      {
        id: 'coin-miner',
        name: 'Coin Miner',
        baseProduction: 1,
        baseCost: 100,
        amount: 0,
        description: 'A basic machine that generates coins',
      },
      {
        id: 'treasure-hunter',
        name: 'Treasure Hunter',
        baseProduction: 5,
        baseCost: 500,
        amount: 0,
        description: 'Searches for valuable treasures',
      },
      {
        id: 'magic-forge',
        name: 'Magic Forge',
        baseProduction: 25,
        baseCost: 2500,
        amount: 0,
        description: 'Magically forges coins from thin air',
      },
      {
        id: 'dragon-hoard',
        name: 'Dragon Hoard',
        baseProduction: 100,
        baseCost: 10000,
        amount: 0,
        description: 'A dragon that hoards and multiplies coins',
      },
    ] as Generator[],

    lastUpdate: Date.now(), // Track time for production calculations
  }),

  actions: {
    initApp() {
      this.isInitialized = true
      this.coins = new BigNumber(500)

      // Start production interval
      setInterval(() => this.updateProduction(), 1000)

      console.log('Game initialized!')
    },

    buyPack(packId: string, amount = 1) {
      const pack = this.availablePacks.find(p => p.id === packId)
      if (!pack) return false

      const totalCost = new BigNumber(pack.price).times(amount)
      if (this.coins.isLessThan(totalCost)) return false

      this.coins = this.coins.minus(totalCost)

      // Check if pack already exists in inventory
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

      return Math.floor(this.coins.dividedBy(pack.price).toNumber())
    },

    openPack(packId: string, amount = 1) {
      const pack = this.ownedPacks.find(p => p.id === packId)
      if (!pack || pack.amount < amount) return false

      const allItems: Item[] = []

      // Open all packs at once
      const numPacks = Math.min(amount, pack.amount)
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
      // Roll for each possible item based on drop chance
      const roll = Math.random() * 100
      let chanceSum = 0

      for (const template of pack.possibleItems) {
        chanceSum += template.dropChance
        if (roll <= chanceSum) {
          return {
            ...template,
            value: new BigNumber(template.value),
            amount: 1,
          }
        }
      }

      // Fallback to first common item if nothing was selected
      // (shouldn't happen if drop chances sum to 100)
      const fallbackItem = pack.possibleItems.find(item => item.rarity === 'common')
      return fallbackItem ? { ...fallbackItem, amount: 1 } : null
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
      items.forEach(item => this.addItemToInventory(item))
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

    buyGenerator(generatorId: string, amount = 1) {
      const generator = this.generators.find(g => g.id === generatorId)
      if (!generator) return false

      const cost = this.getGeneratorCost(generator, amount)
      if (this.coins.isLessThan(cost)) return false

      this.coins = this.coins.minus(cost)
      generator.amount += amount
      return true
    },

    getGeneratorCost(generator: Generator, amount = 1): BigNumber {
      // Cost increases exponentially with amount owned
      // Formula: baseCost * (1.15 ^ amount)
      const baseCost = new BigNumber(generator.baseCost)
      const currentCost = baseCost.times(new BigNumber(1.15).pow(generator.amount))

      // Calculate total cost for buying multiple
      if (amount === 1) return currentCost

      const finalCost = baseCost
        .times(new BigNumber(1.15).pow(generator.amount + amount).minus(new BigNumber(1.15).pow(generator.amount)))
        .dividedBy(0.15)

      return finalCost
    },

    getMaxBuyableGenerators(generatorId: string): number {
      const generator = this.generators.find(g => g.id === generatorId)
      if (!generator) return 0

      // Formula: log1.15(coins * 0.15 / baseCost + 1.15^current) - current
      const coins = this.coins
      const baseCost = new BigNumber(generator.baseCost)
      const current = generator.amount

      if (coins.isLessThan(baseCost)) return 0

      const maxAmount = Math.floor(
        Math.log(coins.times(0.15).dividedBy(baseCost).plus(new BigNumber(1.15).pow(current)).toNumber()) /
          Math.log(1.15) -
          current
      )

      return Math.max(0, maxAmount)
    },

    updateProduction() {
      const now = Date.now()
      const delta = (now - this.lastUpdate) / 1000 // Time in seconds

      // Calculate total production
      const production = this.generators.reduce((total, generator) => {
        const baseProduction = new BigNumber(generator.baseProduction)
        return total.plus(baseProduction.times(generator.amount))
      }, new BigNumber(0))

      // Add produced coins
      this.coins = this.coins.plus(production.times(delta))
      this.lastUpdate = now
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
      return this.generators.reduce((total, generator) => {
        return total.plus(new BigNumber(generator.baseProduction).times(generator.amount))
      }, new BigNumber(0))
    },

    formattedProduction(): string {
      return `${formatNumber(this.totalProduction)}/s`
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
