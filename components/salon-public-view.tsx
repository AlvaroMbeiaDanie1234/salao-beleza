'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { SalonData, ServiceData, ProductData, initialProducts, initialServices } from '@/lib/salons-data'
import {
  MapPin,
  Star,
  Scissors,
  Sparkles,
  Phone,
  Clock,
  CheckCircle,
  Coffee,
  User,
  Crown,
  Instagram,
  Facebook,
  Mail,
  X,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  PackageCheck,
  Sparkle,
  Layout,
  Layers,
  Heart,
  ImageIcon,
  Video,
  Menu,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import FuturisticMediaGallery from '@/components/futuristic-media-gallery'
import { createClient } from '@/lib/supabase/client'

const carouselImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1600&q=85',
]

function formatKz(amount: number) {
  return amount.toLocaleString('pt-AO') + ' Kz'
}

export default function SalonPublicView({
  salon: initialSalon,
  services: initialServicesList,
}: {
  salon: SalonData
  services: ServiceData[]
}) {
  const [salon, setSalon] = useState<SalonData>(initialSalon)
  const [services, setServices] = useState<ServiceData[]>(initialServicesList)
  const supabase = createClient()
  const [products, setProducts] = useState<ProductData[]>(initialProducts)

  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [productOrderConfirmed, setProductOrderConfirmed] = useState(false)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [bookingTime, setBookingTime] = useState('10:30')
  const [activeTab, setActiveTab] = useState<'servicos' | 'produtos' | 'estudio3d' | 'equipa' | 'galeria'>('servicos')

  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  useEffect(() => {
    async function loadPublicDataFromSupabase() {
      try {
        const [salRes, prodRes, servRes] = await Promise.all([
          supabase.from('salons').select('*').eq('id', initialSalon.id).single(),
          supabase.from('products').select('*').eq('salon_id', initialSalon.id),
          supabase.from('services').select('*').eq('salon_id', initialSalon.id),
        ])

        if (!salRes.error && salRes.data) {
          const salData = salRes.data
          setSalon((prev) => ({
            ...prev,
            name: salData.name || prev.name,
            tagline: salData.tagline || prev.tagline,
            city: salData.city || prev.city,
            address: salData.address || prev.address,
            phone: salData.phone || prev.phone,
            email: salData.email || prev.email,
            description: salData.description || prev.description,
            coverImage: salData.cover_image || prev.coverImage,
            avatarImage: salData.avatar_image || prev.avatarImage,
            heroVideoUrl: salData.hero_video_url,
            heroMediaType: salData.hero_media_type,
            gallery: salData.gallery || prev.gallery,
          }))
        }

        if (!prodRes.error && prodRes.data) {
          setProducts(prodRes.data.map((p) => ({
            id: p.id,
            salon_id: p.salon_id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            image: p.image,
            category: p.category || 'Geral',
            inStock: p.in_stock ?? true,
          })))
        }

        if (!servRes.error && servRes.data) {
          setServices(servRes.data.map((s) => ({
            id: s.id,
            salon_id: s.salon_id,
            name: s.name,
            description: s.description || '',
            duration_minutes: Number(s.duration_minutes || 60),
            price: Number(s.price),
            image: s.image,
            videoUrl: s.video_url,
            mediaType: s.media_type,
            active: s.active ?? true,
            category: s.category || 'Geral',
            popular: s.popular ?? false,
          })))
        }
      } catch (err) {
        console.error('Erro ao sincronizar dados do Supabase:', err)
      }
    }

    loadPublicDataFromSupabase()
    const dataSyncInterval = setInterval(loadPublicDataFromSupabase, 8000)

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % carouselImages.length)
    }, 5000)

    return () => {
      clearInterval(dataSyncInterval)
      clearInterval(interval)
    }
  }, [initialSalon.id, initialSalon.slug])

  async function sendSmsNotification(phoneNumber: string, messageBody: string) {
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, messageBody }),
      })
    } catch (err) {
      console.error('Erro ao disparar SMS:', err)
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService) return

    const newBooking: BookingData = {
      id: 'booking-' + Date.now(),
      salon_id: salon.id,
      service_name: selectedService.name,
      date: bookingDate || new Date().toISOString().split('T')[0],
      time: bookingTime || '10:00',
      client_name: clientName,
      client_phone: clientPhone,
      client_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'Pendente',
    }

    try {
      await supabase.from('bookings').insert([{
        id: newBooking.id,
        salon_id: newBooking.salon_id,
        service_name: newBooking.service_name,
        date: newBooking.date,
        time: newBooking.time,
        client_name: newBooking.client_name,
        client_phone: newBooking.client_phone,
        client_avatar: newBooking.client_avatar,
        status: newBooking.status,
      }])
    } catch (err) {
      console.error('Erro ao registar agendamento no Supabase:', err)
    }

    // 1. Enviar SMS de notificação para o proprietário do salão
    if (salon.phone) {
      const msgDono = `[SGS] Nova marcacao no salao ${salon.name}! Cliente: ${clientName} (${clientPhone}). Servico: ${selectedService.name} em ${newBooking.date} as ${newBooking.time}.`
      sendSmsNotification(salon.phone, msgDono)
    }

    // 2. Enviar SMS de notificação para o cliente
    if (clientPhone) {
      const msgCliente = `[${salon.name}] Ola ${clientName}, o seu agendamento para ${selectedService.name} em ${newBooking.date} as ${newBooking.time} foi recebido e aguarda confirmacao.`
      sendSmsNotification(clientPhone, msgCliente)
    }

    setConfirmed(true)
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } })
  }

  async function handleOrderProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return

    // 1. Enviar SMS para o salão sobre a encomenda do produto
    if (salon.phone) {
      const msgDono = `[SGS] Nova encomenda de produto no salao ${salon.name}! Cliente: ${clientName} (${clientPhone}). Produto: ${selectedProduct.name} (${formatKz(selectedProduct.price)}).`
      sendSmsNotification(salon.phone, msgDono)
    }

    // 2. Enviar SMS para o cliente sobre a encomenda
    if (clientPhone) {
      const msgCliente = `[${salon.name}] Ola ${clientName}, a sua encomenda de ${selectedProduct.name} foi recebida. Entraremos em contacto para a entrega.`
      sendSmsNotification(clientPhone, msgCliente)
    }

    setProductOrderConfirmed(true)
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } })
  }

  const template = salon.templateId || 'luxe-pink'
  
  let bgMain = 'bg-[#fff5f7]'
  let textMain = 'text-stone-900'
  let navBg = 'bg-white/90'
  let cardBg = 'bg-white'
  let accentColor = salon.themeColor || '#e11d48'

  if (template === 'nordic-minimal') {
    bgMain = 'bg-[#fbf9f6]'
    navBg = 'bg-[#fbf9f6]/90'
    cardBg = 'bg-[#ffffff]'
    accentColor = salon.themeColor || '#1c1917'
  } else if (template === 'dark-glamour') {
    bgMain = 'bg-stone-950 text-stone-100'
    textMain = 'text-stone-100'
    navBg = 'bg-stone-900/90'
    cardBg = 'bg-stone-900 border-stone-800'
    accentColor = salon.themeColor || '#f472b6'
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className={`min-h-screen ${bgMain} ${textMain} ${salon.fontFamily === 'sans' ? 'font-sans' : 'font-serif'}`}>
      {/* TOP HEADER MODERNO E RESPONSIVO COM AS OPÇÕES SOLICITADAS E HAMBURGER MOBILE */}
      <nav className={`sticky top-0 z-40 border-b border-stone-200/50 ${navBg} px-4 sm:px-6 py-3.5 backdrop-blur-md md:px-12`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={salon.avatarImage} alt={salon.name} className="size-10 rounded-full object-cover border border-stone-200 shadow-sm" />
            <div>
              <span className="font-serif text-lg font-bold tracking-tight">{salon.name}</span>
              <p className="text-[10px] text-stone-400 font-medium">{salon.city}</p>
            </div>
          </div>

          {/* OPÇÕES EXIGIDAS NO HEADER DE FORMA MODERNA & ADAPTÁVEL PARA DESKTOP */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-stone-600">
            <button
              onClick={() => setActiveTab('servicos')}
              className={`transition hover:text-rose-600 ${activeTab === 'servicos' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}
            >
              Menu de Serviços
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`transition hover:text-rose-600 ${activeTab === 'produtos' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}
            >
              Produtos da Loja do Salão
            </button>
            <button
              onClick={() => setActiveTab('estudio3d')}
              className={`transition hover:text-rose-600 ${activeTab === 'estudio3d' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}
            >
              Galeria HD em Tempo Real (5s)
            </button>
            <button
              onClick={() => setActiveTab('equipa')}
              className={`transition hover:text-rose-600 ${activeTab === 'equipa' ? 'text-rose-600 border-b-2 border-rose-600 pb-1' : ''}`}
            >
              Equipa de Especialistas
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedService(services[0] || null)}
              style={{ backgroundColor: accentColor }}
              className="rounded-full px-6 py-2.5 text-xs font-bold text-white transition opacity-95 hover:opacity-100 shadow-md"
            >
              Agendar
            </button>

            {/* BOTÃO HAMBURGER MOBILE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-100 lg:hidden shadow-sm"
              aria-label="Abrir Menu Salão"
            >
              {mobileMenuOpen ? <X className="size-5 text-rose-600" /> : <Menu className="size-5 text-rose-600" />}
            </button>
          </div>
        </div>

        {/* MENU HAMBURGER DESDOBRÁVEL MOBILE DO SALÃO */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-stone-200/60 bg-white/95 px-6 py-5 shadow-2xl lg:hidden backdrop-blur-xl mt-3 rounded-2xl"
            >
              <div className="flex flex-col gap-3.5 text-sm font-bold text-stone-800">
                <button
                  onClick={() => {
                    setActiveTab('servicos')
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition ${activeTab === 'servicos' ? 'bg-rose-50 text-rose-700 font-extrabold' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  <span>Menu de Serviços</span>
                  <ChevronRight className="size-4 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('produtos')
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition ${activeTab === 'produtos' ? 'bg-rose-50 text-rose-700 font-extrabold' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  <span>Produtos da Loja do Salão</span>
                  <ChevronRight className="size-4 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('estudio3d')
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition ${activeTab === 'estudio3d' ? 'bg-rose-50 text-rose-700 font-extrabold' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  <span>Galeria HD em Tempo Real (5s)</span>
                  <ChevronRight className="size-4 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('equipa')
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition ${activeTab === 'equipa' ? 'bg-rose-50 text-rose-700 font-extrabold' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  <span>Equipa de Especialistas</span>
                  <ChevronRight className="size-4 text-stone-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO BANNER DO SALÃO (SUPORTE PARA VÍDEO E FOTO PERSONALIZADA) */}
      <section className="relative h-[420px] sm:h-[480px] w-full overflow-hidden bg-stone-950">
        {salon.heroMediaType === 'video' && salon.heroVideoUrl ? (
          <video
            src={salon.heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={salon.coverImage} alt={salon.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-stone-950/20" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl w-full px-6 pb-10 md:px-12 text-white">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
                <MapPin className="mr-1.5 inline size-3.5" />{salon.address}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-amber-400/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-stone-950">
                <Star className="size-3.5 fill-stone-950" /> {salon.rating} ({salon.reviewsCount} avaliações)
              </span>
            </div>

            <h1 className="mt-3 font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-tight text-white">
              {salon.name}
            </h1>
            <p className="mt-2 text-base sm:text-lg font-serif italic text-stone-200 max-w-xl">{salon.tagline}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedService(services[0] || null)}
                style={{ color: accentColor }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs font-bold transition hover:bg-stone-100 shadow-xl"
              >
                <Scissors className="size-4" /> Agendar Atendimento Online
              </button>
              <a
                href={`tel:${salon.phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 backdrop-blur-md px-5 py-3 text-xs font-semibold text-white transition hover:bg-black/60"
              >
                <Phone className="size-3.5" /> {salon.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE NAVEGAÇÃO DE ABAS MÓVEL E DESKTOP */}
      <section className="sticky top-[65px] z-30 border-b border-stone-200/50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-6 sm:gap-8 px-6 md:px-12 overflow-x-auto">
          {[
            { id: 'servicos', label: 'Menu de Serviços', icon: Scissors },
            { id: 'produtos', label: 'Produtos da Loja do Salão', icon: ShoppingBag },
            { id: 'estudio3d', label: 'Galeria HD em Tempo Real (5s)', icon: Sparkles },
            { id: 'equipa', label: 'Equipa de Especialistas', icon: User },
            { id: 'galeria', label: 'Galeria & Vídeos Futuristas', icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ borderColor: activeTab === tab.id ? accentColor : 'transparent', color: activeTab === tab.id ? accentColor : '#78716c' }}
              className="flex items-center gap-2 py-3.5 border-b-2 text-xs font-bold transition whitespace-nowrap"
            >
              <tab.icon className="size-4" /> {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:px-12">
        {/* ABA DE SERVIÇOS */}
        {activeTab === 'servicos' && (
          <div>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end border-b border-stone-200/40 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/60 px-3.5 py-1 text-[11px] font-bold text-rose-600 tracking-widest uppercase">
                  <Sparkles className="size-3 text-rose-500 animate-pulse" /> Haute Coiffure & Estética Avançada
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
                  Menu de Serviços Exclusivos
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100/70 rounded-full px-4 py-2 backdrop-blur-sm border border-stone-200/50">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Preços transparentes em Kwanzas (Kz) · Diagnóstico Incluído</span>
              </div>
            </div>

            {services.length === 0 ? (
              <div className="mt-12 rounded-3xl border border-dashed border-stone-300 p-12 text-center bg-stone-50/50">
                <Scissors className="mx-auto size-10 text-stone-400" />
                <p className="mt-3 text-sm font-semibold text-stone-700">Nenhum serviço cadastrado para este salão no momento.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {services.map((srv) => (
                  <motion.div
                    key={srv.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`group relative overflow-hidden rounded-[2.5rem] border border-stone-200/90 ${cardBg} shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-rose-400/80 flex flex-col justify-between`}
                  >
                    {/* MEDIA HEADER COM VISUALIZAÇÃO COMPLETA SEM CORTES (CONTAIN & FULL ASPECT) */}
                    {srv.mediaType === 'video' && srv.videoUrl ? (
                      <div className="relative w-full overflow-hidden bg-stone-950 flex items-center justify-center p-2 group/media min-h-[260px] max-h-[420px]">
                        <video
                          src={srv.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-auto max-h-[400px] object-contain rounded-2xl transition-transform duration-500 group-hover/media:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20 pointer-events-none rounded-2xl" />
                        
                        <span className="absolute top-4 left-4 rounded-full bg-rose-600/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20 z-10">
                          <Video className="size-3.5 animate-pulse" /> Vídeo HD Completo
                        </span>

                        {srv.popular && (
                          <span className="absolute top-4 right-4 rounded-full bg-amber-500/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg border border-amber-300/30 flex items-center gap-1 z-10">
                            <Sparkles className="size-3" /> Serviço Popular
                          </span>
                        )}

                        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white z-10">
                          <span className="rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 text-stone-200">
                            <Clock className="size-3.5 text-rose-400" /> {srv.duration_minutes} minutos
                          </span>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Preço do Serviço</span>
                            <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md">
                              {formatKz(srv.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : srv.image ? (
                      <div className="relative w-full overflow-hidden bg-stone-900 flex items-center justify-center p-2 group/media min-h-[240px] max-h-[380px]">
                        <img
                          src={srv.image}
                          alt={srv.name}
                          className="w-full h-auto max-h-[360px] object-contain rounded-2xl transition-transform duration-500 group-hover/media:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20 pointer-events-none rounded-2xl" />
                        
                        {srv.popular && (
                          <span className="absolute top-4 right-4 rounded-full bg-rose-600/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg border border-white/20 flex items-center gap-1 z-10">
                            <Sparkles className="size-3" /> Serviço em Destaque
                          </span>
                        )}

                        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white z-10">
                          <span className="rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 text-stone-200">
                            <Clock className="size-3.5 text-rose-400" /> {srv.duration_minutes} minutos
                          </span>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Preço do Serviço</span>
                            <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md">
                              {formatKz(srv.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* DETALHES DO SERVIÇO & BOTÃO DE AGENDAMENTO */}
                    <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        {!srv.image && !srv.videoUrl && (
                          <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
                            <div>
                              {srv.popular && (
                                <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-bold text-rose-800 uppercase tracking-wider border border-rose-200 block w-fit mb-1">
                                  ★ Serviço Popular
                                </span>
                              )}
                              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                                <Clock className="size-3.5 text-rose-500" /> Duração: {srv.duration_minutes} minutos
                              </span>
                            </div>
                            <span className="font-serif text-2xl font-bold text-stone-900">{formatKz(srv.price)}</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-2xl font-medium tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                            {srv.name}
                          </h3>
                          {srv.category && (
                            <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                              {srv.category}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-stone-600 font-normal">
                          {srv.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 tracking-wide">
                            Agenda Aberta
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedService(srv)}
                          style={{ backgroundColor: accentColor }}
                          className="group/btn relative overflow-hidden rounded-full px-6 py-3.5 text-xs font-bold text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <Calendar className="size-4 transition-transform group-hover/btn:scale-110" />
                          <span>Agendar Atendimento</span>
                          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA DE PRODUTOS DA LOJA DO SALÃO */}
        {activeTab === 'produtos' && (
          <div>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold tracking-widest text-rose-500 uppercase">Loja Oficial do Salão</p>
                <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal">Produtos Capilares & Cosméticos</h2>
              </div>
              <span className="text-xs text-stone-500 font-medium">Produtos profissionais recomendados pelos nossos especialistas.</span>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className={`group overflow-hidden rounded-3xl border border-stone-200 ${cardBg} p-6 shadow-sm flex flex-col justify-between transition hover:shadow-xl`}
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute top-3 right-3 rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase">
                        {prod.category}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-xl font-normal">{prod.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed opacity-75">{prod.description}</p>
                  </div>

                  <div className="mt-6 border-t border-stone-100/30 pt-4 flex items-center justify-between">
                    <span className="font-serif text-xl font-bold">{formatKz(prod.price)}</span>
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      style={{ backgroundColor: accentColor }}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-md flex items-center gap-1.5"
                    >
                      <ShoppingBag className="size-3.5" /> Encomendar Produto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALERIA DINÂMICA HD 5S */}
        {activeTab === 'estudio3d' && (
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">Experiência Visual Dinâmica</span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal">O Espaço Físico & Resultados em Tempo Real</h2>
              <p className="mt-4 text-sm leading-relaxed opacity-80">
                Imagens modernas em alta definição do nosso atelier a alternar automaticamente a cada 5 segundos para que conheça o ambiente antes da sua visita.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="relative h-[380px] sm:h-[480px] w-full overflow-hidden rounded-[2.5rem] border border-stone-200 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImgIndex}
                    src={carouselImages[currentImgIndex]}
                    alt="Atelier Salão HD"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold">
                    Espaço {salon.name} ({currentImgIndex + 1}/{carouselImages.length})
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentImgIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                      className="flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImgIndex((prev) => (prev + 1) % carouselImages.length)}
                      className="flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA DA EQUIPA */}
        {activeTab === 'equipa' && (
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">Equipa de Especialistas</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {salon.stylists.map((st, i) => (
                <div key={i} className={`overflow-hidden rounded-3xl border border-stone-200 ${cardBg} p-6 text-center shadow-sm`}>
                  <img src={st.avatar} alt={st.name} className="mx-auto size-28 rounded-full object-cover border-2 border-stone-200 shadow-md" />
                  <h3 className="mt-4 font-serif text-xl font-normal">{st.name}</h3>
                  <p className="mt-1 text-xs font-semibold opacity-60">{st.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA GALERIA FUTURISTA COM VÍDEOS DEMONSTRATIVOS DO TRABALHO */}
        {activeTab === 'galeria' && (
          <FuturisticMediaGallery mediaItems={salon.mediaGallery || []} />
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-stone-900 text-stone-300 py-14 px-6 md:px-12">
        <div className="mx-auto max-w-7xl grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={salon.avatarImage} alt={salon.name} className="size-10 rounded-full object-cover border border-stone-700" />
              <h3 className="font-serif text-2xl font-normal text-white">{salon.name}</h3>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-400">{salon.description}</p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-normal text-white mb-4">Contactos & Morada</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-2"><MapPin className="inline size-3.5 mr-1" />{salon.address}</p>
            <p className="text-xs text-stone-400 leading-relaxed mb-2"><Phone className="inline size-3.5 mr-1" />{salon.phone}</p>
            <p className="text-xs text-stone-400 leading-relaxed"><Mail className="inline size-3.5 mr-1" />{salon.email}</p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-normal text-white mb-4">Horário de Funcionamento</h4>
            <p className="text-xs text-stone-400 mb-2">Segunda a Sábado: 08:30 — 19:30</p>
            <p className="text-xs text-stone-400 mb-2">Domingo: Encerrado</p>
          </div>
        </div>
      </footer>

      {/* MODAIS */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl text-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Loja do Salão</span>
                  <h3 className="font-serif text-2xl font-normal">Encomendar Produto</h3>
                </div>
                <button onClick={() => { setSelectedProduct(null); setProductOrderConfirmed(false) }} className="rounded-full p-2 text-stone-400 hover:bg-stone-100">
                  <X className="size-5" />
                </button>
              </div>

              {!productOrderConfirmed ? (
                <form onSubmit={handleOrderProduct} className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4 rounded-2xl bg-[#fbf9f6] p-4 border border-stone-200">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="size-16 rounded-xl object-cover" />
                    <div>
                      <p className="font-serif font-semibold">{selectedProduct.name}</p>
                      <p className="text-xs font-bold text-rose-600">{formatKz(selectedProduct.price)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">O seu Nome</label>
                    <input
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Ana Sofia Martins"
                      className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Telemóvel / WhatsApp para Entrega</label>
                    <input
                      required
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="923 456 789"
                      className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: accentColor }}
                    className="mt-4 w-full rounded-full py-4 text-xs font-semibold text-white shadow-md hover:opacity-95"
                  >
                    Confirmar Encomenda ({formatKz(selectedProduct.price)})
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                    <PackageCheck className="size-8" />
                  </div>
                  <h4 className="mt-4 font-serif text-3xl font-normal">Encomenda Registada!</h4>
                  <p className="mt-2 text-xs text-stone-500">Obrigado, {clientName}. O salão entrará em contacto para combinar a entrega do produto.</p>
                  <button onClick={() => { setSelectedProduct(null); setProductOrderConfirmed(false) }} className="mt-6 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white">
                    Concluído
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl text-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">{salon.name}</p>
                  <h3 className="font-serif text-2xl font-normal">Marcar Atendimento</h3>
                </div>
                <button onClick={() => { setSelectedService(null); setConfirmed(false) }} className="rounded-full p-2 text-stone-400 hover:bg-stone-100">
                  <X className="size-5" />
                </button>
              </div>

              {!confirmed ? (
                <form onSubmit={handleBooking} className="mt-6 flex flex-col gap-4">
                  <div className="rounded-2xl bg-[#fbf9f6] p-4 border border-stone-200">
                    <p className="font-serif text-lg font-semibold text-stone-900">{selectedService.name}</p>
                    <p className="text-xs text-stone-500">{selectedService.duration_minutes} minutos · <strong className="text-stone-900">{formatKz(selectedService.price)}</strong></p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">O seu Nome</label>
                    <input
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Ana Sofia Martins"
                      className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Telemóvel para SMS de Confirmação</label>
                    <input
                      required
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="923 456 789"
                      className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none focus:border-stone-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase">Data</label>
                      <input
                        required
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase">Horário</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-stone-200 bg-[#fbf9f6] p-3.5 text-sm outline-none"
                      >
                        <option>09:00</option>
                        <option>10:30</option>
                        <option>11:30</option>
                        <option>14:00</option>
                        <option>15:30</option>
                        <option>17:00</option>
                        <option>18:30</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: accentColor }}
                    className="mt-4 w-full rounded-full py-4 text-xs font-semibold text-white shadow-md hover:opacity-95"
                  >
                    Confirmar Agendamento Online ({formatKz(selectedService.price)})
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h4 className="mt-4 font-serif text-3xl font-normal">Marcação Confirmada!</h4>
                  <p className="mt-2 text-xs text-stone-500">Obrigado, {clientName}. Enviámos os detalhes para o seu telemóvel.</p>
                  <button onClick={() => { setSelectedService(null); setConfirmed(false) }} className="mt-6 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-stone-50">
                    Concluído
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
