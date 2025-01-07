<template>
    <div class="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 text-xl font-bold dark:text-white">Boss Fights</h2>

        <!-- Add warning message when no combat items are equipped -->
        <div v-if="!bossStore.canFight" class="py-8 text-center">
            <div class="mb-2 text-yellow-600 dark:text-yellow-500">⚔️ Combat Locked</div>
            <p class="text-gray-600 dark:text-gray-400">
                Equip an item with combat stats to unlock boss fights
            </p>
        </div>

        <div v-else-if="bossStore.currentBoss" class="space-y-4">
            <div class="flex items-center justify-between gap-4 mb-4">
                <div class="flex items-center gap-4">
                    <label class="text-sm font-medium dark:text-gray-300">Select Boss Level:</label>
                    <div class="flex items-center gap-2">
                        <button @click="selectBossLevel(bossStore.selectedBossLevel - 1)"
                            :disabled="bossStore.selectedBossLevel <= 1"
                            class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                            -
                        </button>
                        <span class="min-w-[3ch] text-center dark:text-white">{{ bossStore.selectedBossLevel }}</span>
                        <button @click="selectBossLevel(bossStore.selectedBossLevel + 1)"
                            :disabled="bossStore.selectedBossLevel >= bossStore.maxSelectableBossLevel"
                            class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                            +
                        </button>
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                        (Max: {{ bossStore.maxSelectableBossLevel }})
                    </span>
                </div>

                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" :checked="bossStore.autoProgress" @change="bossStore.toggleAutoProgress()"
                        class="w-4 h-4">
                    <span class="text-sm dark:text-gray-300">Auto Progress</span>
                </label>
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-bold dark:text-white">{{ bossStore.currentBoss.name }}</h3>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        Attack: {{ bossStore.currentBoss.attack }} | Defense: {{ bossStore.currentBoss.defense }}
                    </div>
                </div>
                <div class="text-sm dark:text-gray-300">
                    Rewards: {{ bossStore.currentBoss.rewards.coins }} coins, {{
                        bossStore.currentBoss.rewards.experience }} xp
                </div>
            </div>

            <!-- Boss health bar -->
            <div>
                <div class="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div class="h-4 transition-all duration-200 bg-red-500 rounded-full dark:bg-red-600"
                        :style="{ width: `${(bossStore.currentBoss.health / bossStore.currentBoss.maxHealth) * 100}%` }">
                    </div>
                </div>
                <div class="text-sm text-center dark:text-gray-300">
                    {{ bossStore.currentBoss.health }}/{{ bossStore.currentBoss.maxHealth }}
                </div>

                <!-- Add victory message -->
                <div v-if="showVictory" class="mt-2 font-bold text-center text-green-600 animate-bounce dark:text-green-400">
                    Boss Defeated!
                </div>
            </div>

            <!-- Player stats -->
            <div class="pt-4 mt-4 border-t dark:border-gray-700">
                <h4 class="mb-2 font-bold dark:text-white">Your Stats</h4>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="font-bold dark:text-white">{{ playerStats.attack }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Attack</div>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">{{ playerStats.defense }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Defense</div>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">{{ playerStats.health }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Health</div>
                    </div>
                </div>

                <!-- Player health bar -->
                <div class="pt-4 mt-4 border-t dark:border-gray-700">
                    <h4 class="mb-2 font-bold dark:text-white">Your Health</h4>
                    <div class="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div class="h-4 transition-all duration-200 bg-green-500 rounded-full dark:bg-green-600"
                            :style="{ width: `${bossStore.playerHealthPercent}%` }">
                        </div>
                    </div>
                    <div class="mt-1 text-sm text-center dark:text-gray-300">
                        {{ Math.ceil(bossStore.currentPlayerHealth) }}/{{ playerStats.health }}
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex justify-center mt-4">
                <button @click="toggleFighting" class="px-4 py-2 text-white rounded"
                    :class="bossStore.isFighting ? 
                        'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' : 
                        'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'">
                    {{ bossStore.isFighting ? 'Stop Fighting' : 'Start Fighting' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch, ref } from 'vue'
import { useBossStore } from '../stores/bossStore'

const bossStore = useBossStore()
const showVictory = ref(false)

// Initialize first boss if none exists and combat is possible
if (!bossStore.currentBoss && bossStore.canFight) {
    bossStore.generateBoss(bossStore.selectedBossLevel)
}

// Watch for changes in combat ability
watch(
    () => bossStore.canFight,
    (canFight) => {
        if (!canFight) {
            // Stop fighting if combat items are unequipped
            bossStore.stopFighting()
        } else if (!bossStore.currentBoss) {
            // Generate first boss when combat becomes available
            bossStore.generateBoss(bossStore.selectedBossLevel)
        }
    }
)

// Watch for boss defeat
watch(() => bossStore.currentBoss?.health, (newHealth, oldHealth) => {
    if (newHealth === 0 && oldHealth && oldHealth > 0) {
        showVictory.value = true
        // Hide victory message after a delay
        setTimeout(() => {
            showVictory.value = false
        }, 1000)
    }
})

const playerStats = computed(() => bossStore.calculatePlayerStats())

const selectBossLevel = (level: number) => {
    bossStore.selectBossLevel(level)
}

const toggleFighting = () => {
    if (!bossStore.canFight) return

    if (bossStore.isFighting) {
        bossStore.stopFighting()
    } else {
        bossStore.startFighting()
    }
}

onUnmounted(() => {
    bossStore.stopFighting()
})
</script>