import { defineStore } from 'pinia'
import BigNumber from 'bignumber.js'
import { useStore } from '../store'
import { itemManager, type ItemWithCombatStats } from '../managers/itemManager'

export interface Boss {
  id: number
  name: string
  health: number
  maxHealth: number
  attack: number
  defense: number
  rewards: {
    coins: number
    experience: number
  }
}

export interface BossSaveData {
  currentBoss: Boss | null
  highestBossDefeated: number
  selectedBossLevel: number
  autoProgress: boolean
  currentPlayerHealth: number
}

export const useBossStore = defineStore('boss', {
  state: () => ({
    currentBoss: null as Boss | null,
    baseStats: {
      health: 100,
      attack: 10,
      defense: 5,
    },
    bossMultiplier: 1.5,
    fightInterval: null as NodeJS.Timer | null,
    highestBossDefeated: 0,
    selectedBossLevel: 1,
    autoProgress: false,
    currentPlayerHealth: 100,
  }),

  actions: {
    generateBoss(level: number): Boss {
      const multiplier = Math.pow(this.bossMultiplier, level - 1)
      const health = Math.floor(this.baseStats.health * multiplier)
      const attack = Math.floor(this.baseStats.attack * multiplier)
      const defense = Math.floor(this.baseStats.defense * multiplier)

      this.currentBoss = {
        id: level,
        name: `Boss ${level}`,
        health: health,
        maxHealth: health,
        attack: attack,
        defense: defense,
        rewards: {
          coins: Math.floor(50 * multiplier),
          experience: Math.floor(25 * Math.pow(level, 1.2)),
        },
      }

      return this.currentBoss
    },

    selectBossLevel(level: number) {
      const maxLevel = this.highestBossDefeated + 1
      this.selectedBossLevel = Math.min(maxLevel, Math.max(1, level))

      const wasRunning = this.isFighting
      if (wasRunning) {
        this.stopFighting()
      }

      this.generateBoss(this.selectedBossLevel)

      if (wasRunning) {
        this.startFighting()
      }
    },

    toggleAutoProgress() {
      this.autoProgress = !this.autoProgress
    },

    startFighting() {
      if (this.fightInterval) return

      if (!this.currentBoss) {
        this.generateBoss(this.selectedBossLevel)
      }

      this.resetHealth()

      this.fightInterval = setInterval(() => {
        this.processFight()
      }, 1000)
    },

    stopFighting() {
      if (this.fightInterval) {
        clearInterval(this.fightInterval)
        this.fightInterval = null
      }
    },

    calculatePlayerStats() {
      const store = useStore()
      let totalAttack = 0
      let totalDefense = 0
      let totalHealth = 100 // Base health

      store.equippedItems.forEach(item => {
        const itemWithStats = item as ItemWithCombatStats
        if (itemWithStats.combatStats) {
          totalAttack += itemWithStats.combatStats.attack
          totalDefense += itemWithStats.combatStats.defense
          totalHealth += itemWithStats.combatStats.health
        }
      })

      return {
        attack: totalAttack,
        defense: totalDefense,
        health: totalHealth,
      }
    },

    processFight() {
      if (!this.currentBoss) return

      const playerStats = this.calculatePlayerStats()

      const bossDamage = Math.max(1, this.currentBoss.attack - playerStats.defense)
      this.currentPlayerHealth -= bossDamage

      if (this.currentPlayerHealth <= 0) {
        this.stopFighting()
        this.resetHealth()
        return
      }

      const playerDamage = Math.max(1, playerStats.attack - this.currentBoss.defense)
      this.currentBoss.health -= playerDamage

      if (this.currentBoss.health <= 0) {
        const store = useStore()
        store.coins = store.coins.plus(this.currentBoss.rewards.coins)
        this.distributeExperience(this.currentBoss.rewards.experience)

        if (this.currentBoss.id > this.highestBossDefeated) {
          this.highestBossDefeated = this.currentBoss.id
        }

        if (this.autoProgress && this.selectedBossLevel < this.maxSelectableBossLevel) {
          this.selectedBossLevel++
        }

        this.generateBoss(this.selectedBossLevel)
        this.resetHealth()
      }
    },

    distributeExperience(experience: number) {
      const store = useStore()

      // Get unique combat items by ID
      const uniqueCombatItems = store.equippedItems.reduce((acc, item) => {
        if ((item as ItemWithCombatStats).combatStats) {
          // Only keep the first instance of each item
          if (!acc.some(existingItem => existingItem.id === item.id)) {
            acc.push(item as ItemWithCombatStats)
          }
        }
        return acc
      }, [] as ItemWithCombatStats[])

      if (uniqueCombatItems.length === 0) return

      const experiencePerItem = Math.floor(experience / uniqueCombatItems.length)

      uniqueCombatItems.forEach(item => {
        // Find all instances of this item in equipped items
        const allInstances = store.equippedItems.filter(
          equippedItem => equippedItem.id === item.id
        ) as ItemWithCombatStats[]

        // Update experience and stats for all instances
        allInstances.forEach(instance => {
          this.addExperienceToItem(instance, experiencePerItem)
        })
      })
    },

    addExperienceToItem(item: ItemWithCombatStats, experience: number) {
      item.combatStats.experience += experience

      while (item.combatStats.experience >= item.combatStats.requiredExperience) {
        item.combatStats.experience -= item.combatStats.requiredExperience
        item.combatStats.level++

        // Update required experience for next level
        item.combatStats.requiredExperience = itemManager.calculateRequiredExperience(item.combatStats.level)

        // Update stats based on new level
        const baseStats = itemManager.getItem(item.id)?.combatStats
        if (baseStats) {
          const newStats = itemManager.calculateStatsForLevel(baseStats, item.combatStats.level)
          item.combatStats.attack = newStats.attack
          item.combatStats.defense = newStats.defense
          item.combatStats.health = newStats.health
        }
      }
    },

    resetHealth() {
      if (!this.currentBoss) return
      this.currentBoss.health = this.currentBoss.maxHealth
      this.currentPlayerHealth = this.calculatePlayerStats().health
    },

    getSaveData(): BossSaveData {
      return {
        currentBoss: this.currentBoss,
        highestBossDefeated: this.highestBossDefeated,
        selectedBossLevel: this.selectedBossLevel,
        autoProgress: this.autoProgress,
        currentPlayerHealth: this.currentPlayerHealth,
      }
    },

    loadSaveData(data: BossSaveData) {
      this.highestBossDefeated = data.highestBossDefeated
      this.selectedBossLevel = data.selectedBossLevel ?? 1
      this.autoProgress = data.autoProgress ?? false
      this.currentPlayerHealth = data.currentPlayerHealth ?? this.calculatePlayerStats().health

      if (data.currentBoss) {
        this.currentBoss = data.currentBoss
      } else {
        this.generateBoss(this.selectedBossLevel)
      }
    },
  },

  getters: {
    isFighting: state => state.fightInterval !== null,
    maxSelectableBossLevel: state => state.highestBossDefeated + 1,

    canFight(): boolean {
      const store = useStore()
      return store.equippedItems.some(item => {
        const definition = store.getItemDefinition(item.id)
        return definition?.combatStats !== undefined
      })
    },

    playerHealthPercent(): number {
      const maxHealth = this.calculatePlayerStats().health
      return (this.currentPlayerHealth / maxHealth) * 100
    },
  },
})
