<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Collection</h2>
            <div class="text-lg">
                Progress: {{ discoveredCount }}/{{ totalItems }}
                ({{ Math.round(discoveredCount / totalItems * 100) }}%)
            </div>
        </div>

        <div class="space-y-8">
            <!-- Group items by rarity -->
            <div v-for="rarity in rarities" :key="rarity" class="space-y-4">
                <h3 class="text-xl font-semibold capitalize" :class="{
                    'text-gray-600': rarity === 'common',
                    'text-green-600': rarity === 'uncommon',
                    'text-blue-600': rarity === 'rare',
                    'text-purple-600': rarity === 'epic',
                    'text-yellow-600': rarity === 'legendary',
                }">
                    {{ rarity }}
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="item in getItemsByRarity(rarity)" :key="item.id" class="border p-4 rounded-lg" :class="{
                        'opacity-40': !isDiscovered(item.id),
                        'border-gray-300': rarity === 'common',
                        'border-green-400': rarity === 'uncommon',
                        'border-blue-400': rarity === 'rare',
                        'border-purple-400': rarity === 'epic',
                        'border-yellow-400': rarity === 'legendary',
                    }">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold">
                                    {{ isDiscovered(item.id) ? item.name : '???' }}
                                </h4>
                                <p class="text-sm text-gray-600">
                                    {{ isDiscovered(item.id) ? `+${formatNumber(new
                                        BigNumber(item.coinsPerMinute))}/min` : 'Undiscovered' }}
                                </p>
                            </div>
                            <div class="text-right text-sm">
                                <p>Value: {{ isDiscovered(item.id) ? formatNumber(new BigNumber(item.value)) : '???' }}
                                </p>
                            </div>
                        </div>

                        <div v-if="isDiscovered(item.id)" class="mt-2 text-sm text-gray-500">
                            Found in: {{ getItemSource(item.id) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'
import { itemManager } from '../managers/itemManager'
import { formatNumber } from '../utils/format'
import BigNumber from 'bignumber.js'

const store = useStore()

const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary']

// Get all items grouped by rarity
const getItemsByRarity = (rarity: string) => {
    return Array.from(itemManager.getAllItems().values())
        .filter(item => item.rarity === rarity)
}

// Check if an item has been discovered
const isDiscovered = (itemId: string) => {
    return store.discoveredItems.has(itemId)
}

// Get the source pack for an item
const getItemSource = (itemId: string) => {
    const pack = store.availablePacks.find(p =>
        p.possibleItems.some(i => i.itemId === itemId)
    )
    return pack ? pack.name : 'Unknown'
}

// Compute total and discovered counts
const totalItems = computed(() => itemManager.getAllItems().size)
const discoveredCount = computed(() => store.discoveredItems.size)
</script>