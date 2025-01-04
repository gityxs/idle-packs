<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Collection</h2>
            <div class="text-sm text-gray-600">
                Collection Bonuses:
                <div class="flex gap-4">
                    <span class="text-green-600">+{{ (coinBonus * 100).toFixed(0) }}% Coin Production</span>
                    <span class="text-blue-600">+{{ (valueBonus * 100).toFixed(0) }}% Item Value</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in sortedItems" :key="item.id" class="border rounded-lg p-4" :class="{
                'opacity-50': !isDiscovered(item.id),
                'border-gray-300': item.rarity === 'common',
                'border-green-400': item.rarity === 'uncommon',
                'border-blue-400': item.rarity === 'rare',
                'border-purple-400': item.rarity === 'epic',
                'border-yellow-400': item.rarity === 'legendary',
            }">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold">{{ isDiscovered(item.id) ? item.name : '???' }}</h3>
                        <p class="text-sm capitalize" :class="{
                            'text-gray-600': item.rarity === 'common',
                            'text-green-600': item.rarity === 'uncommon',
                            'text-blue-600': item.rarity === 'rare',
                            'text-purple-600': item.rarity === 'epic',
                            'text-yellow-600': item.rarity === 'legendary',
                        }">
                            {{ item.rarity }}
                        </p>
                    </div>
                    <div class="text-right text-sm">
                        Collected: {{ getCollectionCountFormatted(item.id, getMaxRequirement(item.id)) }}
                    </div>
                </div>

                <!-- Collection Bonuses -->
                <div v-if="isDiscovered(item.id)" class="mt-4 space-y-2">
                    <div v-for="(bonus, index) in getCollectionBonuses(item.id)" :key="index" class="text-sm" :class="{
                        'text-green-600': isCollectionBonusActive(item.id, bonus.requirement),
                        'text-gray-400': !isCollectionBonusActive(item.id, bonus.requirement)
                    }">
                        <div class="flex justify-between items-center">
                            <span>{{ bonus.description }}</span>
                            <span>{{ getCollectionCountFormatted(item.id, bonus.requirement) }}/{{ bonus.requirement
                                }}</span>
                        </div>
                        <!-- Progress bar -->
                        <div class="mt-1 w-full bg-gray-200 rounded-full h-1">
                            <div class="h-1 rounded-full transition-all"
                                :class="isCollectionBonusActive(item.id, bonus.requirement) ? 'bg-green-500' : 'bg-gray-400'"
                                :style="{ width: `${Math.min(100, (getCollectionCount(item.id) / bonus.requirement) * 100)}%` }">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { itemManager } from '../managers/itemManager'
import { collectionManager } from '../managers/collectionManager'
import { useStore } from '../store'
import BigNumber from 'bignumber.js'

const props = defineProps<{
    formatNumber: (num: BigNumber | number) => string
}>()

const store = useStore()

const sortedItems = computed(() => {
    const items = Array.from(itemManager.getAllItems().values())
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }

    return items.sort((a, b) => {
        return rarityOrder[b.rarity] - rarityOrder[a.rarity]
    })
})

const isDiscovered = (itemId: string) => store.discoveredItems.has(itemId)

const getCollectionCount = (itemId: string) => {
    const entry = collectionManager.getCollectionEntry(itemId)
    return entry?.count ?? 0
}

const getCollectionCountFormatted = (itemId: string, maxCount?: number) => {
    const count = getCollectionCount(itemId)
    return props.formatNumber(maxCount ? Math.min(count, maxCount) : count)
}

const getCollectionBonuses = (itemId: string) => {
    const entry = collectionManager.getCollectionEntry(itemId)
    return entry?.bonuses ?? []
}

const isCollectionBonusActive = (itemId: string, requirement: number) => {
    return getCollectionCount(itemId) >= requirement
}

const coinBonus = computed(() => collectionManager.getTotalBonus('coinProduction'))
const valueBonus = computed(() => collectionManager.getTotalBonus('itemValue'))

const getMaxRequirement = (itemId: string) => {
    const bonuses = getCollectionBonuses(itemId)
    return bonuses.length > 0
        ? Math.max(...bonuses.map(b => b.requirement))
        : Infinity
}
</script>