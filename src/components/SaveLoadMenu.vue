<template>
    <div class="flex items-center gap-4">
        <!-- Auto-save status -->
        <div class="text-sm text-gray-600">
            Last saved: {{ lastSavedText }}
        </div>

        <!-- Manual save/load buttons -->
        <div class="flex gap-2">
            <button @click="downloadSave" class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                Download Save
            </button>

            <label class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 cursor-pointer">
                Upload Save
                <input type="file" class="hidden" accept=".json" @change="handleFileUpload">
            </label>

            <button @click="resetGame" class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                Reset Game
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '../store'

const store = useStore()
const lastSavedText = ref('Never')

// Update last saved text
const updateLastSavedText = () => {
    const timestamp = localStorage.getItem('lastSaved')
    if (!timestamp) {
        lastSavedText.value = 'Never'
        return
    }

    const date = new Date(Number(timestamp))
    lastSavedText.value = date.toLocaleTimeString()
}

// Download save file
const downloadSave = () => {
    const saveData = store.getSaveData()
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `idle-pack-save-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// Handle save file upload
const handleFileUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const saveData = JSON.parse(e.target?.result as string)
            store.loadSaveData(saveData)
        } catch (error) {
            console.error('Failed to load save file:', error)
            alert('Invalid save file')
        }
    }
    reader.readAsText(file)
}

// Reset game
const resetGame = () => {
    if (!confirm('Are you sure you want to reset all progress?')) return
    store.resetGame()
}

// Update last saved text when component mounts
onMounted(() => {
    updateLastSavedText()
    // Listen for save events
    window.addEventListener('gameSaved', updateLastSavedText)
})
</script>