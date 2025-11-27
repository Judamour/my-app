import { ReactNode } from 'react'
import { SkeletonCard, SkeletonList, SkeletonTable } from './Skeleton'

interface LoadingWrapperProps {
  loading: boolean
  children: ReactNode
  skeleton?: 'card' | 'list' | 'table' | ReactNode
  count?: number
}

export default function LoadingWrapper({
  loading,
  children,
  skeleton = 'card',
  count = 3,
}: LoadingWrapperProps) {
  if (!loading) return <>{children}</>

  if (typeof skeleton !== 'string') {
    return <>{skeleton}</>
  }

  switch (skeleton) {
    case 'list':
      return <SkeletonList count={count} />
    case 'table':
      return <SkeletonTable rows={count} />
    case 'card':
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
  }
}