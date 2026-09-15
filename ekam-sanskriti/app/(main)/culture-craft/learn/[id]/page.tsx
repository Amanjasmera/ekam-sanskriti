'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function CourseDetailsPage() {
  const params = useParams()
  const { id } = params as { id: string }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/culture-craft" className="inline-flex items-center gap-2 text-orange-600 hover:underline mb-8 font-medium">
          <ChevronLeft size={20} /> Back
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Course Details</h1>
          <p className="text-gray-500 mb-8">Course ID: {id}</p>
          <p className="text-gray-600">This is a placeholder page for the learning course details.</p>
        </div>
      </div>
    </div>
  )
}
