'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Star, ShieldCheck, Heart } from 'lucide-react'

// Imagens reais locais da pasta public/assets/hero
const heroLocalImages = [
  {
    id: 1,
    url: '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.29.jpeg',
    title: 'Atelier de Penteados & Visagismo',
    subtitle: 'Transformação capilar de autor com acabamento impecável',
    tag: 'Haute Coiffure',
  },
  {
    id: 2,
    url: '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.30.jpeg',
    title: 'Tranças Nagô & Cuidados Afro',
    subtitle: 'Estilo contemporâneo e saúde capilar avançada',
    tag: 'Arte & Cultura',
  },
  {
    id: 3,
    url: '/assets/hero/WhatsApp%20Image%202026-09-04%20at%2018.21.32.jpeg',
    title: 'Estética Sensorial & Glow',
    subtitle: 'Experiência relaxante de beleza e bem-estar',
    tag: 'Estética Premium',
  },
]

export default function SalonHeroGallery() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroLocalImages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const current = heroLocalImages[index]

  return (
    <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden rounded-[3rem] border border-rose-200/80 bg-stone-950 shadow-2xl shadow-rose-500/20 group">
      {/* Imagem de Fundo com Transição Parallax & Zoom Deslumbrante */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={current.url}
            alt={current.title}
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Sombreamento Cineastras em Degradê de Luxo */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-stone-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-rose-950/40 via-transparent to-transparent" />

      {/* Badge Flutuante no Topo */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-rose-300/30 bg-stone-950/60 px-4 py-1.5 backdrop-blur-xl text-white shadow-lg">
        <Sparkles className="size-4 text-rose-300 animate-pulse" />
        <span className="text-xs font-bold tracking-wider text-rose-100 uppercase">{current.tag}</span>
      </div>

      {/* Indicador de Transição Automática em Vidro */}
      <div className="absolute right-6 top-6 z-10 rounded-full border border-white/20 bg-stone-950/50 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-stone-200 flex items-center gap-2">
        <span className="size-2 rounded-full bg-rose-500 animate-ping" />
        <span>{index + 1} / {heroLocalImages.length}</span>
      </div>

      {/* Descrição Deslumbrante & Navegação no Rodapé da Imagem */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
        <motion.div
          key={`text-${current.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md"
        >
          <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-widest">Atelier de Beleza SGS</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mt-1 leading-tight">{current.title}</h3>
          <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">{current.subtitle}</p>
        </motion.div>

        {/* Barras de Progresso & Controlos Manuais */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {heroLocalImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === i ? 'w-8 bg-gradient-to-r from-rose-500 to-pink-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIndex((prev) => (prev - 1 + heroLocalImages.length) % heroLocalImages.length)}
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-stone-950/60 backdrop-blur-md text-white transition hover:bg-rose-600 hover:border-rose-500"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => setIndex((prev) => (prev + 1) % heroLocalImages.length)}
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-stone-950/60 backdrop-blur-md text-white transition hover:bg-rose-600 hover:border-rose-500"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
