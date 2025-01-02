import { acceptHMRUpdate, defineStore } from 'pinia'

interface Item {
  id: string
  name: string
  value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  amount: number
}

interface ItemTemplate {
  id: string
  name: string
  value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  dropChance: number // Percentage (0-100)
}

interface Pack {
  id: string
  name: string
  price: number
  minItems: number
  maxItems: number
  possibleItems: ItemTemplate[]
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
    coins: 0,
    inventory: [] as Item[],
    ownedPacks: [] as Pack[],

    // Available packs in the shop
    availablePacks: [
      {
        id: 'basic-pack',
        name: 'Basic Pack',
        price: 100,
        minItems: 3,
        maxItems: 5,
        possibleItems: [
          {
            id: 'wooden-sword',
            name: 'Wooden Sword',
            value: 50,
            rarity: 'common',
            dropChance: 35,
          },
          {
            id: 'leather-armor',
            name: 'Leather Armor',
            value: 75,
            rarity: 'common',
            dropChance: 35,
          },
          {
            id: 'iron-dagger',
            name: 'Iron Dagger',
            value: 150,
            rarity: 'uncommon',
            dropChance: 20,
          },
          {
            id: 'health-potion',
            name: 'Health Potion',
            value: 200,
            rarity: 'rare',
            dropChance: 10,
          },
        ],
      },
      {
        id: 'premium-pack',
        name: 'Premium Pack',
        price: 500,
        minItems: 4,
        maxItems: 6,
        possibleItems: [
          {
            id: 'steel-sword',
            name: 'Steel Sword',
            value: 300,
            rarity: 'uncommon',
            dropChance: 30,
          },
          {
            id: 'magic-staff',
            name: 'Magic Staff',
            value: 600,
            rarity: 'rare',
            dropChance: 25,
          },
          {
            id: 'dragon-scale',
            name: 'Dragon Scale',
            value: 1000,
            rarity: 'epic',
            dropChance: 10,
          },
          {
            id: 'legendary-gem',
            name: 'Legendary Gem',
            value: 2500,
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
      this.coins = 500
      console.log('Game initialized!')
    },

    buyPack(packId: string) {
      const pack = this.availablePacks.find(p => p.id === packId)
      if (!pack) return false
      if (this.coins < pack.price) return false

      this.coins -= pack.price
      this.ownedPacks.push(pack)
      return true
    },

    openPack(packId: string) {
      const packIndex = this.ownedPacks.findIndex(p => p.id === packId)
      if (packIndex === -1) return false

      // Remove the pack from inventory
      const pack = this.ownedPacks.splice(packIndex, 1)[0]

      // Generate random items
      const numItems = Math.floor(Math.random() * (pack.maxItems - pack.minItems + 1)) + pack.minItems

      const items: Item[] = []
      for (let i = 0; i < numItems; i++) {
        const item = this.generateItemFromPack(pack)
        if (item) items.push(item)
      }

      // Add items to inventory (with stacking)
      items.forEach(item => this.addItemToInventory(item))
      return items
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
      const totalValue = item.value * amount

      // Update inventory
      item.amount -= amount
      if (item.amount <= 0) {
        const index = this.inventory.indexOf(item)
        this.inventory.splice(index, 1)
      }

      // Add coins
      this.coins += totalValue
      return true
    },
  },

  getters: {
    isReady: state => state.isInitialized,
    canBuyPack: state => (packId: string) => {
      const pack = state.availablePacks.find(p => p.id === packId)
      return pack ? state.coins >= pack.price : false
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
