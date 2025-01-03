<template>
  <div class="flex flex-col items-center min-h-screen p-4 gap-6">
    <header class="w-full max-w-4xl mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold mb-2">Idle Pack Opening Game</h1>
          <div class="text-lg sm:text-xl">
            Coins: {{ store.formattedCoins }}
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <SaveLoadMenu />

        <div class="flex gap-3">
          <button v-if="store.inventory.length > 0" @click="sellAllItems"
            class="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2">
            <span>Sell All ({{ formatNumber(totalInventoryValue) }})</span>
          </button>

          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="store.settings.showAnimations" @change="store.toggleAnimations"
              class="w-4 h-4">
            <span class="text-sm">Show Animations</span>
          </label>
        </div>
      </div>
    </header>

    <!-- Game Content -->
    <div class="w-full max-w-4xl p-4">
      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav class="flex gap-4 min-w-max">
          <button @click="activeTab = 'packs'" class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
            activeTab === 'packs'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Packs
          </button>
          <button @click="activeTab = 'inventory'" class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Inventory
          </button>
          <button @click="activeTab = 'upgrades'" class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
            activeTab === 'upgrades'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Upgrades
          </button>
          <button @click="activeTab = 'collection'" class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
            activeTab === 'collection'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Collection
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'packs'" class="grid grid-cols-1 gap-6">
        <!-- Left Column: Shop -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl sm:text-2xl">Shop</h2>
            <div v-if="store.hasAutoBuyer" class="flex items-center gap-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="store.settings.autoBuyPacks" @change="store.toggleAutoBuy()"
                  class="w-4 h-4">
                <span class="text-sm">Auto Buy Packs</span>
              </label>
            </div>
          </div>
          <div class="grid gap-4">
            <div v-for="pack in store.availablePacks" :key="pack.id"
              class="border p-4 rounded-lg min-w-[200px] cursor-pointer hover:bg-gray-50"
              @click.prevent="selectedPack = pack">
              <h3 class="font-bold">{{ pack.name }}</h3>
              <p>Price: {{ formatNumber(pack.price) }} coins</p>
              <p>Items: {{ pack.minItems }}-{{ pack.maxItems }}</p>

              <!-- Add purchase limit info -->
              <div v-if="pack.purchaseLimit" class="mt-2 text-sm">
                <p class="text-gray-600">
                  Limit: {{ pack.purchaseLimit.remainingPurchases }}/{{ pack.purchaseLimit.amount }}
                  per {{ pack.purchaseLimit.minutes }} minutes
                </p>
                <p v-if="pack.purchaseLimit.remainingPurchases < pack.purchaseLimit.amount" class="text-blue-600">
                  Resets in {{ formatTime(store.getPackTimeRemaining(pack.id)) }}
                </p>
              </div>

              <!-- Add auto-buy toggle -->
              <div v-if="pack.hasAutoBuyer" class="mt-2 flex items-center gap-2">
                <label class="flex items-center gap-2 cursor-pointer" @click.stop>
                  <input type="checkbox" :checked="pack.autoBuyEnabled" @change="store.toggleAutoBuy(pack.id)"
                    class="w-4 h-4">
                  <span class="text-sm">Auto Buy</span>
                </label>
              </div>

              <!-- Add buy controls -->
              <div class="flex items-center gap-2 mt-2">
                <input type="number" v-model="buyAmounts[pack.id]" min="1" :max="store.getMaxBuyable(pack.id)"
                  class="w-20 px-2 py-1 border rounded" @click.stop>
                <div class="flex-1 flex gap-1">
                  <button @click.stop="buyPack(pack.id, 1)" :disabled="!store.canBuyPack(pack.id)"
                    class="flex-1 px-2 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50">
                    Buy 1
                  </button>
                  <button @click.stop="buyPack(pack.id, buyAmounts[pack.id])" :disabled="!canBuyAmount(pack.id)"
                    class="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50">
                    Buy X
                  </button>
                  <button @click.stop="buyMax(pack.id)" :disabled="!store.canBuyPack(pack.id)"
                    class="flex-1 px-2 py-1 bg-blue-700 text-white text-sm rounded disabled:opacity-50">
                    Max
                  </button>
                </div>
              </div>

              <!-- Show total cost when buying multiple -->
              <div v-if="buyAmounts[pack.id] > 1" class="text-sm text-gray-600 mt-1">
                Total: {{ formatNumber(new BigNumber(pack.price).times(buyAmounts[pack.id])) }} coins
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Owned Packs -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl sm:text-2xl mb-4">Your Packs</h2>
            <div class="text-sm text-gray-600">
              Pack Storage: {{ store.packStorageUsed }}/{{ store.maxPackStorage }}
            </div>
          </div>
          <div class="grid gap-4 min-h-[200px]">
            <div v-for="pack in store.ownedPacks" :key="pack.id" class="border p-4 rounded-lg">
              <h3 class="font-bold">{{ pack.name }}</h3>
              <p>Amount: {{ pack.amount }}</p>
              <div class="flex gap-2 mt-2">
                <button @click="handleOpenPack(pack.id, 1)" class="flex-1 px-4 py-2 bg-green-500 text-white rounded">
                  Open 1
                </button>
                <button v-if="pack.amount > 1" @click="handleOpenPack(pack.id, pack.amount)"
                  class="flex-1 px-4 py-2 bg-green-700 text-white rounded group relative">
                  Open All
                  <span v-if="pack.amount > MAX_PACKS_PER_OPEN" class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded
                      opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Will open {{ MAX_PACKS_PER_OPEN }} packs maximum
                  </span>
                </button>
              </div>
            </div>
            <div v-if="!store.ownedPacks.length" class="text-gray-500 text-center p-4 border rounded-lg">
              No packs owned
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Tab -->
      <div v-else-if="activeTab === 'inventory'" class="space-y-6">
        <!-- Add Equipment Section -->
        <EquippedItems />

        <!-- Add a divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Add sorting controls above the inventory grid -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl sm:text-2xl">Inventory</h2>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Sort by:</label>
            <select v-model="inventorySort" class="px-2 py-1 border rounded text-sm bg-white">
              <option value="rarity">Rarity</option>
              <option value="production">Production</option>
              <option value="value">Value</option>
            </select>
            <button @click="inventorySortDir = inventorySortDir === 'asc' ? 'desc' : 'asc'"
              class="p-1 rounded hover:bg-gray-100">
              <span class="text-gray-600">
                {{ inventorySortDir === 'asc' ? '↑' : '↓' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Update the inventory grid to use sorted items -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in sortedInventory" :key="item.id" class="border p-4 rounded-lg" :class="{
            'border-gray-300': item.rarity === 'common',
            'border-green-400': item.rarity === 'uncommon',
            'border-blue-400': item.rarity === 'rare',
            'border-purple-400': item.rarity === 'epic',
            'border-yellow-400': item.rarity === 'legendary',
          }">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-bold">{{ item.name }}</h3>
                <div class="flex items-center gap-2">
                  <p class="text-sm capitalize" :class="{
                    'text-gray-600': item.rarity === 'common',
                    'text-green-600': item.rarity === 'uncommon',
                    'text-blue-600': item.rarity === 'rare',
                    'text-purple-600': item.rarity === 'epic',
                    'text-yellow-600': item.rarity === 'legendary',
                  }">
                    {{ item.rarity }}
                  </p>
                  <span class="text-sm text-gray-500">
                    • {{ getItemSlot(item.id) }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p>Amount: {{ item.amount }}</p>
                <p>Value: {{ formatNumber(item.value) }} coins each</p>
              </div>
            </div>

            <p class="text-green-600 mb-2">+{{ formatNumber(getItemProduction(item.id)) }}/min</p>

            <div class="flex gap-2">
              <button @click="store.sellItem(item.id, 1)"
                class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Sell 1
              </button>
              <button v-if="item.amount > 1" @click="store.sellItem(item.id, item.amount)"
                class="flex-1 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-700">
                Sell All
              </button>
              <button @click="store.equipItem(item.id)" :disabled="store.equippedItems.length >= store.maxEquippedItems"
                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500">
                {{ store.equippedItems.length >= store.maxEquippedItems ? 'No Slots' : 'Equip' }}
              </button>
            </div>
          </div>
          <div v-if="!store.inventory.length" class="text-gray-500 text-center p-4 border rounded-lg">
            No items in inventory
          </div>
        </div>
      </div>

      <!-- Add new tab content -->
      <div v-else-if="activeTab === 'upgrades'">
        <Upgrades />
      </div>

      <!-- Add new tab content -->
      <div v-else-if="activeTab === 'collection'">
        <Collection />
      </div>
    </div>

    <!-- Add footer at the bottom -->
    <Footer />

    <!-- Keep modals outside the main layout -->
    <PackOpeningModal v-if="openingItems.length" :items="openingItems" :pack-name="openingPackName"
      :pack-price="openingPackPrice" :has-more-packs="hasMorePacksToOpen" :remaining-packs="remainingPacksToOpen"
      @close="finishOpening" @open-another="openAnotherPack" />

    <PackDetailsModal v-if="selectedPack" :pack="selectedPack" @close="selectedPack = null" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { ref, reactive, computed } from 'vue'
import BigNumber from 'bignumber.js'
import PackOpeningModal from '../components/PackOpeningModal.vue'
import EquippedItems from '../components/EquippedItems.vue'
import { itemManager } from '../managers/itemManager'
import Upgrades from '../components/Upgrades.vue'
import Collection from '../components/Collection.vue'
import PackDetailsModal from '../components/PackDetailsModal.vue'
import SaveLoadMenu from '../components/SaveLoadMenu.vue'
import Footer from '../components/Footer.vue'
const MAX_PACKS_PER_OPEN = 1000
const store = useStore()
const activeTab = ref('packs')

// Track buy amounts for each pack
const buyAmounts = reactive<Record<string, number>>(
  Object.fromEntries(store.availablePacks.map(pack => [pack.id, 1]))
)

// Helper functions for buying packs
const buyPack = (packId: string, amount: number) => {
  if (store.buyPack(packId, amount)) {
    // Reset amount to 1 after successful purchase
    buyAmounts[packId] = 1
  }
}

const buyMax = (packId: string) => {
  const maxAmount = store.getMaxBuyable(packId)
  if (maxAmount > 0) {
    buyPack(packId, maxAmount)
  }
}

const canBuyAmount = (packId: string) => {
  const pack = store.availablePacks.find(p => p.id === packId)
  if (!pack) return false

  const amount = buyAmounts[packId]
  if (!amount || amount < 1) return false

  const totalCost = new BigNumber(pack.price).times(amount)
  return store.coins.isGreaterThanOrEqualTo(totalCost)
}

// Update the format function in the component
const formatNumber = (num: BigNumber | number) => {
  // Don't use store.formattedCoins for all BigNumbers
  const n = num instanceof BigNumber ? num : new BigNumber(num)

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

const openingItems = ref<Item[]>([])
const openingPackName = ref('')
const openingPackPrice = ref(0)

const currentOpeningPackId = ref('')
const remainingPacksToOpen = ref(0)

// Update the hasMorePacksToOpen computed property
const hasMorePacksToOpen = computed(() => {
  const pack = store.ownedPacks.find(p => p.id === currentOpeningPackId.value)
  return pack ? pack.amount > 0 : false
})

// Update handleOpenPack to handle remaining packs
const handleOpenPack = (packId: string, amount: number) => {
  const pack = store.ownedPacks.find(p => p.id === packId)
  if (!pack) return

  currentOpeningPackId.value = packId
  const actualPacksOpened = Math.min(amount, MAX_PACKS_PER_OPEN)
  const items = store.openPack(packId, actualPacksOpened)

  if (items) {
    openingItems.value = items
    openingPackName.value = pack.name
    const originalPack = store.availablePacks.find(p => p.id === packId)
    openingPackPrice.value = (originalPack?.price ?? 0) * actualPacksOpened
  }
}

// Update openAnotherPack to handle remaining packs
const openAnotherPack = () => {
  store.addItemsToInventory(openingItems.value)
  const pack = store.ownedPacks.find(p => p.id === currentOpeningPackId.value)
  if (pack && pack.amount > 0) {
    handleOpenPack(currentOpeningPackId.value, 1)
  }
}

const finishOpening = () => {
  store.addItemsToInventory(openingItems.value)
  openingItems.value = []
  openingPackName.value = ''
  openingPackPrice.value = 0
  currentOpeningPackId.value = ''
  remainingPacksToOpen.value = 0 // Reset remaining packs
}

// Add computed for total inventory value
const totalInventoryValue = computed(() => {
  return store.inventory.reduce((total, item) => {
    return total.plus(item.value.times(item.amount))
  }, new BigNumber(0))
})

// Add sell all function
const sellAllItems = () => {
  if (!store.inventory.length) return
  store.sellAllItems()
}

const getItemProduction = (itemId: string) => {
  const definition = itemManager.getItem(itemId)
  return definition ? new BigNumber(definition.coinsPerMinute) : new BigNumber(0)
}

const getItemSlot = (itemId: string) => {
  const definition = itemManager.getItem(itemId)
  return definition?.slot ? definition.slot.charAt(0).toUpperCase() + definition.slot.slice(1) : ''
}

const isSlotOccupied = (itemId: string) => {
  const definition = itemManager.getItem(itemId)
  if (!definition) return true
  return store.equippedItems[definition.slot] !== null
}

// Initialize the game when the component is mounted
store.initApp()

// Add helper function for time formatting
const formatTime = (ms: number | null) => {
  if (ms === null) return ''

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Add sorting state
const inventorySort = ref('rarity')
const inventorySortDir = ref('desc')

// Add sorting logic
const rarityOrder = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
}

const sortedInventory = computed(() => {
  const items = [...store.inventory]

  items.sort((a, b) => {
    let comparison = 0

    switch (inventorySort.value) {
      case 'rarity':
        comparison = rarityOrder[b.rarity] - rarityOrder[a.rarity]
        break

      case 'production':
        const prodA = getItemProduction(a.id)
        const prodB = getItemProduction(b.id)
        comparison = prodB.minus(prodA).toNumber()
        break

      case 'value':
        comparison = b.value.minus(a.value).toNumber()
        break
    }

    return inventorySortDir.value === 'asc' ? -comparison : comparison
  })

  return items
})

// Add state for selected pack
const selectedPack = ref(null)
</script>