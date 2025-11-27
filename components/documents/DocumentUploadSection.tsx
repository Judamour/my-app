'use client'

import { useState } from 'react'
import DocumentUpload from './DocumentUpload'
import DocumentList from './DocumentList'

interface DocumentUploadSectionProps {
  leaseId: string
}

export default function DocumentUploadSection({
  leaseId,
}: DocumentUploadSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <DocumentUpload leaseId={leaseId} onUploadComplete={handleUploadComplete} />

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📁 Documents uploadés
        </h3>
        <DocumentList leaseId={leaseId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}