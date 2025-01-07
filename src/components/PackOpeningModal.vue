<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-start justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-md p-6 mx-4 mt-4 bg-white rounded-lg dark:bg-gray-800"
            :class="{ 'animate-shake': props.showAnimations && isShaking }">
            <!-- Fixed Header -->
            <div class="sticky top-0 z-10 p-4 bg-white border-b rounded-t-lg dark:bg-gray-800 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold dark:text-white">Opening {{ packName }}</h2>
                    <div v-if="remainingItems === 0" class="flex gap-2">
                        <button v-if="hasMorePacks" @click="openAnother"
                            class="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Open Another
                        </button>
                        <button @click="close"
                            class="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                            Done
                        </button>
                    </div>
                    <div v-else class="flex gap-2">
                        <button @click="revealNext"
                            class="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Next
                        </button>
                        <button @click="revealAll"
                            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                            All
                        </button>
                        <button v-if="isAnimating && props.showAnimations" @click="skipAnimation"
                            class="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                            Skip
                        </button>
                    </div>
                </div>

                <!-- Progress info -->
                <div class="flex items-center justify-between text-sm dark:text-gray-300">
                    <div class="flex items-center gap-2">
                        <span v-if="remainingItems > 0">
                            Remaining Items: {{ remainingItems }}
                        </span>
                        <span v-if="remainingPacks && remainingPacks > 0" class="text-blue-600 dark:text-blue-400">
                            ({{ remainingPacks }} more packs)
                        </span>
                    </div>
                    <div v-if="revealedItems.length > 0" class="flex items-center gap-2">
                        <span>Total Value:</span>
                        <span
                            :class="{ 'text-green-600 dark:text-green-400': isProfit, 'text-red-600 dark:text-red-400': !isProfit }">
                            {{ formatNumber(totalValue) }}
                            <span class="ml-1">
                                ({{ isProfit ? '+' : '' }}{{ formatNumber(profit) }})
                            </span>
                        </span>
                    </div>
                </div>

                <!-- Add animation note -->
                <div v-if="props.showAnimations" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Tip: You can disable animations in settings for faster pack openings
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="">
                <!-- Revealed items -->
                <div class="space-y-3 max-h-[60vh] overflow-y-auto p-4">
                    <div v-for="(item, index) in stackedItems" :key="item.id" ref="itemRefs"
                        class="p-4 mb-4 border rounded-lg animate-fade-in dark:bg-gray-700" :class="{
                            'border-gray-300 dark:border-gray-600': item.rarity === 'common',
                            'border-green-400 dark:border-green-500': item.rarity === 'uncommon',
                            'border-blue-400 dark:border-blue-500': item.rarity === 'rare',
                            'border-purple-400 dark:border-purple-500': item.rarity === 'epic',
                            'border-yellow-400 dark:border-yellow-500': item.rarity === 'legendary',
                            'shadow-glow': item.id === revealedItems[revealedItems.length - 1]?.id && props.showAnimations,
                        }">
                        <div>
                            <h3 class="font-bold dark:text-white">{{ item.name }}</h3>
                            <div class="flex items-center gap-2">
                                <p class="text-sm capitalize" :class="{
                                    'text-gray-600 dark:text-gray-400': item.rarity === 'common',
                                    'text-green-600 dark:text-green-400': item.rarity === 'uncommon',
                                    'text-blue-600 dark:text-blue-400': item.rarity === 'rare',
                                    'text-purple-600 dark:text-purple-400': item.rarity === 'epic',
                                    'text-yellow-600 dark:text-yellow-400': item.rarity === 'legendary',
                                }">
                                    {{ item.rarity }}
                                </p>
                                <span class="text-sm text-gray-500 dark:text-gray-400">×{{ item.amount }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-medium dark:text-white">{{ formatNumber(item.value) }} coins each</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Total: {{ formatNumber(item.value?.times(item.amount)) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Item } from '../types'
import BigNumber from 'bignumber.js'

const props = defineProps<{
    show: boolean
    items: Item[]
    packName: string
    formatNumber: (num: BigNumber | number) => string
    packPrice?: number
    showAnimations?: boolean
    hasMorePacks?: boolean
    remainingPacks?: number
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'openAnother'): void
}>()

const revealedItems = ref<Item[]>([])
const remainingItems = computed(() => props.items.length - revealedItems.value.length)

// Compute stacked items (combine duplicates)
const stackedItems = computed(() => {
    const itemMap = new Map<string, Item & { amount: number }>()

    revealedItems.value.forEach(item => {
        const existing = itemMap.get(item.id)
        if (existing) {
            existing.amount = (existing.amount || 1) + 1
        } else {
            itemMap.set(item.id, {
                ...item,
                amount: 1,
                value: new BigNumber(item.value)
            })
        }
    })

    return Array.from(itemMap.values())
})

const itemRefs = ref<HTMLElement[]>([])

const revealNext = () => {
    if (remainingItems.value > 0) {
        startShakeAnimation()
        const nextItem = props.items[revealedItems.value.length]
        revealedItems.value.push(nextItem)

        // Scroll to the new item after a short delay to allow for rendering
        setTimeout(() => {
            const lastItemRef = itemRefs.value[stackedItems.value.findIndex(
                item => item.id === nextItem.id
            )]
            if (lastItemRef) {
                lastItemRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 100)
    }
}

const isAnimating = ref(false)

const revealAll = () => {
    if (!props.showAnimations) {
        revealedItems.value = [...props.items]
    } else {
        isAnimating.value = true
        const reveal = () => {
            if (remainingItems.value > 0) {
                revealNext()
                setTimeout(reveal, 700)
            } else {
                isAnimating.value = false
            }
        }
        reveal()
    }
}

// If animations are disabled, reveal all items immediately when modal opens
onMounted(() => {
    if (!props.showAnimations) {
        // Small delay to ensure items are loaded
        setTimeout(() => {
            revealAll()
        }, 50)
    }

    // Add event listener for escape key
    window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
})

const close = () => {
    // If there are remaining items, reveal them all first
    if (remainingItems.value > 0) {
        skipAnimation()
        revealedItems.value = [...props.items]
        return
    }

    // Only close if all items are revealed
    revealedItems.value = []
    emit('close')
}

const openAnother = () => {
    // Clear current items
    revealedItems.value = []
    emit('openAnother')

    // If animations are disabled, automatically reveal all new items after a short delay
    if (!props.showAnimations) {
        // Small delay to ensure new items are loaded
        setTimeout(() => {
            revealAll()
        }, 50)
    }
}

// Calculate total value of revealed items
const totalValue = computed(() => {
    return stackedItems.value.reduce((sum, item) => {
        if (item.value) {
            return sum.plus(item.value.times(item.amount))
        }

        return sum
    }, new BigNumber(0))
})

// Calculate profit/loss
const profit = computed(() => {
    const packCost = props.packPrice ? new BigNumber(props.packPrice) : new BigNumber(0)
    return totalValue.value.minus(packCost)
})

const isProfit = computed(() => {
    return profit.value.isGreaterThanOrEqualTo(0)
})

const isShaking = ref(false)

// Add shake animation when opening packs
const startShakeAnimation = () => {
    if (!props.showAnimations) return
    isShaking.value = true
    setTimeout(() => {
        isShaking.value = false
    }, 500) // Animation duration
}

const skipAnimation = () => {
    isAnimating.value = false
    revealedItems.value = [...props.items]
}

// Add escape key handler
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        if (remainingItems.value > 0) {
            // If there are remaining items, reveal all first
            skipAnimation()
            revealedItems.value = [...props.items]
        } else {
            // Only close if all items are revealed
            close()
        }
    }
}
</script>

<style scoped>
.animate-fade-in {
    animation: v-bind('showAnimations ? "fadeIn 0.5s ease-out" : "none"');
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Custom scrollbar */
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #EDF2F7;
}

.dark .overflow-y-auto {
    scrollbar-color: #4B5563 #1F2937;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #EDF2F7;
    border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
    background: #1F2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #4B5563;
}

@keyframes shake {

    0%,
    100% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(-5deg);
    }

    75% {
        transform: rotate(5deg);
    }
}

.animate-shake {
    animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}
</style>