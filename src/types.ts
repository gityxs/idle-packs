import BigNumber from 'bignumber.js'

export interface Item {
  id: string
  name: string
  value: BigNumber
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  amount: number
}

export interface Upgrade {
  id: string
  name: string
  description: string
  level: number
  maxLevel?: number
  // Add other properties as needed
}
