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

            <div class="flex items-center justify-between">
                <span class="text-sm dark:text-gray-300">Dark Mode</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="isDarkMode" @change="toggleDarkMode" class="sr-only peer">
                    <div
                        class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                    </div>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import SaveLoadMenu from './SaveLoadMenu.vue'
import { ref, onMounted } from 'vue'

const store = useStore()

const isDarkMode = ref(false)

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('darkMode', 'true')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('darkMode', 'false')
    }
}

onMounted(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
        isDarkMode.value = true
        document.documentElement.classList.add('dark')
    }
})
</script>