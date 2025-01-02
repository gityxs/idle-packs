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

      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-end">
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
          <button @click="activeTab = 'generators'" class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
            activeTab === 'generators'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Generators
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'packs'" class="grid grid-cols-1 gap-6">
        <!-- Left Column: Shop -->
        <div>
          <h2 class="text-xl sm:text-2xl mb-4">Shop</h2>
          <div class="grid gap-4">
            <div v-for="pack in store.availablePacks" :key="pack.id" class="border p-4 rounded-lg min-w-[200px]">
              <h3 class="font-bold">{{ pack.name }}</h3>
              <p>Price: {{ formatNumber(pack.price) }} coins</p>
              <p>Items: {{ pack.minItems }}-{{ pack.maxItems }}</p>

              <!-- Add buy controls -->
              <div class="flex items-center gap-2 mt-2">
                <input type="number" v-model="buyAmounts[pack.id]" min="1" :max="store.getMaxBuyable(pack.id)"
                  class="w-20 px-2 py-1 border rounded">
                <div class="flex-1 flex gap-1">
                  <button @click="buyPack(pack.id, 1)" :disabled="!store.canBuyPack(pack.id)"
                    class="flex-1 px-2 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50">
                    Buy 1
                  </button>
                  <button @click="buyPack(pack.id, buyAmounts[pack.id])" :disabled="!canBuyAmount(pack.id)"
                    class="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50">
                    Buy X
                  </button>
                  <button @click="buyMax(pack.id)" :disabled="!store.canBuyPack(pack.id)"
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
          <h2 class="text-xl sm:text-2xl mb-4">Your Packs</h2>
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
      <div v-else-if="activeTab === 'inventory'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="item in store.inventory" :key="item.id" class="border p-4 rounded-lg" :class="{
          'border-gray-300': item.rarity === 'common',
          'border-green-400': item.rarity === 'uncommon',
          'border-blue-400': item.rarity === 'rare',
          'border-purple-400': item.rarity === 'epic',
          'border-yellow-400': item.rarity === 'legendary',
        }">
          <h3 class="font-bold">{{ item.name }}</h3>
          <p>Amount: {{ item.amount }}</p>
          <p>Value: {{ formatNumber(item.value) }} coins each</p>
          <p class="capitalize">Rarity: {{ item.rarity }}</p>
          <div class="flex gap-2 mt-2">
            <button @click="store.sellItem(item.id, 1)" class="flex-1 px-4 py-2 bg-red-500 text-white rounded">
              Sell 1
            </button>
            <button v-if="item.amount > 1" @click="store.sellItem(item.id, item.amount)"
              class="flex-1 px-4 py-2 bg-red-700 text-white rounded">
              Sell All
            </button>
          </div>
        </div>
        <div v-if="!store.inventory.length" class="text-gray-500 text-center p-4 border rounded-lg">
          No items in inventory
        </div>
      </div>

      <!-- Generators Tab -->
      <div v-else-if="activeTab === 'generators'">
        <Generators />
      </div>
    </div>

    <PackOpeningModal v-if="openingItems.length > 0" :show="true" :items="openingItems" :pack-name="openingPackName"
      :pack-price="openingPackPrice" :format-number="formatNumber" :show-animations="store.settings.showAnimations"
      :has-more-packs="hasMorePacksToOpen" :remaining-packs="remainingPacksToOpen" @close="finishOpening"
      @open-another="openAnotherPack" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { ref, reactive, computed } from 'vue'
import BigNumber from 'bignumber.js'
import PackOpeningModal from '../components/PackOpeningModal.vue'
import Generators from '../components/Generators.vue'

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

// Add these constants
const MAX_PACKS_PER_OPEN = 1000

// Update the pack opening logic
const handleOpenPack = (packId: string, amount: number) => {
  const pack = store.ownedPacks.find(p => p.id === packId)
  if (!pack) return

  currentOpeningPackId.value = packId
  const items = store.openPack(packId, amount)
  if (items) {
    openingItems.value = items
    openingPackName.value = pack.name
    const originalPack = store.availablePacks.find(p => p.id === packId)
    // Calculate price based on actual number of packs opened
    const actualPacksOpened = Math.min(amount, MAX_PACKS_PER_OPEN)
    openingPackPrice.value = (originalPack?.price ?? 0) * actualPacksOpened
  }
}

// Check if there are more packs to open
const hasMorePacksToOpen = computed(() => false)

// Handle opening another pack
const openAnotherPack = () => {
  handleOpenPack(currentOpeningPackId.value, 1)
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

// Initialize the game when the component is mounted
store.initApp()
</script>