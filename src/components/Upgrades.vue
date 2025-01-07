<template>
    <div class="space-y-6">
        <h2 class="mb-6 text-2xl font-bold">Upgrades</h2>

        <!-- Filter Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex flex-wrap gap-2 pb-2">
                <button v-for="filter in ['all', 'available', 'maxed']" :key="filter"
                    @click="activeFilter = filter as FilterType" class="px-3 py-1 text-sm rounded-full" :class="[
                        activeFilter === filter
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]">
                    {{ formatFilter(filter) }}
                </button>
            </nav>
        </div>

        <div v-if="!store.hasPerformedFirstAction"
            class="p-4 text-yellow-700 border border-yellow-200 rounded-lg bg-yellow-50">
            Upgrades are locked until you sell or equip your first item
        </div>

        <!-- Render each upgrade group -->
        <div v-for="group in filteredGroups" :key="group.name" class="space-y-4">
            <h3 class="text-xl font-semibold">{{ group.name }}</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div v-for="upgrade in group.upgrades" :key="upgrade.id" class="p-4 border rounded-lg"
                    :class="{ 'opacity-50': !store.hasPerformedFirstAction }">
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h3 class="font-bold">{{ upgrade.name }}</h3>
                            <p class="text-sm text-gray-600">{{ upgrade.description }}</p>
                            <p v-if="upgrade.requiresUpgrade && !isUpgradeRequirementMet(upgrade)"
                                class="mt-1 text-sm text-red-600">
                                Requires {{ getUpgradeName(upgrade.requiresUpgrade.id) }}
                                level {{ upgrade.requiresUpgrade.level }}
                            </p>
                        </div>
                        <div class="text-right">
                            <div class="text-sm">
                                Price: {{ formatNumber(store.getUpgradeCost(upgrade)) }}
                            </div>
                            <div class="text-sm" v-if="upgrade.maxLevel">
                                Level: {{ upgrade.level }}/{{ upgrade.maxLevel }}
                            </div>
                        </div>
                    </div>

                    <button @click="store.buyUpgrade(upgrade.id)" :disabled="!canPurchaseUpgrade(upgrade)"
                        class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500">
                        Purchase
                    </button>

                    <div v-if="upgrade.maxLevel && upgrade.level >= upgrade.maxLevel"
                        class="mt-2 text-sm text-center text-green-600">
                        Maximum Level Reached
                    </div>
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

const activeFilter = ref<FilterType>('all')

const filteredGroups = computed(() => {
    return store.upgradeGroups.map(group => ({
        ...group,
        upgrades: group.upgrades.filter(upgrade => {
            switch (activeFilter.value) {
                case 'available':
                    return !upgrade.maxLevel || upgrade.level < upgrade.maxLevel
                case 'maxed':
                    return upgrade.maxLevel && upgrade.level >= upgrade.maxLevel
                default:
                    return true
            }
        })
    })).filter(group => group.upgrades.length > 0) // Only show groups with upgrades
})

const formatFilter = (filter: string) => {
    switch (filter) {
        case 'all':
            return 'All'
        case 'available':
            return 'Available'
        case 'maxed':
            return 'Maxed'
        default:
            return filter.charAt(0).toUpperCase() + filter.slice(1)
    }
}

const canBuyUpgrade = (upgrade: Upgrade) => {
    if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false
    return store.coins.isGreaterThanOrEqualTo(store.getUpgradeCost(upgrade))
}

const isUpgradeRequirementMet = (upgrade: Upgrade) => {
    if (!upgrade.requiresUpgrade) return true

    const requiredUpgrade = store.upgrades.find(u => u.id === upgrade.requiresUpgrade?.id)
    return requiredUpgrade && requiredUpgrade.level >= upgrade.requiresUpgrade.level
}

const canPurchaseUpgrade = (upgrade: Upgrade) => {
    const price = store.getUpgradeCost(upgrade)
    const hasCoins = store.coins.isGreaterThanOrEqualTo(price)
    const notMaxed = !upgrade.maxLevel || upgrade.level < upgrade.maxLevel
    const meetsRequirements = isUpgradeRequirementMet(upgrade)

    return hasCoins && notMaxed && meetsRequirements
}

const getUpgradeName = (upgradeId: string) => {
    return store.upgrades.find(u => u.id === upgradeId)?.name || upgradeId
}
</script>