'use client'

interface RevenueChartProps {
  data: { month: string; value: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Pas encore de données
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-4">
      {/* Graphique */}
      <div className="h-48 flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const heightPx = maxValue > 0 ? (item.value / maxValue) * 192 : 8 // 192px = h-48
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Barre */}
              <div className="w-full relative group cursor-pointer flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    item.value > 0
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500'
                      : 'bg-gray-200'
                  }`}
                  style={{ 
                    height: `${heightPx}px`,
                    minHeight: '8px'
                  }}
                />
                
                {/* Tooltip */}
                {item.value > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(item.value)}
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className="text-xs text-gray-600 font-medium capitalize">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500 to-emerald-400" />
          <span className="text-gray-600">Revenus reçus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span className="text-gray-600">Aucun revenu</span>
        </div>
      </div>
    </div>
  )
}