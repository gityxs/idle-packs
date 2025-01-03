<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold mb-6">Upgrades</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="upgrade in store.upgrades" :key="upgrade.id" class="border p-4 rounded-lg">
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
                    <button @click="store.buyUpgrade(upgrade.id)" :disabled="!canBuyUpgrade(upgrade)"
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
import { useStore } from '../store'
import { formatNumber } from '../utils/format'

const store = useStore()

const canBuyUpgrade = (upgrade: Upgrade) => {
    if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return false
    return store.coins.isGreaterThanOrEqualTo(store.getUpgradeCost(upgrade))
}
</script>