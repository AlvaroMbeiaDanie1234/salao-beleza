'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { initialSalons, SalonData } from '@/lib/salons-data'
import {
  Sparkles,
  Scissors,
  MapPin,
  Star,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Award,
  Crown,
  Calendar,
  TrendingUp,
  User,
  Heart,
  CheckCircle2,
  PhoneCall,
  Sparkle,
  BadgePercent,
  Search,
  SlidersHorizontal,
  Building2,
  Store,
  Users2,
  Clock3,
  CreditCard,
  QrCode,
  Zap,
  BarChart3,
  MessageSquareCheck,
  SendHandshake,
  Check,
  PlusCircle,
  HelpCircle,
  X,
  Mail,
  Phone,
  ArrowRight,
  Globe,
  Share2
} from 'lucide-react'

import SalonHeroGallery from '@/components/salon-hero-gallery'

import { createClient } from '@/lib/supabase/client'

export default function GestaoDashboard() {
  const [salonsList, setSalonsList] = useState<SalonData[]>([])
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [salonName, setSalonName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Luanda')
  const [registeredSuccess, setRegisteredSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Newsletter no footer
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)

    async function loadApprovedSalons() {
      try {
        const { data, error } = await supabase.from('salons').select('*').order('created_at', { ascending: false })
        if (!error && data) {
          const mappedSalons: SalonData[] = data.map((s) => ({
            id: s.id,
            name: s.name,
            tagline: s.tagline || 'Salão de Beleza',
            slug: s.slug,
            city: s.city || 'Luanda',
            province: s.province,
            municipality: s.municipality,
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            description: s.description || '',
            status: s.status || 'pending',
            owner_id: s.owner_id || '',
            rating: Number(s.rating || 5.0),
            reviewsCount: Number(s.reviews_count || 1),
            coverImage: s.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
            avatarImage: s.avatar_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            templateId: s.template_id || 'luxe-pink',
            themeColor: s.theme_color || '#e11d48',
            textColor: s.text_color || '#ffffff',
            fontFamily: s.font_family || 'serif',
            footerText: s.footer_text || '',
            gallery: s.gallery || [],
            mediaGallery: s.media_gallery || [],
            stylists: s.stylists || [],
            plan_id: s.plan_id,
            plan_name: s.plan_name,
            plan_status: s.plan_status,
          }))
          setSalonsList(mappedSalons)
        }
      } catch (err) {
        console.error('Erro ao ler salões do Supabase:', err)
      }
    }

    loadApprovedSalons()

    window.addEventListener('storage', loadApprovedSalons)
    const interval = setInterval(loadApprovedSalons, 2500)

    return () => {
      window.removeEventListener('storage', loadApprovedSalons)
      clearInterval(interval)
    }
  }, [])

  async function handleRegisterSalon(e: React.FormEvent) {
    e.preventDefault()
    if (!salonName) return

    const slug = salonName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const newSalon: SalonData = {
      id: 'salon-' + Date.now(),
      name: salonName,
      tagline: 'Salão de Beleza & Estética Avançada',
      slug,
      city,
      address: 'Endereço Registado no SGS',
      phone: phone || '+244 923 000 000',
      email: `${slug}@sgs.ao`,
      description: `Proprietário: ${ownerName || 'Responsável'}. Salão registado na plataforma SGS.`,
      status: 'pending', // Fica pendente para aprovação no /admin Master
      owner_id: 'owner-' + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      templateId: 'luxe-pink',
      themeColor: '#1c1917',
      textColor: '#fbf9f6',
      fontFamily: 'serif',
      footerText: `© 2026 ${salonName}. Todos os direitos reservados.`,
      gallery: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
      stylists: [],
    }

    // 1. Inserir no Supabase Cloud
    try {
      await supabase.from('salons').insert([{
        id: newSalon.id,
        name: newSalon.name,
        tagline: newSalon.tagline,
        slug: newSalon.slug,
        city: newSalon.city,
        address: newSalon.address,
        phone: newSalon.phone,
        email: newSalon.email,
        description: newSalon.description,
        status: newSalon.status,
        owner_id: newSalon.owner_id,
        rating: newSalon.rating,
        reviews_count: newSalon.reviewsCount,
        cover_image: newSalon.coverImage,
        avatar_image: newSalon.avatarImage,
        template_id: newSalon.templateId,
        theme_color: newSalon.themeColor,
        text_color: newSalon.textColor,
        font_family: newSalon.fontFamily,
        footer_text: newSalon.footerText,
        gallery: newSalon.gallery,
        stylists: newSalon.stylists,
      }])
    } catch (err) {
      console.error('Erro ao guardar no Supabase:', err)
    }

    // 2. Atualizar estado local
    setSalonsList((prev) => [newSalon, ...prev])

    setRegisteredSuccess(true)
    if (typeof window !== 'undefined') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newsletterEmail) {
      setNewsletterSubscribed(true)
      setTimeout(() => setNewsletterSubscribed(false), 4000)
      setNewsletterEmail('')
    }
  }

  // State para o Menu Hamburger Mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#fff5f7] text-[#2d1820] selection:bg-rose-200">
      {/* Top Header com a Sigla SGS e Menu Hamburger Mobile */}
      <header className="sticky top-0 z-40 border-b border-rose-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/25 transition-transform hover:scale-105">
              <Sparkles className="size-5 text-rose-100 animate-pulse" />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-wider bg-gradient-to-r from-rose-900 via-rose-700 to-pink-600 bg-clip-text text-transparent">
                SGS
              </span>
              <p className="text-[9px] font-extrabold tracking-[0.25em] text-rose-500 uppercase">Sistema de Gestão de Serviços</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-stone-600 lg:flex">
            <a href="#galeria-saloes" className="transition hover:text-rose-600">Espaços Reais</a>
            <a href="#saloes" className="transition hover:text-rose-600">Salões Inscritos</a>
            <a href="#vantagens-negocio" className="transition hover:text-rose-600">Para Proprietários</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setRegisteredSuccess(false)
                setSalonName('')
                setOwnerName('')
                setPhone('')
                setRegisterModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 shadow-sm"
            >
              <PlusCircle className="size-4 text-rose-600" /> Cadastrar Meu Salão
            </button>

            {/* Botão Hamburger para Dispositivos Móveis */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-10 items-center justify-center rounded-full border border-rose-200 bg-white text-stone-700 transition hover:bg-rose-50 lg:hidden"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="size-5 text-rose-600" /> : <SlidersHorizontal className="size-5 text-rose-600" />}
            </button>
          </div>
        </div>

        {/* Menu Desdobrável Mobile (Hamburger Drawer) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-rose-100 bg-white px-6 py-6 shadow-xl lg:hidden"
            >
              <nav className="flex flex-col gap-4 text-base font-bold text-stone-800">
                <a
                  href="#galeria-saloes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-rose-50/50 p-3 transition hover:bg-rose-100/60 text-rose-900"
                >
                  <span>Espaços Reais</span>
                  <ChevronRight className="size-4 text-rose-500" />
                </a>
                <a
                  href="#saloes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-rose-50/50 p-3 transition hover:bg-rose-100/60 text-rose-900"
                >
                  <span>Salões Inscritos</span>
                  <ChevronRight className="size-4 text-rose-500" />
                </a>
                <a
                  href="#vantagens-negocio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-rose-50/50 p-3 transition hover:bg-rose-100/60 text-rose-900"
                >
                  <span>Para Proprietários</span>
                  <ChevronRight className="size-4 text-rose-500" />
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setRegisterModalOpen(true)
                  }}
                  className="mt-2 w-full rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-rose-500/25"
                >
                  Cadastrar o Meu Salão
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section ultra-ampliado (deixando apenas uma pequena margem nas laterais) */}
      <section className="relative mx-auto w-[96vw] max-w-[1920px] px-6 sm:px-10 pb-20 pt-12 md:px-16 lg:pt-16 overflow-hidden rounded-[2.5rem] my-4 shadow-2xl bg-stone-950">
        {/* Background Video com Overlay Fusco */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover scale-105 opacity-60 filter brightness-90 contrast-105"
          >
            <source src={encodeURI("/assets/videos/WhatsApp Video 2026-09-04 at 18.21.28.mp4")} type="video/mp4" />
          </video>
          {/* Camada fusca e escura equilibrada (deixa o vídeo visível sem atrapalhar a leitura) */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/70 to-rose-950/60 backdrop-blur-[1px]" />
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:items-center relative z-10">
          <div className="lg:col-span-6 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-950/80 px-4 py-1.5 text-xs font-bold text-rose-200 backdrop-blur-md">
              <span className="flex size-2 rounded-full bg-rose-400 animate-ping" />
              SGS — A Maior Rede de Salões de Beleza em Angola
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-white">
              Transforme o seu salão num<br />
              <span className="font-serif italic font-normal bg-gradient-to-r from-rose-300 via-pink-200 to-rose-400 bg-clip-text text-transparent">
                negócio de alto rendimento.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-rose-100/90 drop-shadow">
              O **SGS (Sistema de Gestão de Serviços)** é o ecossistema completo para salões de beleza, barbearias e centros de estética. Crie a sua página web exclusiva, permita agendamentos 24/7 em Kwanzas (Kz), elimine faltas de clientes e aumente a faturação da sua equipa.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setRegisteredSuccess(false)
                  setSalonName('')
                  setOwnerName('')
                  setPhone('')
                  setRegisterModalOpen(true)
                }}
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-rose-500/30 cursor-pointer z-20 relative"
              >
                Registar o Meu Salão Agora <ChevronRight className="size-4" />
              </button>

              <a
                href="#vantagens-negocio"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Como Funciona para Salões
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-rose-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-rose-400" /> Domínio Personalizado (ex: lume.pt/seu-salao)
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" /> Pagamentos e Preços em Kz
              </div>
            </div>
          </div>

          <div id="galeria-saloes" className="lg:col-span-6">
            <SalonHeroGallery />
          </div>
        </div>
      </section>

      {/* SECÇÃO PARA PROPRIETÁRIOS DE SALÕES */}
      <section id="vantagens-negocio" className="bg-white py-24 border-t border-rose-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">Crescimento SGS</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-stone-900">
              Tudo o que o seu salão precisa para crescer e fidelizar clientes
            </h2>
            <p className="mt-4 text-base text-stone-600">
              Deixe as agendas em papel e mensagens manuais. Dê ao seu espaço o profissionalismo que atrai clientes de alto valor.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Store,
                title: 'Página Web Exclusiva para o seu Salão',
                desc: 'Receba um link próprio (ex: lume.pt/o-seu-salao) com a sua foto de capa, tabela de preços, galeria de trabalhos e localização.',
              },
              {
                icon: Calendar,
                title: 'Agendamentos 24 Horas sem Faltas',
                desc: 'Os seus clientes escolhem a data, hora e serviço em segundos. Lembretes automáticos reduzem os esquecimentos a zero.',
              },
              {
                icon: CreditCard,
                title: 'Preços & Faturação em Kwanzas (Kz)',
                desc: 'Tabela de preços configurável em Kz, permitindo atualizar valores de cortes, colorações e tratamentos em tempo real.',
              },
              {
                icon: BarChart3,
                title: 'Gestão Financeira & Desempenho',
                desc: 'Acompanhe a faturação diária, a taxa de ocupação das cadeiras e o rendimento de cada cabeleireiro ou manicura.',
              },
              {
                icon: Sparkle,
                title: 'Personalização 100% à Sua Medida',
                desc: 'Escolha as cores de fundo do tema, fotos do espaço, estilo tipográfico e informações de contacto através do painel /admin.',
              },
              {
                icon: Users2,
                title: 'Fidelização & Marketing para Clientes',
                desc: 'Crie uma base de dados completa de clientes para enviar promoções exclusivas e novidades dos seus rituais de beleza.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-[2.5rem] border border-rose-100 bg-[#fffafd] p-8 transition-all hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <item.icon className="size-7" />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-normal text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LISTAGEM MODERNA DE SALÕES REGISTADOS NA PLATAFORMA */}
      <section id="saloes" className="relative py-24 border-t border-rose-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <div className="flex flex-col justify-between md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">Rede SGS</span>
              <h2 className="mt-2 font-serif text-4xl font-normal text-stone-900">Salões Registados & Ativos</h2>
            </div>
            <p className="mt-3 max-w-md text-sm text-stone-500 md:mt-0">
              Exemplos de páginas de autor com o sistema SGS configurado.
            </p>
          </div>

          <div className="mt-14">
            {salonsList.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {salonsList.map((s) => (
                  <div
                    key={s.id}
                    className="group relative overflow-hidden rounded-[2.5rem] border border-rose-100 bg-white transition-all duration-500 hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-72 w-full overflow-hidden">
                        <img src={s.coverImage} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                        
                        <div className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-rose-700 shadow-md">
                          ★ {s.rating} ({s.reviewsCount} avaliações)
                        </div>

                        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white">
                          <span className="rounded-full bg-rose-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-rose-200 border border-rose-800/40">
                            <MapPin className="mr-1 inline size-3.5" />{s.city}
                          </span>
                          <span className="text-xs font-mono text-stone-300">{s.address}</span>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex items-center gap-4">
                          <img src={s.avatarImage} alt={s.name} className="size-14 rounded-2xl object-cover border-2 border-rose-200 shadow-md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-2xl font-normal text-stone-900 group-hover:text-rose-700 transition-colors">{s.name}</h3>
                              {s.status === 'approved' ? (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                                  Aprovado
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                                  Pendente
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-rose-600">{s.tagline}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-stone-600">{s.description}</p>
                      </div>
                    </div>

                    <div className="p-8 pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-rose-100 pt-5 gap-3">
                        <span className="text-xs font-mono text-rose-700 bg-rose-100/70 px-3.5 py-1.5 rounded-full w-fit font-bold">
                          Endpoint: /{s.slug}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${s.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-md shadow-rose-500/20"
                          >
                            Visitar Salão <ArrowUpRight className="size-3.5" />
                          </Link>
                          <Link
                            href={`/${s.slug}/admin`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-900 transition hover:bg-rose-100 shadow-sm"
                          >
                            Painel Admin
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-rose-200 p-12 text-center bg-white/60 backdrop-blur-sm">
                <Building2 className="mx-auto size-12 text-rose-400" />
                <h3 className="mt-4 font-serif text-2xl font-normal text-stone-900">Nenhum salão registado no momento</h3>
                <p className="mt-2 text-xs text-stone-500 max-w-md mx-auto">
                  Assim que registar o seu salão, ele aparecerá aqui automaticamente listado em tempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-rose-200/80 bg-stone-950 text-stone-400 pt-20 pb-12 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 p-8 sm:p-12 text-white shadow-2xl mb-16">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-rose-200 uppercase">
                  <Sparkles className="size-3.5" /> Novidades para Salões
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-normal leading-tight">
                  Receba dicas de gestão de beleza e atualizações do SGS
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-rose-200">
                  Subscreva a nossa newsletter exclusiva para proprietários de salões e profissionais de estética em Angola.
                </p>
              </div>

              <div className="lg:col-span-5">
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="O seu email profissional"
                    className="flex-1 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-5 py-3.5 text-xs text-white placeholder-rose-200 outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs font-bold text-rose-950 transition hover:bg-rose-100 shadow-md whitespace-nowrap"
                  >
                    Subscrever <ArrowRight className="size-4" />
                  </button>
                </form>
                {newsletterSubscribed && (
                  <p className="mt-2 text-xs font-semibold text-emerald-300">
                    ✓ Obrigado! Subscrição efetuada com sucesso.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5 border-b border-stone-800 pb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md">
                  <Sparkles className="size-5" />
                </div>
                <span className="font-serif text-2xl font-black text-white">SGS</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-stone-400 max-w-sm">
                O **SGS (Sistema de Gestão de Serviços)** é a plataforma líder em Angola para digitalização de salões de beleza, barbearias e estética.
              </p>
            </div>

            <div>
              <h4 className="font-serif text-base font-normal text-white mb-4">Salões em Angola</h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                {salonsList.filter((s) => s.status === 'approved').length > 0 ? (
                  salonsList.filter((s) => s.status === 'approved').map((s) => (
                    <li key={s.id}>
                      <Link href={`/${s.slug}`} className="hover:text-rose-400 transition">
                        {s.name} ({s.city})
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-500 italic">Nenhum salão disponível no momento</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-base font-normal text-white mb-4">Para Salões</h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li><button onClick={() => setRegisterModalOpen(true)} className="hover:text-rose-400 transition text-left">Cadastrar Salão</button></li>
                <li><a href="#vantagens-negocio" className="hover:text-rose-400 transition">Software de Agendamentos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-base font-normal text-white mb-4">Apoio ao Cliente</h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li className="flex items-center gap-2"><Phone className="size-3.5 text-rose-500" /> +244 923 456 789</li>
                <li className="flex items-center gap-2"><Mail className="size-3.5 text-rose-500" /> suporte@sgs.ao</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
            <p>© 2026 SGS — Sistema de Gestão de Serviços. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE CADASTRO */}
      <AnimatePresence>
        {registerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl my-auto"
            >
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Novo Salão no SGS</span>
                <h3 className="font-serif text-2xl font-normal text-stone-900">Cadastrar Salão de Beleza</h3>
              </div>
              <button onClick={() => { setRegisterModalOpen(false); setRegisteredSuccess(false) }} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            {!registeredSuccess ? (
              <form onSubmit={handleRegisterSalon} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Salão ou Atelier</label>
                  <input
                    required
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder="Ex: Studio Glamour & Spa"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none focus:border-rose-400 text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Proprietário / Responsável</label>
                  <input
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Maria Clara Santos"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none focus:border-rose-400 text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Cidade</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none text-stone-900">
                      <option>Luanda</option>
                      <option>Benguela</option>
                      <option>Huambo</option>
                      <option>Lubango</option>
                      <option>Cabinda</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Telefone / WhatsApp</label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="923 456 789"
                      className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none focus:border-rose-400 text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:opacity-95"
                >
                  Criar Página do Salão Agora
                </button>
              </form>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="mt-4 font-serif text-3xl font-normal text-stone-900">Salão Registado com Sucesso!</h4>
                <p className="mt-2 text-xs text-stone-500">
                  Parabéns, {ownerName}. O salão <strong>{salonName}</strong> foi registado no SGS. Já pode aceder ao painel para personalizar fotos e preços.
                </p>
                <button onClick={() => { setRegisterModalOpen(false); setRegisteredSuccess(false) }} className="mt-6 rounded-full bg-stone-900 px-7 py-3 text-xs font-semibold text-white">
                  Concluído
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </main>
)
}
