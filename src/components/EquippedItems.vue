<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Equipment</h2>
            <div class="text-lg text-green-600">
                +{{ store.formattedProduction }}
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <!-- Equipment Slots -->
            <div v-for="n in store.maxEquippedItems" :key="n"
                class="border-2 border-dashed p-4 rounded-lg min-h-[150px]" :class="{
                    'border-gray-200': !getEquippedItem(n - 1),
                    'border-gray-300': getEquippedItem(n - 1)?.rarity === 'common',
                    'border-green-400': getEquippedItem(n - 1)?.rarity === 'uncommon',
                    'border-blue-400': getEquippedItem(n - 1)?.rarity === 'rare',
                    'border-purple-400': getEquippedItem(n - 1)?.rarity === 'epic',
                    'border-yellow-400': getEquippedItem(n - 1)?.rarity === 'legendary',
                }">
                <div v-if="getEquippedItem(n - 1)" class="space-y-2">
                    <div>
                        <h3 class="font-bold">{{ getEquippedItem(n - 1)?.name }}</h3>
                        <p class="text-sm capitalize" :class="{
                            'text-gray-600': getEquippedItem(n - 1)?.rarity === 'common',
                            'text-green-600': getEquippedItem(n - 1)?.rarity === 'uncommon',
                            'text-blue-600': getEquippedItem(n - 1)?.rarity === 'rare',
                            'text-purple-600': getEquippedItem(n - 1)?.rarity === 'epic',
                            'text-yellow-600': getEquippedItem(n - 1)?.rarity === 'legendary',
                        }">
                            {{ getEquippedItem(n - 1)?.rarity }}
                        </p>
                        <p class="text-green-600">
                            +{{ formatNumber(getItemProduction(getEquippedItem(n - 1)?.id)) }}/min
                        </p>
                    </div>
                    <button @click="store.unequipItem(getEquippedItem(n - 1)?.id)"
                        class="w-full px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                        Unequip
                    </button>
                </div>
                <div v-else class="flex items-center justify-center h-[100px] text-gray-400">
                    Empty Slot {{ n }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { formatNumber } from '../utils/format'
import BigNumber from 'bignumber.js'
import { itemManager } from '../managers/itemManager'

const store = useStore()

const getEquippedItem = (index: number) => {
    return store.equippedItems[index]
}

const getItemProduction = (itemId?: string) => {
    if (!itemId) return new BigNumber(0)
    const definition = itemManager.getItem(itemId)
    return definition ? new BigNumber(definition.coinsPerMinute) : new BigNumber(0)
}
</script>