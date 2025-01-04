<template>
    <div class="space-y-6">
        <h2 class="text-xl sm:text-2xl mb-4">Settings</h2>

        <div class="space-y-4">
            <!-- Visual Settings -->
            <div class="border rounded-lg p-4">
                <h3 class="font-bold mb-3">Visual Settings</h3>
                <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" :checked="store.settings.showAnimations" @change="store.toggleAnimations"
                            class="w-4 h-4">
                        <span>Show Animations</span>
                    </label>
                </div>
            </div>

            <!-- Save Management -->
            <div class="border rounded-lg p-4">
                <h3 class="font-bold mb-3">Save Management</h3>
                <SaveLoadMenu />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import SaveLoadMenu from './SaveLoadMenu.vue'

const store = useStore()
</script>