'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Video, Sparkles, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { MediaItemData } from '@/lib/salons-data'

export default function FuturisticMediaGallery({ mediaItems }: { mediaItems: MediaItemData[] }) {
  const [activeMedia, setActiveMedia] = useState<MediaItemData | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!mediaItems || mediaItems.length === 0) return null

  const activeItem = mediaItems[activeIndex]

  return (
    <div className="relative py-10">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end mb-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-rose-500 uppercase flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Galeria Futurista & Vídeos Demonstrativos
          </span>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal">Demonstração do Nosso Trabalho</h2>
        </div>
        <p className="text-xs text-stone-500">Exibição interativa estilo iPhone com profundidade e vídeos em HD.</p>
      </div>

      {/* GALERIA FUTURISTA ESTILO IPHONE (IMAGEM/VÍDEO PRINCIPAL COM EFEITO PARALLAX E MINIATURAS FLUTUANTES) */}
      <div className="relative h-[450px] sm:h-[540px] w-full overflow-hidden rounded-[3rem] border border-rose-200/80 bg-stone-950 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full"
          >
            {activeItem.type === 'video' ? (
              <video
                src={activeItem.url}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={activeItem.url}
                alt={activeItem.title}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

        {/* ETIQUETA VÍDEO / FOTO */}
        <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-stone-950/70 px-4 py-1.5 backdrop-blur-md text-white">
          {activeItem.type === 'video' ? (
            <>
              <Video className="size-4 text-rose-400 animate-pulse" />
              <span className="text-xs font-bold">VÍDEO DEMONSTRATIVO HD</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-rose-300" />
              <span className="text-xs font-bold">{activeItem.category || 'FOTO DE AUTOR'}</span>
            </>
          )}
        </div>

        {/* CONTROLO DAS MINIATURAS ESTILO IPHONE CAROUSEL 3D NO RODAPÉ */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h3 className="font-serif text-2xl font-normal">{activeItem.title}</h3>
            <p className="text-xs text-stone-300">Item {activeIndex + 1} de {mediaItems.length}</p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto p-2 bg-stone-950/70 backdrop-blur-xl rounded-full border border-white/20">
            {mediaItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative size-12 rounded-full overflow-hidden border-2 transition-all ${
                  activeIndex === idx ? 'border-rose-500 scale-110 shadow-lg shadow-rose-500/40' : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-rose-950 text-white text-[10px] font-bold">
                    <Play className="size-4 text-rose-300" />
                  </div>
                ) : (
                  <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
