<template>
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="[
        type === 'rick' ? 'bg-cyan-100 text-cyan-800' :
            type === 'morty' ? 'bg-orange-100 text-orange-800' :
                type === 'mystical' ? 'bg-indigo-100 text-indigo-800' :
                    type === 'egg' ? 'bg-yellow-100 text-yellow-800' :
                        type === 'psychic' ? 'bg-pink-100 text-pink-800' :
                            type === 'dragon' ? 'bg-red-100 text-red-800' :
                                type === 'colony' ? 'bg-lime-100 text-lime-800' :
                                    type === 'fakemon' ? 'bg-emerald-100 text-emerald-800' :
                                        'bg-gray-100 text-gray-800'
    ]">
        {{ formatType(type) }}
    </span>
</template>

<script setup lang="ts">
import type { ItemType } from '../managers/itemManager'

defineProps<{
    type: ItemType
}>()

const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
}
</script>