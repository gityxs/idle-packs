<template>
    <div class="border rounded-lg p-4">
        <h2 class="text-xl font-bold mb-4">Boss Fights</h2>

        <!-- Add warning message when no combat items are equipped -->
        <div v-if="!bossStore.canFight" class="text-center py-8">
            <div class="text-yellow-600 mb-2">⚔️ Combat Locked</div>
            <p class="text-gray-600">
                Equip an item with combat stats to unlock boss fights
            </p>
        </div>

        <div v-else-if="bossStore.currentBoss" class="space-y-4">
            <div class="flex items-center justify-between gap-4 mb-4">
                <div class="flex items-center gap-4">
                    <label class="text-sm font-medium">Select Boss Level:</label>
                    <div class="flex items-center gap-2">
                        <button @click="selectBossLevel(bossStore.selectedBossLevel - 1)"
                            :disabled="bossStore.selectedBossLevel <= 1"
                            class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                            -
                        </button>
                        <span class="min-w-[3ch] text-center">{{ bossStore.selectedBossLevel }}</span>
                        <button @click="selectBossLevel(bossStore.selectedBossLevel + 1)"
                            :disabled="bossStore.selectedBossLevel >= bossStore.maxSelectableBossLevel"
                            class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                            +
                        </button>
                    </div>
                    <span class="text-sm text-gray-600">
                        (Max: {{ bossStore.maxSelectableBossLevel }})
                    </span>
                </div>

                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" :checked="bossStore.autoProgress" @change="bossStore.toggleAutoProgress()"
                        class="w-4 h-4">
                    <span class="text-sm">Auto Progress</span>
                </label>
            </div>

            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold">{{ bossStore.currentBoss.name }}</h3>
                    <div class="text-sm text-gray-600">
                        Attack: {{ bossStore.currentBoss.attack }} | Defense: {{ bossStore.currentBoss.defense }}
                    </div>
                </div>
                <div class="text-sm">
                    Rewards: {{ bossStore.currentBoss.rewards.coins }} coins, {{
                        bossStore.currentBoss.rewards.experience }} xp
                </div>
            </div>

            <!-- Boss health bar -->
            <div class="w-full bg-gray-200 rounded-full h-4">
                <div class="bg-red-500 rounded-full h-4 transition-all duration-200"
                    :style="{ width: `${(bossStore.currentBoss.health / bossStore.currentBoss.maxHealth) * 100}%` }">
                </div>
            </div>
            <div class="text-center text-sm">
                {{ bossStore.currentBoss.health }}/{{ bossStore.currentBoss.maxHealth }}
            </div>

            <!-- Player stats -->
            <div class="border-t pt-4 mt-4">
                <h4 class="font-bold mb-2">Your Stats</h4>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="font-bold">{{ playerStats.attack }}</div>
                        <div class="text-sm text-gray-600">Attack</div>
                    </div>
                    <div>
                        <div class="font-bold">{{ playerStats.defense }}</div>
                        <div class="text-sm text-gray-600">Defense</div>
                    </div>
                    <div>
                        <div class="font-bold">{{ playerStats.health }}</div>
                        <div class="text-sm text-gray-600">Health</div>
                    </div>
                </div>

                <!-- Player health bar -->
                <div class="border-t pt-4 mt-4">
                    <h4 class="font-bold mb-2">Your Health</h4>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-green-500 rounded-full h-4 transition-all duration-200"
                            :style="{ width: `${bossStore.playerHealthPercent}%` }">
                        </div>
                    </div>
                    <div class="text-center text-sm mt-1">
                        {{ Math.ceil(bossStore.currentPlayerHealth) }}/{{ playerStats.health }}
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex justify-center mt-4">
                <button @click="toggleFighting" class="px-4 py-2 rounded"
                    :class="bossStore.isFighting ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'">
                    {{ bossStore.isFighting ? 'Stop Fighting' : 'Start Fighting' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useBossStore } from '../stores/bossStore'

const bossStore = useBossStore()

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