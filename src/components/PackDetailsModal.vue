<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="p-4 border-b flex justify-between items-center">
                <h2 class="text-xl font-bold">{{ pack.name }} Contents</h2>
                <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>

            <!-- Content -->
            <div class="p-4 overflow-y-auto">
                <div class="space-y-4">
                    <!-- Pack Info -->
                    <div class="text-sm text-gray-600">
                        <p>Items per pack: {{ pack.minItems }}-{{ pack.maxItems }}</p>
                        <p>Price: {{ formatNumber(pack.price) }} coins</p>
                    </div>

                    <!-- Possible Items -->
                    <div class="grid gap-3">
                        <div v-for="drop in pack.possibleItems" :key="drop.itemId" class="border rounded-lg p-3" :class="{
                            'opacity-40': !isDiscovered(drop.itemId),
                            'border-gray-300': getItemRarity(drop.itemId) === 'common',
                            'border-green-400': getItemRarity(drop.itemId) === 'uncommon',
                            'border-blue-400': getItemRarity(drop.itemId) === 'rare',
                            'border-purple-400': getItemRarity(drop.itemId) === 'epic',
                            'border-yellow-400': getItemRarity(drop.itemId) === 'legendary',
                        }">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-bold">
                                        {{ isDiscovered(drop.itemId) ? getItemName(drop.itemId) : '???' }}
                                    </h3>
                                    <p class="text-sm" :class="{
                                        'text-gray-600': getItemRarity(drop.itemId) === 'common',
                                        'text-green-600': getItemRarity(drop.itemId) === 'uncommon',
                                        'text-blue-600': getItemRarity(drop.itemId) === 'rare',
                                        'text-purple-600': getItemRarity(drop.itemId) === 'epic',
                                        'text-yellow-600': getItemRarity(drop.itemId) === 'legendary',
                                    }">
                                        {{ getItemRarity(drop.itemId) }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium">{{ drop.dropChance }}%</p>
                                    <p v-if="isDiscovered(drop.itemId)" class="text-sm text-green-600">
                                        +{{ formatNumber(new BigNumber(getItemProduction(drop.itemId))) }}/min
                                    </p>
                                </div>
                            </div>

                            <div v-if="isDiscovered(drop.itemId)" class="mt-2 text-sm text-gray-600">
                                Value: {{ formatNumber(new BigNumber(getItemValue(drop.itemId))) }} coins
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { itemManager } from '../managers/itemManager'
import { formatNumber } from '../utils/format'
import BigNumber from 'bignumber.js'
import type { Pack } from '../store'

const props = defineProps<{
    pack: Pack
}>()

defineEmits<{
    (e: 'close'): void
}>()

const store = useStore()

const isDiscovered = (itemId: string) => {
    return store.discoveredItems.has(itemId)
}

const getItemName = (itemId: string) => {
    return itemManager.getItem(itemId)?.name ?? 'Unknown'
}

const getItemRarity = (itemId: string) => {
    return itemManager.getItem(itemId)?.rarity ?? 'common'
}

const getItemProduction = (itemId: string) => {
    return itemManager.getItem(itemId)?.coinsPerMinute ?? 0
}

const getItemValue = (itemId: string) => {
    return itemManager.getItem(itemId)?.value ?? 0
}
</script>