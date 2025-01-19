<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold dark:text-white">Achievements</h2>
            <div class="text-sm text-gray-600 dark:text-gray-400">
                Total Bonuses:
                <div class="flex gap-4">
                    <span class="text-green-600 dark:text-green-400">+{{ (coinBonus * 100).toFixed(0) }}% Coin
                        Production</span>
                    <span class="text-blue-600 dark:text-blue-400">+{{ (valueBonus * 100).toFixed(0) }}% Item
                        Value</span>
                </div>
            </div>
        </div>

        <!-- Category Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex gap-4">
                <button v-for="category in categories" :key="category" @click="activeCategory = category"
                    class="px-1 py-2 -mb-px whitespace-nowrap" :class="[
                        activeCategory === category
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    ]">
                    {{ formatCategory(category) }}
                </button>
            </nav>
        </div>

        <!-- Achievement List -->
        <div class="grid gap-4">
            <div v-for="achievement in filteredAchievements" :key="achievement.id" class="p-4 border rounded-lg" :class="{
                'border-green-400 bg-green-50 dark:border-green-500 dark:bg-green-900/20': achievement.completed,
                'border-gray-200 dark:border-gray-700 dark:bg-gray-800': !achievement.completed
            }">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-bold dark:text-white">{{ achievement.name }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium"
                            :class="achievement.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'">
                            {{ props.formatNumber(achievement.progress) }}/{{
                                props.formatNumber(achievement.requirement) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ achievement.reward.type === 'coinProduction' ? 'Coin Production' : 'Item Value' }}
                            +{{ (achievement.reward.bonus * 100).toFixed(0) }}%
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div class="h-2 transition-all bg-blue-500 rounded-full dark:bg-blue-600"
                        :style="{ width: `${(achievement.progress / achievement.requirement * 100).toFixed(1)}%` }"
                        :class="{ 'bg-green-500 dark:bg-green-600': achievement.completed }"></div>
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
