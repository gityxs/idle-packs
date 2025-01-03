<template>
    <div v-if="synergyEffect" class="mt-2">
        <div class="text-sm font-medium text-purple-600">Synergy Effects:</div>
        <div class="text-sm text-gray-600">
            <!-- Show current bonus -->
            <div class="flex items-center gap-1">
                <span class="text-green-600">+{{ (synergyBonus * 100).toFixed(0) }}%</span>
                coin production
            </div>

            <!-- Show condition -->
            <div class="mt-1 text-xs">
                <template v-if="synergyEffect.condition.type === 'itemType'">
                    <span>+{{ (synergyEffect.bonus * 100).toFixed(0) }}% per
                        {{ formatTypes(synergyEffect.condition.value) }} item</span>
                </template>
                <template v-else-if="synergyEffect.condition.type === 'specificItem'">
                    <span>+{{ (synergyEffect.bonus * 100).toFixed(0) }}% when equipped with
                        {{ getItemName(synergyEffect.condition.value as string) }}</span>
                </template>
                <template v-else-if="synergyEffect.condition.type === 'itemCount'">
                    <span>+{{ (synergyEffect.bonus * 100).toFixed(0) }}% when equipped with
                        {{ synergyEffect.condition.minCount }}+
                        {{ formatTypes(synergyEffect.condition.value) }} items</span>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'
import { itemManager, type ItemDefinition } from '../managers/itemManager'

const props = defineProps<{
    item: ItemDefinition
}>()

const store = useStore()

const synergyEffect = computed(() => props.item.synergyEffect)
const synergyBonus = computed(() => store.calculateSynergyBonus(props.item))

const getItemName = (itemId: string) => {
    return itemManager.getItem(itemId)?.name ?? itemId
}

const formatTypes = (types: string | string[]) => {
    const typeArray = Array.isArray(types) ? types : [types]
    return typeArray
        .map(t => t.charAt(0).toUpperCase() + t.slice(1))
        .join(' or ')
}
</script>