<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Equipment</h2>
            <div class="text-lg">
                <span class="text-green-600">+{{ production }}</span>
                <span class="text-gray-500 text-sm ml-1">(+{{ totalBonusPercent }}%)</span>
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="item in store.equippedItems" :key="item.id" class="border-2 border-dashed p-4 rounded-lg"
                :class="{
                    'border-gray-200': !item,
                    'border-gray-300': item?.rarity === 'common',
                    'border-green-400': item?.rarity === 'uncommon',
                    'border-blue-400': item?.rarity === 'rare',
                    'border-purple-400': item?.rarity === 'epic',
                    'border-yellow-400': item?.rarity === 'legendary',
                }">
                <div v-if="item" class="flex flex-col h-full">
                    <!-- Item Header (fixed height) -->
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold">{{ item.name }}</h3>
                        <button @click="store.unequipItem(item.id)" class="text-red-500 hover:text-red-600">
                            <span class="sr-only">Unequip</span>
                            ×
                        </button>
                    </div>

                    <!-- Main Content (flexible height) -->
                    <div class="flex-grow space-y-2">
                        <!-- Rarity and Types -->
                        <div class="flex flex-wrap items-center gap-1 text-sm">
                            <span class="capitalize" :class="{
                                'text-gray-600': item.rarity === 'common',
                                'text-green-600': item.rarity === 'uncommon',
                                'text-blue-600': item.rarity === 'rare',
                                'text-purple-600': item.rarity === 'epic',
                                'text-yellow-600': item.rarity === 'legendary',
                            }">
                                {{ item.rarity }}
                            </span>
                            <div class="flex flex-wrap gap-1">
                                <TypeChip v-for="type in itemManager.getItem(item.id)?.types" :key="type" :type="type"
                                    size="sm" />
                            </div>
                        </div>

                        <!-- Production -->
                        <p class="text-green-600 text-sm">
                            +{{ formatNumber(getItemProduction(item.id)) }}/min
                        </p>

                        <!-- Combat Stats (if present) -->
                        <div v-if="getItemCombatStats(item)" class="space-y-2">
                            <!-- Stats Grid -->
                            <div class="grid grid-cols-3 gap-1 text-xs bg-gray-50 rounded p-1">
                                <div class="text-center">
                                    <span class="font-bold text-red-600">{{ getItemCombatStats(item).attack }}</span>
                                    <span class="text-gray-600"> ATK</span>
                                </div>
                                <div class="text-center">
                                    <span class="font-bold text-blue-600">{{ getItemCombatStats(item).defense }}</span>
                                    <span class="text-gray-600"> DEF</span>
                                </div>
                                <div class="text-center">
                                    <span class="font-bold text-green-600">{{ getItemCombatStats(item).health }}</span>
                                    <span class="text-gray-600"> HP</span>
                                </div>
                            </div>

                            <!-- Level and XP -->
                            <div class="text-center">
                                <div class="text-xs">Level {{ getItemCombatStats(item).level }}</div>
                                <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                                    <div class="bg-blue-500 rounded-full h-1 transition-all duration-200"
                                        :style="{ width: `${(getItemCombatStats(item).experience / getItemCombatStats(item).requiredExperience) * 100}%` }">
                                    </div>
                                </div>
                                <div class="text-xs text-gray-600 mt-1">
                                    {{ getItemCombatStats(item).experience }}/{{
                                    getItemCombatStats(item).requiredExperience }}
                                    XP
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Synergy Info (always at bottom) -->
                    <div class="mt-2">
                        <SynergyInfo v-if="itemManager.getItem(item.id)" :item="itemManager.getItem(item.id)!" />
                    </div>
                </div>
                <div v-else class="flex items-center justify-center h-[100px] text-gray-400">
                    Empty Slot
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { formatNumber } from '../utils/format'
import BigNumber from 'bignumber.js'
import { itemManager, type ItemWithCombatStats } from '../managers/itemManager'
import { achievementManager } from '../managers/achievementManager'
import { collectionManager } from '../managers/collectionManager'
import SynergyInfo from '../components/SynergyInfo.vue'
import TypeChip from '../components/TypeChip.vue'
import type { Item } from '@/types'

const store = useStore()
const production = computed(() => store.formattedProduction)

const totalBonusPercent = computed(() => {
    const achievementBonus = achievementManager.getTotalBonus('coinProduction')
    const collectionBonus = collectionManager.getTotalBonus('coinProduction')
    const totalBonus = achievementBonus + collectionBonus
    return Math.round(totalBonus * 100)
})

const getItemProduction = (itemId?: string) => {
    if (!itemId) return new BigNumber(0)
    const definition = itemManager.getItem(itemId)
    return definition ? new BigNumber(definition.coinsPerMinute) : new BigNumber(0)
}

// Add helper function to safely get combat stats
const getItemCombatStats = (item: Item) => {
    return (item as ItemWithCombatStats).combatStats
}
</script>