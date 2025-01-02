<template>
  <div class="flex flex-col items-center min-h-screen p-4 gap-6">
    <header class="w-full max-w-4xl mb-6">
      <h1 class="text-3xl font-bold mb-2">Idle Pack Opening Game</h1>
      <div class="text-xl">
        Coins: {{ store.formattedCoins }}
      </div>
    </header>

    <!-- Game Content -->
    <div class="w-full max-w-4xl p-4">
      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-4">
          <button @click="activeTab = 'packs'" class="py-2 px-1 -mb-px" :class="[
            activeTab === 'packs'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Packs
          </button>
          <button @click="activeTab = 'inventory'" class="py-2 px-1 -mb-px" :class="[
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]">
            Inventory
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'packs'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Shop -->
        <div>
          <h2 class="text-2xl mb-4">Shop</h2>
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
          <h2 class="text-2xl mb-4">Your Packs</h2>
          <div class="grid gap-4 min-h-[200px]">
            <div v-for="pack in store.ownedPacks" :key="pack.id" class="border p-4 rounded-lg">
              <h3 class="font-bold">{{ pack.name }}</h3>
              <p>Amount: {{ pack.amount }}</p>
              <div class="flex gap-2 mt-2">
                <button @click="store.openPack(pack.id, 1)" class="flex-1 px-4 py-2 bg-green-500 text-white rounded">
                  Open 1
                </button>
                <button v-if="pack.amount > 1" @click="store.openPack(pack.id, pack.amount)"
                  class="flex-1 px-4 py-2 bg-green-700 text-white rounded">
                  Open All
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
      <div v-else-if="activeTab === 'inventory'" class="grid grid-cols-3 gap-4">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { ref, reactive } from 'vue'
import BigNumber from 'bignumber.js'

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

// Initialize the game when the component is mounted
store.initApp()
</script>