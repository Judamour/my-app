'use client'

import { useState } from 'react'

interface AccordionProps {
  title: string
  count: number
  icon: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Accordion({ title, count, icon, defaultOpen = false, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
            <span>{icon}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            {title}
          </h2>
          <span className="px-2.5 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
            {count}
          </span>
        </div>
        
        {/* Chevron animé */}
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenu avec animation */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  )
}