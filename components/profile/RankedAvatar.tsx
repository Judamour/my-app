import { RankInfo } from '@/lib/badges'
import Image from 'next/image'

interface RankedAvatarProps {
  firstName: string
  lastName: string
  rankInfo: RankInfo
  showBorder?: boolean
  size?: 'small' | 'medium' | 'large'
  avatar?: string | null
  showAvatar?: boolean
}

export default function RankedAvatar({
  firstName,
  lastName,
  rankInfo,
  showBorder = true,
  size = 'large',
  avatar = null,
  showAvatar = true,
}: RankedAvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`
  const usePhoto = avatar && showAvatar

  // Tailles selon le prop
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-20 h-20 text-2xl',
    large: 'w-28 h-28 text-3xl',
  }

  const paddingClasses = {
    small: 'p-0.5',
    medium: 'p-0.5',
    large: 'p-1',
  }

  // 🆕 Avatar content en JSX (pas en fonction)
  const avatarContent = usePhoto ? (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg relative`}>
      <Image
        src={avatar}
        alt={`${firstName} ${lastName}`}
        fill
        className="object-cover"
         sizes="(max-width: 768px) 100vw, 200px" 
      />
    </div>
  ) : (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}
    >
      {initials}
    </div>
  )

  // Si pas de bordure, afficher avatar simple
  if (!showBorder || rankInfo.rank === 'NONE') {
    return avatarContent
  }

  // Avatar avec bordure selon le rang
  if (rankInfo.rank === 'DIAMOND') {
    // 💎 DIAMANT : Effet spécial avec glow
    return (
      <div className="relative">
        {/* Glow animé */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${rankInfo.gradient} blur-md opacity-50 animate-pulse`}
        />

        {/* Bordure double */}
        <div
          className={`relative ${paddingClasses[size]} rounded-full bg-gradient-to-br ${rankInfo.gradient}`}
        >
          <div className={`${paddingClasses[size]} rounded-full bg-white`}>
            {avatarContent}
          </div>
        </div>

        {/* Badge rang */}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
          <span className="text-xl">{rankInfo.icon}</span>
        </div>
      </div>
    )
  }

  // 🏆 BRONZE, ARGENT, OR, PLATINE : Bordure simple
  return (
    <div className="relative">
      {/* Bordure colorée */}
      <div
        className={`${paddingClasses[size]} rounded-full bg-gradient-to-br ${rankInfo.color}`}
      >
        <div className={`${paddingClasses[size]} rounded-full bg-white`}>
          {avatarContent}
        </div>
      </div>

      {/* Badge rang */}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
        <span className={size === 'small' ? 'text-sm' : 'text-lg'}>
          {rankInfo.icon}
        </span>
      </div>
    </div>
  )
}