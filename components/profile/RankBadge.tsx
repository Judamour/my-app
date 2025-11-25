import { RankInfo } from '@/lib/badges'

interface RankBadgeProps {
  rankInfo: RankInfo
  level: number
  showLevel?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function RankBadge({
  rankInfo,
  level,
  showLevel = true,
  size = 'medium',
}: RankBadgeProps) {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  }

  if (rankInfo.rank === 'NONE') {
    return null
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-gradient-to-r ${rankInfo.color} text-white font-bold rounded-full shadow-lg`}
    >
      <span>{rankInfo.icon}</span>
      <span>{rankInfo.name}</span>
      {showLevel && <span className="opacity-80">• Niv. {level}</span>}
    </div>
  )
}
