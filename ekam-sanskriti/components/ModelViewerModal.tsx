/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { X, Box, RotateCcw, Sparkles } from 'lucide-react'

interface ModelViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  modelUrl?: string
  panoramaUrl?: string
}

export default function ModelViewerModal({
  isOpen,
  onClose,
  title,
  modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  panoramaUrl,
}: ModelViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'3d' | '360'>('3d')
  

  // Inject model-viewer script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
      document.head.appendChild(script)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 text-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-5 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
              <Box size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif">{title} — 3D & AR Explorer</h3>
              <p className="text-xs text-orange-400">Interactive 360° Inspection & Augmented Reality</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-gray-700/60 p-1 rounded-xl flex gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === '3d' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                3D Model / AR
              </button>
              <button
                onClick={() => setActiveTab('360')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === '360' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                360° Panorama
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {activeTab === '3d' ? (
            <div className="w-full h-full relative">
              {/* @ts-expect-error - description required */}
              <model-viewer
                src={modelUrl}
                alt={`3D Model of ${title}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{ width: '100%', height: '100%', backgroundColor: '#050505' }}
              >
                <button
                  slot="ar-button"
                  className="absolute bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm transition-transform hover:scale-105"
                >
                  <Sparkles size={16} /> View in Your Space (AR)
                </button>
              {/* @ts-expect-error - description required */}
              </model-viewer>

              <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-gray-300 border border-gray-700 flex items-center gap-2 pointer-events-none">
                <RotateCcw size={13} className="text-orange-400" /> Click & Drag to Rotate | Scroll to Zoom
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
              <img
                src={panoramaUrl || 'https://images.unsplash.com/photo-1564507592227-884814576189'}
                alt={`${title} 360 Panorama`}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col items-center justify-center p-6 text-center">
                <h4 className="text-2xl font-bold font-serif mb-2">{title} 360° View</h4>
                <p className="text-sm text-gray-300 max-w-md mb-6">
                  Immersive 360-degree high-definition panoramic capture of the monument grounds.
                </p>
                <span className="bg-orange-600/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                  Panoramic Surround Mode
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800/80 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
          <span>Powered by WebGL 3D Engine & Google Model-Viewer</span>
          <button
            onClick={onClose}
            className="text-orange-400 font-bold hover:underline"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
