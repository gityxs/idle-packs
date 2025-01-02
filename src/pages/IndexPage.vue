<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <h1 class="text-3xl font-bold mb-6">Idle Pack Opening Game</h1>

    <div class="text-xl mb-8">
      Coins: {{ store.coins }}
    </div>

    <!-- Available Packs -->
    <div class="mb-8">
      <h2 class="text-2xl mb-4">Shop</h2>
      <div class="flex gap-4">
        <div v-for="pack in store.availablePacks" :key="pack.id" class="border p-4 rounded-lg">
          <h3 class="font-bold">{{ pack.name }}</h3>
          <p>Price: {{ pack.price }} coins</p>
          <p>Items: {{ pack.minItems }}-{{ pack.maxItems }}</p>
          <button @click="store.buyPack(pack.id)" :disabled="!store.canBuyPack(pack.id)"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
            Buy Pack
          </button>
        </div>
      </div>
    </div>

    <!-- Owned Packs -->
    <div class="mb-8">
      <h2 class="text-2xl mb-4">Your Packs</h2>
      <div class="flex gap-4">
        <div v-for="pack in store.ownedPacks" :key="pack.id" class="border p-4 rounded-lg">
          <h3 class="font-bold">{{ pack.name }}</h3>
          <button @click="store.openPack(pack.id)" class="mt-2 px-4 py-2 bg-green-500 text-white rounded">
            Open Pack
          </button>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <div>
      <h2 class="text-2xl mb-4">Inventory</h2>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="item in store.inventory" :key="item.id" class="border p-4 rounded-lg" :class="{
          'border-gray-300': item.rarity === 'common',
          'border-green-400': item.rarity === 'uncommon',
          'border-blue-400': item.rarity === 'rare',
          'border-purple-400': item.rarity === 'epic',
          'border-yellow-400': item.rarity === 'legendary',
        }">
          <h3 class="font-bold">{{ item.name }}</h3>
          <p>Amount: {{ item.amount }}</p>
          <p>Value: {{ item.value }} coins each</p>
          <p class="capitalize">Rarity: {{ item.rarity }}</p>
          <div class="flex gap-2">
            <button @click="store.sellItem(item.id, 1)" class="mt-2 px-4 py-2 bg-red-500 text-white rounded">
              Sell 1
            </button>
            <button v-if="item.amount > 1" @click="store.sellItem(item.id, item.amount)"
              class="mt-2 px-4 py-2 bg-red-700 text-white rounded">
              Sell All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'

const store = useStore()

// Initialize the game when the component is mounted
store.initApp()
</script>