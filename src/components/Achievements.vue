<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Achievements</h2>
            <div class="text-sm text-gray-600">
                Total Bonuses:
                <div class="flex gap-4">
                    <span class="text-green-600">+{{ (coinBonus * 100).toFixed(0) }}% Coin Production</span>
                    <span class="text-blue-600">+{{ (valueBonus * 100).toFixed(0) }}% Item Value</span>
                </div>
            </div>
        </div>

        <!-- Category Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex gap-4">
                <button v-for="category in categories" :key="category" @click="activeCategory = category"
                    class="py-2 px-1 -mb-px whitespace-nowrap" :class="[
                        activeCategory === category
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    ]">
                    {{ formatCategory(category) }}
                </button>
            </nav>
        </div>

        <!-- Achievement List -->
        <div class="grid gap-4">
            <div v-for="achievement in filteredAchievements" :key="achievement.id" class="border rounded-lg p-4" :class="{
                'border-green-400 bg-green-50': achievement.completed,
                'border-gray-200': !achievement.completed
            }">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold">{{ achievement.name }}</h3>
                        <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium"
                            :class="achievement.completed ? 'text-green-600' : 'text-gray-600'">
                            {{ props.formatNumber(achievement.progress) }}/{{
                                props.formatNumber(achievement.requirement) }}
                        </div>
                        <div class="text-sm text-gray-500">
                            {{ achievement.reward.type === 'coinProduction' ? 'Coin Production' : 'Item Value' }}
                            +{{ (achievement.reward.bonus * 100).toFixed(0) }}%
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 rounded-full h-2 transition-all"
                        :style="{ width: `${(achievement.progress / achievement.requirement * 100).toFixed(1)}%` }"
                        :class="{ 'bg-green-500': achievement.completed }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { achievementManager } from '../managers/achievementManager'
import type { Achievement } from '../managers/achievementManager'

const props = defineProps<{
    formatNumber: (number: number) => string
}>()

const activeCategory = ref<Achievement['category']>('packs')
const categories: Achievement['category'][] = ['packs', 'items', 'coins', 'daily']

const filteredAchievements = computed(() => {
    return achievementManager.getCategoryAchievements(activeCategory.value)
})

const coinBonus = computed(() => achievementManager.getTotalBonus('coinProduction'))
const valueBonus = computed(() => achievementManager.getTotalBonus('itemValue'))

const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
}
</script>