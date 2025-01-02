import { acceptHMRUpdate, defineStore } from 'pinia'

interface Item {
  id: string
  name: string
  value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

interface Pack {
  id: string
  name: string
  price: number
  minItems: number
  maxItems: number
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
      },
      {
        id: 'premium-pack',
        name: 'Premium Pack',
        price: 500,
        minItems: 4,
        maxItems: 6,
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

      // Generate random items (simplified version)
      const numItems = Math.floor(Math.random() * (pack.maxItems - pack.minItems + 1)) + pack.minItems

      const items: Item[] = []
      for (let i = 0; i < numItems; i++) {
        items.push(this.generateRandomItem())
      }

      this.inventory.push(...items)
      return items
    },

    sellItem(itemId: string) {
      const itemIndex = this.inventory.findIndex(i => i.id === itemId)
      if (itemIndex === -1) return false

      const item = this.inventory[itemIndex]
      this.inventory.splice(itemIndex, 1)
      this.coins += item.value
      return true
    },

    generateRandomItem(): Item {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
      const rarity = rarities[Math.floor(Math.random() * rarities.length)]

      // Base value multiplied by rarity factor
      const rarityMultiplier = {
        common: 1,
        uncommon: 2,
        rare: 5,
        epic: 10,
        legendary: 25,
      }

      return {
        id: crypto.randomUUID(),
        name: `${rarity} Item`, // You can add proper name generation later
        value: Math.floor(Math.random() * 50 + 50) * rarityMultiplier[rarity],
        rarity,
      }
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
