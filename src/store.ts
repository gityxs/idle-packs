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
            dropChance: 5,
          },
        ],
      },
    ] as Pack[],
  }),

  actions: {
    initApp() {
      this.isInitialized = true
      // Initialize with some starting coins
      this.coins = new BigNumber(500)
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

      // Open specified number of packs
      for (let i = 0; i < amount; i++) {
        // Generate random items for each pack
        const numItems = Math.floor(Math.random() * (pack.maxItems - pack.minItems + 1)) + pack.minItems

        for (let j = 0; j < numItems; j++) {
          const item = this.generateItemFromPack(pack)
          if (item) allItems.push(item)
        }
      }

      // Remove opened packs
      pack.amount -= amount
      if (pack.amount <= 0) {
        const index = this.ownedPacks.indexOf(pack)
        this.ownedPacks.splice(index, 1)
      }

      // Add all items to inventory (with stacking)
      allItems.forEach(item => this.addItemToInventory(item))
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
  },

  getters: {
    isReady: state => state.isInitialized,
    canBuyPack: state => (packId: string) => {
      const pack = state.availablePacks.find(p => p.id === packId)
      return pack ? state.coins.isGreaterThanOrEqualTo(pack.price) : false
    },

    // Add formatters
    formattedCoins: state => formatNumber(state.coins),
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
