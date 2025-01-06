<template>
    <div v-if="show" class="fixed inset-0 flex items-start justify-center z-50">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 mt-4"
            :class="{ 'animate-shake': props.showAnimations && isShaking }">
            <!-- Fixed Header -->
            <div class="sticky top-0 bg-white rounded-t-lg border-b p-4 z-10">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Opening {{ packName }}</h2>
                    <div v-if="remainingItems === 0" class="flex gap-2">
                        <button v-if="hasMorePacks" @click="openAnother"
                            class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                            Open Another
                        </button>
                        <button @click="close"
                            class="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">
                            Done
                        </button>
                    </div>
                    <div v-else class="flex gap-2">
                        <button @click="revealNext"
                            class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                            Next
                        </button>
                        <button @click="revealAll"
                            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                            All
                        </button>
                        <button v-if="isAnimating && props.showAnimations" @click="skipAnimation"
                            class="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-gray-600">
                            Skip
                        </button>
                    </div>
                </div>

                <!-- Progress info -->
                <div class="flex justify-between items-center text-sm">
                    <div class="flex items-center gap-2">
                        <span v-if="remainingItems > 0">
                            Remaining Items: {{ remainingItems }}
                        </span>
                        <span v-if="remainingPacks && remainingPacks > 0" class="text-blue-600">
                            ({{ remainingPacks }} more packs)
                        </span>
                    </div>
                    <div v-if="revealedItems.length > 0" class="flex items-center gap-2">
                        <span>Total Value:</span>
                        <span :class="{ 'text-green-600': isProfit, 'text-red-600': !isProfit }">
                            {{ formatNumber(totalValue) }}
                            <span class="ml-1">
                                ({{ isProfit ? '+' : '' }}{{ formatNumber(profit) }})
                            </span>
                        </span>
                    </div>
                </div>

                <!-- Add animation note -->
                <div v-if="props.showAnimations" class="text-xs text-gray-500 mt-2">
                    Tip: You can disable animations in settings for faster pack openings
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="">
                <!-- Revealed items -->
                <div class="space-y-3 max-h-[60vh] overflow-y-auto p-4">
                    <div v-for="(item, index) in stackedItems" :key="item.id" ref="itemRefs"
                        class="border rounded-lg p-4 mb-4 animate-fade-in" :class="{
                            'border-gray-300': item.rarity === 'common',
                            'border-green-400': item.rarity === 'uncommon',
                            'border-blue-400': item.rarity === 'rare',
                            'border-purple-400': item.rarity === 'epic',
                            'border-yellow-400': item.rarity === 'legendary',
                            'shadow-glow': item.id === revealedItems[revealedItems.length - 1]?.id && props.showAnimations,
                        }">
                        <div>
                            <h3 class="font-bold">{{ item.name }}</h3>
                            <div class="flex items-center gap-2">
                                <p class="text-sm capitalize" :class="{
                                    'text-gray-600': item.rarity === 'common',
                                    'text-green-600': item.rarity === 'uncommon',
                                    'text-blue-600': item.rarity === 'rare',
                                    'text-purple-600': item.rarity === 'epic',
                                    'text-yellow-600': item.rarity === 'legendary',
                                }">
                                    {{ item.rarity }}
                                </p>
                                <span class="text-sm text-gray-500">×{{ item.amount }}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">{{ formatNumber(item.value) }} coins each</p>
                            <p class="text-sm text-gray-600">
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
    const itemMap = new Map<string, Item & { amount?: number }>()

    revealedItems.value.forEach(item => {
        const existing = itemMap.get(item.id)
        if (existing) {
            existing.amount = (existing.amount || 1) + 1
        } else {
            itemMap.set(item.id, { ...item, amount: 1 })
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

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #EDF2F7;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 3px;
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