<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Generators</h2>
            <div class="text-lg text-green-600">
                +{{ store.formattedProduction }}
            </div>
        </div>

        <div class="grid gap-4">
            <div v-for="generator in store.generators" :key="generator.id" class="border p-4 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold">{{ generator.name }}</h3>
                        <p class="text-sm text-gray-600">{{ generator.description }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm">Owned: {{ generator.amount }}</p>
                        <p class="text-green-600">
                            +{{ formatNumber(new BigNumber(generator.baseProduction).times(generator.amount)) }}/s
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 mt-4">
                    <input type="number" v-model="buyAmounts[generator.id]" min="1"
                        :max="store.getMaxBuyableGenerators(generator.id)" class="w-20 px-2 py-1 border rounded">
                    <div class="flex-1 flex gap-1">
                        <button @click="buyGenerator(generator.id, 1)" :disabled="!canBuyGenerator(generator.id, 1)"
                            class="flex-1 px-2 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50">
                            Buy 1
                        </button>
                        <button @click="buyGenerator(generator.id, buyAmounts[generator.id])"
                            :disabled="!canBuyGenerator(generator.id, buyAmounts[generator.id])"
                            class="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50">
                            Buy X
                        </button>
                        <button @click="buyMax(generator.id)" :disabled="!canBuyGenerator(generator.id, 1)"
                            class="flex-1 px-2 py-1 bg-blue-700 text-white text-sm rounded disabled:opacity-50">
                            Max
                        </button>
                    </div>
                </div>

                <div class="text-sm text-gray-600 mt-2">
                    Cost: {{ formatNumber(store.getGeneratorCost(generator, buyAmounts[generator.id])) }} coins
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { reactive } from 'vue'
import BigNumber from 'bignumber.js'
import { formatNumber } from '../utils/format'

const store = useStore()

const buyAmounts = reactive<Record<string, number>>(
    Object.fromEntries(store.generators.map(gen => [gen.id, 1]))
)

const buyGenerator = (id: string, amount: number) => {
    if (store.buyGenerator(id, amount)) {
        buyAmounts[id] = 1
    }
}

const buyMax = (id: string) => {
    const maxAmount = store.getMaxBuyableGenerators(id)
    if (maxAmount > 0) {
        buyGenerator(id, maxAmount)
    }
}

const canBuyGenerator = (id: string, amount: number) => {
    const generator = store.generators.find(g => g.id === id)
    if (!generator) return false

    return store.coins.isGreaterThanOrEqualTo(store.getGeneratorCost(generator, amount))
}
</script>