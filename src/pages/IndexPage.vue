<template>
  <div class="flex flex-col items-center min-h-screen gap-6 p-4 dark:bg-gray-900 dark:text-gray-100">
    <header class="w-full max-w-4xl mb-6">
      <div class="flex flex-col items-start justify-between mb-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="mb-2 text-2xl font-bold sm:text-3xl dark:text-white">Idle Pack Opening Game</h1>
          <div class="text-lg sm:text-xl dark:text-gray-300">
            Coins: {{ store.formattedCoins }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
        <SaveLoadMenu />

        <div class="flex gap-3">
          <button v-if="store.inventory.length > 0" @click="sellAllItems"
            class="flex items-center justify-center w-full gap-2 px-4 py-2 text-white bg-red-500 rounded-lg sm:w-auto hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
            <span>
              Sell All{{ lockedItemsCount ? ` (${unlockedItemsCount}/${store.inventory.length})` : '' }}
              ({{ formatNumber(totalInventoryValue) }})
            </span>
          </button>

          <label class="flex items-center gap-2 cursor-pointer dark:text-gray-300">
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
      <div class="mb-6 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-4 min-w-max">
          <button @click="activeTab = 'packs'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'packs'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Packs
          </button>
          <button @click="activeTab = 'inventory'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Inventory
          </button>
          <button @click="activeTab = 'upgrades'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'upgrades'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Upgrades
          </button>
          <button @click="activeTab = 'bosses'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'bosses'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Boss Fights
          </button>
          <button @click="activeTab = 'collection'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'collection'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : store.hasOpenedFirstPack
                ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                : 'text-gray-300 cursor-not-allowed dark:text-gray-600 dark:hover:text-gray-200'
          ]" :disabled="!store.hasOpenedFirstPack">
            Collection
            <span v-if="!store.hasOpenedFirstPack" class="ml-1 text-xs">(Open a pack first)</span>
          </button>
          <button @click="activeTab = 'achievements'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'achievements'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Achievements
          </button>
          <button @click="activeTab = 'settings'" class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
            activeTab === 'settings'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            Settings
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'packs'" class="grid grid-cols-1 gap-6">
        <!-- Left Column: Shop -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl sm:text-2xl dark:text-white">Shop</h2>
            <div v-if="store.hasAutoBuyer" class="flex items-center gap-2">
              <label class="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                <input type="checkbox" :checked="store.settings.autoBuyPacks" @change="store.toggleAutoBuy()"
                  class="w-4 h-4">
                <span class="text-sm">Auto Buy Packs</span>
              </label>
            </div>
          </div>
          <div class="grid gap-4">
            <div v-for="pack in store.availablePacks" :key="pack.id"
              class="border p-4 rounded-lg min-w-[200px] dark:border-gray-700 dark:bg-gray-800">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold">{{ pack.name }}</h3>
                <button @click="selectedPack = pack" class="text-sm text-blue-500 underline hover:text-blue-600">
                  Details
                </button>
              </div>
              <p>Price: {{ formatNumber(pack.price) }} coins</p>
              <p>Items: {{ pack.minItems }}-{{ pack.maxItems }}</p>

              <!-- Add purchase limit info -->
              <div v-if="pack.purchaseLimit" class="mt-2 text-sm">
                <p class="text-gray-600">
                  Limit: {{ pack.purchaseLimit.remainingPurchases }}/{{ pack.purchaseLimit.amount }}
                  per {{ formatTime(pack.purchaseLimit.minutes * 60 * 1000) }}
                </p>
                <p v-if="pack.purchaseLimit.remainingPurchases < pack.purchaseLimit.amount" class="text-blue-600">
                  Resets in {{ formatTime(store.getPackTimeRemaining(pack.id)) }}
                </p>
              </div>

              <!-- Add auto-buy toggle -->
              <div v-if="pack.hasAutoBuyer" class="flex items-center gap-2 mt-2">
                <label class="flex items-center gap-2 cursor-pointer dark:text-gray-300" @click.stop>
                  <input type="checkbox" :checked="pack.autoBuyEnabled" @change="store.toggleAutoBuy(pack.id)"
                    class="w-4 h-4">
                  <span class="text-sm">Auto Buy</span>
                </label>
              </div>

              <!-- Add buy controls -->
              <div class="flex items-center gap-2 mt-2">
                <input type="number" v-model="buyAmounts[pack.id]" min="1" :max="store.getMaxBuyable(pack.id)"
                  class="w-20 px-2 py-1 text-sm bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  @click.stop>
                <div class="flex flex-1 gap-1">
                  <button @click.stop="buyPack(pack.id, 1)" :disabled="!store.canBuyPack(pack.id)"
                    class="flex-1 px-2 py-1 text-sm text-white bg-blue-500 rounded disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Buy 1
                  </button>
                  <button @click.stop="buyPack(pack.id, buyAmounts[pack.id])" :disabled="!canBuyAmount(pack.id)"
                    class="flex-1 px-2 py-1 text-sm text-white bg-blue-600 rounded disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Buy X
                  </button>
                  <button @click.stop="buyMax(pack.id)" :disabled="!store.canBuyPack(pack.id)"
                    class="flex-1 px-2 py-1 text-sm text-white bg-blue-700 rounded disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-900">
                    Max
                  </button>
                </div>
              </div>

              <!-- Show total cost when buying multiple -->
              <div v-if="buyAmounts[pack.id] > 1" class="mt-1 text-sm text-gray-600">
                Total: {{ formatNumber(new BigNumber(pack.price).times(buyAmounts[pack.id])) }} coins
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Owned Packs -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="mb-4 text-xl sm:text-2xl dark:text-white">Your Packs</h2>
            <div class="text-sm text-gray-600">
              Pack Storage: {{ store.packStorageUsed }}/{{ store.maxPackStorage }}
            </div>
          </div>
          <div class="grid gap-4 min-h-[200px]">
            <div v-for="pack in store.ownedPacks" :key="pack.id" class="p-4 border rounded-lg">
              <h3 class="font-bold">{{ pack.name }}</h3>
              <p>Amount: {{ pack.amount }}</p>
              <div class="flex gap-2 mt-2">
                <button @click="handleOpenPack(pack.id, 1)" class="flex-1 px-4 py-2 text-white bg-green-500 rounded">
                  Open 1
                </button>
                <button v-if="pack.amount > 1" @click="handleOpenPack(pack.id, pack.amount)"
                  class="relative flex-1 px-4 py-2 text-white bg-green-700 rounded group">
                  Open All
                  <span v-if="pack.amount > MAX_PACKS_PER_OPEN"
                    class="absolute px-2 py-1 mb-2 text-xs text-white transition -translate-x-1/2 bg-black rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                    Will open {{ MAX_PACKS_PER_OPEN }} packs maximum
                  </span>
                </button>
              </div>
            </div>
            <div v-if="!store.ownedPacks.length" class="p-4 text-center text-gray-500 border rounded-lg">
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
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl sm:text-2xl dark:text-white">Inventory</h2>
          <div class="flex items-center gap-4">
            <!-- Type Filter -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Filter:</label>
              <select v-model="inventoryFilter"
                class="px-2 py-1 text-sm bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <option value="all">All Types</option>
                <option value="combat">Combat Items</option>
                <option v-for="type in availableTypes" :key="type" :value="type">
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </option>
              </select>
            </div>

            <!-- Existing Sort Controls -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Sort by:</label>
              <select v-model="inventorySort"
                class="px-2 py-1 text-sm bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
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
        </div>

        <!-- Update the inventory grid to use sorted items -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="item in sortedInventory" :key="item.id" class="flex flex-col p-4 border rounded-lg" :class="{
            'border-gray-300': item.rarity === 'common',
            'border-green-400': item.rarity === 'uncommon',
            'border-blue-400': item.rarity === 'rare',
            'border-purple-400': item.rarity === 'epic',
            'border-yellow-400': item.rarity === 'legendary',
          }">
            <!-- Item Header -->
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold">{{ item.name }}</h3>
              <div class="text-sm text-right">
                <div>Amount: {{ item.amount }}</div>
                <div>Value: {{ formatNumber(item.value) }}</div>
              </div>
            </div>

            <!-- Item Info -->
            <div class="flex-grow space-y-2">
              <!-- Rarity and Types -->
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm capitalize" :class="{
                  'text-gray-600': item.rarity === 'common',
                  'text-green-600': item.rarity === 'uncommon',
                  'text-blue-600': item.rarity === 'rare',
                  'text-purple-600': item.rarity === 'epic',
                  'text-yellow-600': item.rarity === 'legendary',
                }">
                  {{ item.rarity }}
                </span>
                <div class="flex flex-wrap gap-1">
                  <TypeChip v-for="type in itemManager.getItem(item.id)?.types" :key="type" :type="type" />
                </div>
                <span class="text-sm text-gray-500">• {{ getItemSlot(item.id) }}</span>
              </div>

              <!-- Combat Stats -->
              <div v-if="itemManager.getItem(item.id)?.combatStats"
                class="grid grid-cols-3 gap-2 p-2 text-sm rounded bg-gray-50">
                <div class="text-center">
                  <div class="font-bold text-red-600">
                    {{ itemManager.getItem(item.id)?.combatStats?.attack }}
                  </div>
                  <div class="text-xs text-gray-600">Attack</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-blue-600">
                    {{ itemManager.getItem(item.id)?.combatStats?.defense }}
                  </div>
                  <div class="text-xs text-gray-600">Defense</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-green-600">
                    {{ itemManager.getItem(item.id)?.combatStats?.health }}
                  </div>
                  <div class="text-xs text-gray-600">Health</div>
                </div>
              </div>

              <!-- Production -->
              <div class="text-sm text-green-600">
                +{{ formatNumber(getItemProduction(item.id)) }}/min
              </div>

              <!-- Synergy Info -->
              <SynergyInfo v-if="itemManager.getItem(item.id)" :item="itemManager.getItem(item.id)!" />
            </div>

            <!-- Actions -->
            <div class="mt-4 space-y-2">
              <div class="flex gap-2">
                <button @click="store.sellItem(item.id, 1)"
                  class="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                  Sell 1
                </button>
                <button v-if="item.amount > 1" @click="store.sellItem(item.id, item.amount)"
                  class="flex-1 px-3 py-1.5 bg-red-700 text-white text-sm rounded hover:bg-red-800">
                  Sell All
                </button>
                <button @click="store.equipItem(item.id)" :disabled="store.equippedItems.length >= store.maxEquippedItems ||
                  store.equippedItems.some(equipped => equipped.id === item.id)" class="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 
                         disabled:opacity-50 disabled:hover:bg-blue-500">
                  {{ store.equippedItems.length >= store.maxEquippedItems
                    ? 'No Slots'
                    : store.equippedItems.some(equipped => equipped.id === item.id)
                      ? 'Already Equipped'
                      : 'Equip'
                  }}
                </button>
              </div>

              <!-- Lock Toggle -->
              <label class="flex items-center justify-end gap-2 cursor-pointer select-none">
                <input type="checkbox" :checked="item.locked" @change="store.toggleItemLock(item.id)"
                  class="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500">
                <span class="text-sm text-gray-600">Lock Item</span>
              </label>
            </div>
          </div>
          <div v-if="!store.inventory.length" class="p-4 text-center text-gray-500 border rounded-lg">
            No items in inventory
          </div>
        </div>
      </div>

      <!-- Add new tab content -->
      <div v-else-if="activeTab === 'upgrades'">
        <Upgrades />
      </div>

      <!-- Update the tab content section to prevent showing collection when disabled -->
      <div v-else-if="activeTab === 'collection' && store.hasOpenedFirstPack">
        <Collection :format-number="formatNumber" />
      </div>

      <!-- Add tab content -->
      <div v-else-if="activeTab === 'achievements'">
        <Achievements :format-number="formatNumber" />
      </div>

      <!-- Add settings tab content -->
      <div v-else-if="activeTab === 'settings'">
        <Settings />
      </div>

      <!-- Add boss fights tab content -->
      <div v-show="activeTab === 'bosses'">
        <BossFights />
      </div>
    </div>

    <PackOpeningModal v-if="openingItems.length > 0" :show="true" :items="openingItems" :pack-name="openingPackName"
      :pack-price="openingPackPrice" :format-number="formatNumber" :show-animations="store.settings.showAnimations"
      :has-more-packs="hasMorePacksToOpen" :remaining-packs="remainingPacksToOpen" @close="finishOpening"
      @open-another="openAnotherPack" />

    <PackDetailsModal v-if="selectedPack" :pack="selectedPack" @close="selectedPack = null" />

    <Footer />
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
import SynergyInfo from '../components/SynergyInfo.vue'
import TypeChip from '../components/TypeChip.vue'
import Achievements from '../components/Achievements.vue'
import Settings from '../components/Settings.vue'
import BossFights from '../components/BossFights.vue'
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
  return store.inventory
    .filter(item => !item.locked)
    .reduce((total, item) => {
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
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  if (days > 0) {
    return `${days}d ${remainingHours}h ${remainingMinutes}m`
  } else if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
  } else {
    return `${minutes}m ${remainingSeconds}s`
  }
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
  let items = [...store.inventory]

  // Apply filter first
  if (inventoryFilter.value !== 'all') {
    items = items.filter(item => {
      const definition = itemManager.getItem(item.id)
      if (inventoryFilter.value === 'combat') {
        return definition?.combatStats !== undefined
      }
      return definition?.types?.includes(inventoryFilter.value as ItemType)
    })
  }

  // Then apply sort
  items.sort((a, b) => {
    let comparison = 0

    switch (inventorySort.value) {
      case 'rarity':
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary']
        comparison = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
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

const lockedItemsCount = computed(() => store.inventory.filter(i => i.locked).length)
const unlockedItemsCount = computed(() => store.inventory.length - lockedItemsCount.value)

const inventoryFilter = ref('all')

// Get all available item types
const availableTypes = computed(() => {
  const types = new Set<string>()
  store.inventory.forEach(item => {
    const definition = itemManager.getItem(item.id)
    definition?.types?.forEach(type => types.add(type))
  })
  return Array.from(types).sort()
})
</script>