import { getXPForNextLevel } from '@/lib/badges'

interface XPProgressBarProps {
  currentXP: number
  currentLevel: number
}

export default function XPProgressBar({
  currentXP,
  currentLevel,
}: XPProgressBarProps) {
  const xpForCurrentLevel = currentLevel ** 2 * 100
  const xpForNextLevel = getXPForNextLevel(currentLevel)
  const xpInCurrentLevel = currentXP - xpForCurrentLevel
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel

  const progressPercent = Math.min(
    (xpInCurrentLevel / xpNeededForNextLevel) * 100,
    100
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">Niveau {currentLevel}</span>
        <span className="text-gray-500">
          {xpInCurrentLevel} / {xpNeededForNextLevel} XP
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        {xpNeededForNextLevel - xpInCurrentLevel} XP pour le niveau{' '}
        {currentLevel + 1}
      </p>
    </div>
  )
}
