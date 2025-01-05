<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-6">Upgrades</h2>

        <!-- Filter Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex flex-wrap gap-2 pb-2">
                <!-- Status Filters -->
                <div class="flex gap-2 mr-4">
                    <button v-for="filter in ['all', 'available', 'maxed']" :key="filter"
                        @click="activeFilter = filter as FilterType" class="px-3 py-1 rounded-full text-sm" :class="[
                            activeFilter === filter
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]">
                        {{ formatFilter(filter) }}
                    </button>
                </div>

                <!-- Pack Filters -->
                <div class="flex gap-2">
                    <button v-for="filter in filters.filter(f => !['all', 'available', 'maxed'].includes(f))"
                        :key="filter" @click="activeFilter = filter" class="px-3 py-1 rounded-full text-sm" :class="[
                            activeFilter === filter
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]">
                        {{ formatFilter(filter) }}
                    </button>
                </div>
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
                        <p v-if="upgrade.requiresUpgrade && !isUpgradeRequirementMet(upgrade)"
                            class="text-sm text-red-600 mt-1">
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

                <button @click="purchaseUpgrade(upgrade)" :disabled="!canPurchaseUpgrade(upgrade)" class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 
                           disabled:hover:bg-blue-500">
                    Purchase
                </button>

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

type FilterType = 'all' | 'available' | 'maxed' | 'general' | 'morty-pack' | 'ancient-pack' | 'cyber-pack' | 'fakemon-pack'

const filters: FilterType[] = [
    'all',
    'available',
    'maxed',
    'general',
    'morty-pack',
    'ancient-pack',
    'cyber-pack',
    'fakemon-pack',
]

const activeFilter = ref<FilterType>('all')

const filteredUpgrades = computed(() => {
    let upgrades = store.upgrades

    // First apply the pack filter
    if (activeFilter.value !== 'all' && activeFilter.value !== 'available' && activeFilter.value !== 'maxed') {
        if (activeFilter.value === 'general') {
            // Show upgrades without packId
            upgrades = upgrades.filter(upgrade => !upgrade.packId)
        } else {
            // Show upgrades for specific pack
            const packId = activeFilter.value.replace('-pack', '')
            upgrades = upgrades.filter(upgrade => upgrade.packId?.includes(packId))
        }
    }

    // Then apply available/maxed filters
    switch (activeFilter.value) {
        case 'available':
            return upgrades.filter(upgrade =>
                (!upgrade.maxLevel || upgrade.level < upgrade.maxLevel)
            )
        case 'maxed':
            return upgrades.filter(upgrade =>
                upgrade.maxLevel && upgrade.level >= upgrade.maxLevel
            )
        default:
            return upgrades
    }
})

const formatFilter = (filter: string) => {
    switch (filter) {
        case 'all':
            return 'All'
        case 'available':
            return 'Available'
        case 'maxed':
            return 'Maxed'
        case 'general':
            return 'General'
        case 'morty-pack':
            return 'Morty Pack'
        case 'ancient-pack':
            return 'Ancient Pack'
        case 'cyber-pack':
            return 'Cyber Pack'
        case 'fakemon-pack':
            return 'Fakemon Pack'
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

const purchaseUpgrade = (upgrade: Upgrade) => {
    if (!canPurchaseUpgrade(upgrade)) return

    const price = store.getUpgradeCost(upgrade)
    store.coins = store.coins.minus(price)
    upgrade.level++

    if (upgrade.type === 'packTimer' && upgrade.level === 1 && upgrade.id.includes('instant')) {
        const pack = store.availablePacks.find(p => p.id === upgrade.packId)
        if (pack?.purchaseLimit) {
            pack.purchaseLimit.minutes = 0
        }
    }

    store.saveToLocalStorage()
}
</script>