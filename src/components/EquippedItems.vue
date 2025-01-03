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
            <div v-for="item in store.equippedItems" :key="item.id"
                class="border-2 border-dashed p-4 rounded-lg min-h-[150px]" :class="{
                    'border-gray-200': !item,
                    'border-gray-300': item?.rarity === 'common',
                    'border-green-400': item?.rarity === 'uncommon',
                    'border-blue-400': item?.rarity === 'rare',
                    'border-purple-400': item?.rarity === 'epic',
                    'border-yellow-400': item?.rarity === 'legendary',
                }">
                <div v-if="item" class="space-y-2">
                    <div>
                        <h3 class="font-bold">{{ item.name }}</h3>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <p class="text-sm capitalize" :class="{
                                'text-gray-600': item.rarity === 'common',
                                'text-green-600': item.rarity === 'uncommon',
                                'text-blue-600': item.rarity === 'rare',
                                'text-purple-600': item.rarity === 'epic',
                                'text-yellow-600': item.rarity === 'legendary',
                            }">
                                {{ item.rarity }}
                            </p>
                            <!-- Add type chips -->
                            <div class="flex flex-wrap gap-1">
                                <TypeChip v-for="type in itemManager.getItem(item.id)?.types" :key="type"
                                    :type="type" />
                            </div>
                        </div>
                        <p class="text-green-600 mt-1">
                            +{{ formatNumber(getItemProduction(item.id)) }}/min
                        </p>
                    </div>
                    <button @click="store.unequipItem(item.id)"
                        class="w-full px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                        Unequip
                    </button>
                </div>
                <div v-else class="flex items-center justify-center h-[100px] text-gray-400">
                    Empty Slot
                </div>

                <!-- Add synergy info -->
                <SynergyInfo v-if="itemManager.getItem(item.id)" :item="itemManager.getItem(item.id)!" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { formatNumber } from '../utils/format'
import BigNumber from 'bignumber.js'
import { itemManager } from '../managers/itemManager'
import SynergyInfo from '../components/SynergyInfo.vue'
import TypeChip from '../components/TypeChip.vue'

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