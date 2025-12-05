'use client'

import { useEffect, useState } from 'react'
import { RankInfo } from '@/lib/badges'

interface RankProgressProps {
  currentXP: number
  currentLevel: number
  badgeCount: number
  rankInfo: RankInfo
}

const RANK_REQUIREMENTS = [
  { rank: 'BRONZE', name: 'Bronze', level: 2, badges: 2, icon: '🟤', color: 'from-amber-600 to-amber-700' },
  { rank: 'SILVER', name: 'Argent', level: 5, badges: 5, icon: '🩶', color: 'from-gray-400 to-gray-500' },
  { rank: 'GOLD', name: 'Or', level: 10, badges: 8, icon: '🟡', color: 'from-yellow-400 to-yellow-600' },
  { rank: 'PLATINUM', name: 'Platine', level: 15, badges: 12, icon: '💠', color: 'from-cyan-400 to-blue-500' },
  { rank: 'DIAMOND', name: 'Diamant', level: 20, badges: 15, icon: '💎', color: 'from-purple-500 via-pink-500 to-yellow-400' },
]

export default function RankProgress({ currentXP, currentLevel, badgeCount, rankInfo }: RankProgressProps) {
  const [syncing, setSyncing] = useState(false)

  // Trouver le prochain rang
  const currentRankIndex = RANK_REQUIREMENTS.findIndex(r => r.rank === rankInfo.rank)
  const nextRank = RANK_REQUIREMENTS[currentRankIndex + 1]

  // Calculer la progression vers le prochain rang
  const levelProgress = nextRank ? Math.min((currentLevel / nextRank.level) * 100, 100) : 100
  const badgeProgress = nextRank ? Math.min((badgeCount / nextRank.badges) * 100, 100) : 100

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/badges/sync', { method: 'POST' })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur sync:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">🏆 Progression de rang</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
        >
          {syncing ? '⏳ Sync...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Rang actuel */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${rankInfo.gradient} flex items-center justify-center`}>
          <span className="text-3xl">{rankInfo.icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{rankInfo.name}</p>
          <p className="text-sm text-gray-500">
            Niveau {currentLevel} • {badgeCount} badges • {currentXP} XP
          </p>
        </div>
      </div>

      {/* Progression vers prochain rang */}
      {nextRank ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Prochain rang :</span>
            <span className="font-semibold">{nextRank.icon} {nextRank.name}</span>
          </div>

          {/* Barre niveau */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Niveau</span>
              <span>{currentLevel} / {nextRank.level}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${nextRank.color} transition-all duration-500`}
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Barre badges */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Badges</span>
              <span>{badgeCount} / {nextRank.badges}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${nextRank.color} transition-all duration-500`}
                style={{ width: `${badgeProgress}%` }}
              />
            </div>
          </div>

          {/* Indications */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-600">
              {currentLevel < nextRank.level && (
                <span>📈 Il te faut encore <strong>{nextRank.level - currentLevel}</strong> niveau{nextRank.level - currentLevel > 1 ? 'x' : ''}</span>
              )}
              {currentLevel >= nextRank.level && badgeCount < nextRank.badges && (
                <span>🏅 Il te faut encore <strong>{nextRank.badges - badgeCount}</strong> badge{nextRank.badges - badgeCount > 1 ? 's' : ''}</span>
              )}
              {currentLevel >= nextRank.level && badgeCount >= nextRank.badges && (
                <span className="text-green-600 font-medium">✨ Tu remplis les conditions ! Clique sur Actualiser</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
          <span className="text-2xl">👑</span>
          <p className="font-semibold text-gray-900 mt-2">Rang maximum atteint !</p>
          <p className="text-sm text-gray-600">Tu es au sommet de la hiérarchie</p>
        </div>
      )}

      {/* Liste des rangs */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Tous les rangs</p>
        <div className="flex justify-between">
          {RANK_REQUIREMENTS.map((rank, index) => {
            const isUnlocked = currentRankIndex >= index
            const isCurrent = rankInfo.rank === rank.rank
            
            return (
              <div 
                key={rank.rank}
                className={`flex flex-col items-center ${isUnlocked ? '' : 'opacity-40'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCurrent ? `bg-gradient-to-br ${rank.color} ring-2 ring-offset-2 ring-gray-900` : 'bg-gray-100'
                }`}>
                  <span className="text-lg">{rank.icon}</span>
                </div>
                <span className={`text-xs mt-1 ${isCurrent ? 'font-bold' : ''}`}>{rank.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}