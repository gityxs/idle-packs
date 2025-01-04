<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-6">Upgrades</h2>

        <!-- Filter Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex gap-4">
                <button v-for="filter in filters" :key="filter" @click="activeFilter = filter"
                    class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
                        activeFilter === filter
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    ]">
                    {{ formatFilter(filter) }}
                </button>
            </nav>
        </div>

        <div v-if="!store.hasPerformedFirstAction"
            class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            Upgrades are locked until you sell or equip your first item
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="upgrade in filteredUpgrades" :key="upgrade.id" class="border p-4 rounded-lg"
                :class="{ 'opacity-50': !store.hasPerformedFirstAction }">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold">{{ upgrade.name }}</h3>
                        <p class="text-sm text-gray-600">{{ upgrade.description }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm">
                            Level: {{ upgrade.level }}
                            <span v-if="upgrade.maxLevel">
                                / {{ upgrade.maxLevel }}
                            </span>
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 mt-4">
                    <button @click="store.buyUpgrade(upgrade.id)"
                        :disabled="!store.hasPerformedFirstAction || !canBuyUpgrade(upgrade)"
                        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500">
                        Upgrade ({{ formatNumber(store.getUpgradeCost(upgrade)) }})
                    </button>
                </div>

                <div v-if="upgrade.maxLevel && upgrade.level >= upgrade.maxLevel"
                    class="text-green-600 text-sm mt-2 text-center">
                    Maximum Level Reached
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../store'
import { formatNumber } from '../utils/format'
import type { Upgrade } from '../types'

const store = useStore()

type FilterType = 'all' | 'available' | 'maxed'
const filters: FilterType[] = ['all', 'available', 'maxed']
const activeFilter = ref<FilterType>('all')

const filteredUpgrades = computed(() => {
    switch (activeFilter.value) {
        case 'available':
            return store.upgrades.filter(upgrade =>
                (!upgrade.maxLevel || upgrade.level < upgrade.maxLevel)
            )
        case 'maxed':
            return store.upgrades.filter(upgrade =>
                upgrade.maxLevel && upgrade.level >= upgrade.maxLevel
            )
        default:
            return store.upgrades
    }
})

const formatFilter = (filter: string) => {
    return filter.charAt(0).toUpperCase() + filter.slice(1)
}

const canBuyUpgrade = (upgrade: Upgrade) => {
    if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false
    return store.coins.isGreaterThanOrEqualTo(store.getUpgradeCost(upgrade))
}
</script>