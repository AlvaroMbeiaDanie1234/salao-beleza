'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { SalonData, ServiceData, BookingData, ProductData, initialProducts, initialServices, SubscriptionPlan, initialPlans, initialPlatformBankDetails } from '@/lib/salons-data'
import {
  Scissors,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  User,
  Award,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Image as ImageIcon,
  Mail,
  Palette,
  Upload,
  Check,
  ShoppingBag,
  PackagePlus,
  Layout,
  Layers,
  Sparkle,
  Menu,
  X,
  LogOut,
  Sliders,
  DollarSign,
  ChevronRight,
  Search,
  Phone,
  Globe,
  Share2,
  Info,
  Edit3,
  Building,
  SlidersHorizontal,
  Instagram,
  Facebook,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function formatKz(amount: number) {
  return amount.toLocaleString('pt-AO') + ' Kz'
}

export default function SalonAdminView({
  salon: initialSalon,
  services: initialServicesList,
  bookings: initialBookingsList,
}: {
  salon: SalonData
  services: ServiceData[]
  bookings: BookingData[]
}) {
  const [authenticated, setAuthenticated] = useState(false)
  const [emailInput, setEmailInput] = useState(initialSalon.email || '')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [salon, setSalon] = useState<SalonData>(initialSalon)
  const [services, setServices] = useState<ServiceData[]>(initialServicesList)
  const [products, setProducts] = useState<ProductData[]>(initialProducts)
  const [bookings, setBookings] = useState<BookingData[]>(initialBookingsList)

  // Separador Ativo da Sidebar
  const [activeTab, setActiveTab] = useState<'about' | 'subscription' | 'customization' | 'products' | 'services' | 'bookings'>('about')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Planos & Subscrição do Salão
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>(initialPlans)
  const [platformBank, setPlatformBank] = useState(initialPlatformBankDetails)
  const [selectedPlanForSub, setSelectedPlanForSub] = useState<SubscriptionPlan | null>(null)
  const [proofFileName, setProofFileName] = useState('')
  const [proofSuccess, setProofSuccess] = useState(false)

  // Modal para editar/adicionar informações "Sobre o Salão"
  const [showEditInfoModal, setShowEditInfoModal] = useState(false)

  // Termos de Pesquisa
  const [productSearch, setProductSearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [bookingSearch, setBookingSearch] = useState('')

  // Modais de Registo
  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)

  const coverFileRef = useRef<HTMLInputElement>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const productFileRef = useRef<HTMLInputElement>(null)
  const serviceFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const proofFileRef = useRef<HTMLInputElement>(null)

  const [proofFilePreview, setProofFilePreview] = useState<string | null>(null)

  const serviceVideoFileRef = useRef<HTMLInputElement>(null)

  // Formulário de Novo Serviço com Foto e Vídeo (Até 10MB)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('25000')
  const [newServiceDuration, setNewServiceDuration] = useState('60')
  const [newServiceCategory, setNewServiceCategory] = useState('Cabelo')
  const [newServiceImage, setNewServiceImage] = useState('https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80')
  const [newServiceVideoUrl, setNewServiceVideoUrl] = useState('')
  const [newServiceMediaType, setNewServiceMediaType] = useState<'image' | 'video'>('image')
  const [videoUploadError, setVideoUploadError] = useState('')

  // Formulário de Novo Produto
  const [newProductName, setNewProductName] = useState('')
  const [newProductDesc, setNewProductDesc] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('18500')
  const [newProductCategory, setNewProductCategory] = useState('Cabelo')
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1608248597261-e4d0947c6b1e?auto=format&fit=crop&w=600&q=80')

  const [savedFeedback, setSavedFeedback] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadSalonDataFromSupabase() {
      // 1. Carregar agendamentos do Supabase em tempo real
      try {
        const { data: bData, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .eq('salon_id', initialSalon.id)
          .order('created_at', { ascending: false })

        if (!bErr && bData) {
          const mappedBookings: BookingData[] = bData.map((b) => ({
            id: b.id,
            salon_id: b.salon_id,
            service_name: b.service_name,
            date: b.date,
            time: b.time,
            client_name: b.client_name,
            client_phone: b.client_phone,
            client_avatar: b.client_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            status: b.status || 'Pendente',
          }))
          setBookings(mappedBookings)
        }
      } catch (err) {
        console.error('Erro ao ler marcações do Supabase:', err)
      }

      // 2. Carregar dados atualizados do salão do Supabase apenas se o utilizador NÃO estiver a editar no modal
      if (!showEditInfoModal) {
        try {
          const { data: sData, error: sErr } = await supabase
            .from('salons')
            .select('*')
            .eq('id', initialSalon.id)
            .single()

          if (!sErr && sData) {
            setSalon((prev) => ({
              ...prev,
              avatarImage: sData.avatar_image || prev.avatarImage,
              coverImage: sData.cover_image || prev.coverImage,
              description: sData.description || prev.description,
              address: sData.address || prev.address,
              phone: sData.phone || prev.phone,
              email: sData.email || prev.email,
              city: sData.city || prev.city,
              tagline: sData.tagline || prev.tagline,
              name: sData.name || prev.name,
              gallery: sData.gallery || prev.gallery,
            }))
          }
        } catch (err) {
          console.error('Erro ao ler perfil do Supabase:', err)
        }
      }
    }

    loadSalonDataFromSupabase()
    const interval = setInterval(loadSalonDataFromSupabase, 2500)

    return () => clearInterval(interval)
  }, [initialSalon.id, showEditInfoModal])

  function handleProofFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setProofFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSubmitPaymentProof(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlanForSub) return

    const proof = {
      id: 'proof-' + Date.now(),
      salon_id: salon.id,
      plan_id: selectedPlanForSub.id,
      plan_name: selectedPlanForSub.name,
      amount: selectedPlanForSub.price,
      proof_file_name: proofFileName || 'comprovativo_pagamento.pdf',
      submitted_at: new Date().toLocaleDateString('pt-AO'),
      status: 'pendente' as const,
    }

    const updatedSalon: SalonData = {
      ...salon,
      plan_id: selectedPlanForSub.id,
      plan_name: selectedPlanForSub.name,
      plan_status: 'em_analise',
      payment_proof: proof,
    }

    setSalon(updatedSalon)
    localStorage.setItem(`salon_custom_${salon.slug}`, JSON.stringify(updatedSalon))

    // Atualizar no localStorage global de salões
    const savedSalonsStr = localStorage.getItem('sgs_global_salons')
    if (savedSalonsStr) {
      try {
        const allSalons: SalonData[] = JSON.parse(savedSalonsStr)
        const updatedAll = allSalons.map((s) => (s.id === salon.id ? updatedSalon : s))
        localStorage.setItem('sgs_global_salons', JSON.stringify(updatedAll))
        window.dispatchEvent(new Event('storage'))
      } catch (e) {
        console.error(e)
      }
    }

    setProofSuccess(true)
    setSelectedPlanForSub(null)
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (
      emailInput.trim().toLowerCase() === salon.email.toLowerCase() &&
      (passwordInput === '123456' || passwordInput === 'admin' || passwordInput.length >= 4)
    ) {
      setAuthenticated(true)
      setAuthError('')
    } else if (passwordInput === '123456' || passwordInput.length >= 4) {
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Credenciais incorretas. Verifique o email e a palavra-passe.')
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar' | 'product' | 'service' | 'gallery') {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const result = event.target?.result as string
        if (type === 'cover') {
          setSalon((prev) => ({ ...prev, coverImage: result }))
          await supabase.from('salons').update({ cover_image: result }).eq('id', salon.id)
        } else if (type === 'avatar') {
          setSalon((prev) => ({ ...prev, avatarImage: result }))
          await supabase.from('salons').update({ avatar_image: result }).eq('id', salon.id)
        } else if (type === 'product') {
          setNewProductImage(result)
        } else if (type === 'service') {
          setNewServiceImage(result)
        } else if (type === 'gallery') {
          const updatedGallery = [result, ...(salon.gallery || [])]
          setSalon((prev) => ({ ...prev, gallery: updatedGallery }))
          await supabase.from('salons').update({ gallery: updatedGallery }).eq('id', salon.id)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSaveSalonCustomization(e: React.FormEvent) {
    e.preventDefault()
    try {
      await supabase.from('salons').update({
        name: salon.name,
        tagline: salon.tagline,
        city: salon.city,
        address: salon.address,
        phone: salon.phone,
        email: salon.email,
        description: salon.description,
        avatar_image: salon.avatarImage,
        cover_image: salon.coverImage,
        gallery: salon.gallery,
        instagram: salon.instagram,
        facebook: salon.facebook,
      }).eq('id', salon.id)
    } catch (err) {
      console.error('Erro ao guardar personalização no Supabase:', err)
    }

    setSavedFeedback(true)
    setShowEditInfoModal(false)
    setTimeout(() => setSavedFeedback(false), 3000)
  }

  function removeGalleryImage(idx: number) {
    setSalon((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx),
    }))
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho limite de 10MB (10 * 1024 * 1024 bytes)
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        setVideoUploadError(`O vídeo selecionado possui ${(file.size / (1024 * 1024)).toFixed(1)}MB. O limite máximo permitido é 10MB.`)
        return
      }

      setVideoUploadError('')
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setNewServiceVideoUrl(result)
        setNewServiceMediaType('video')
      }
      reader.readAsDataURL(file)
    }
  }

  function addService(e: React.FormEvent) {
    e.preventDefault()
    if (!newServiceName) return
    const newS: ServiceData = {
      id: 'srv-' + Date.now(),
      salon_id: salon.id,
      name: newServiceName,
      description: newServiceDesc || 'Cuidado de autor personalizado.',
      duration_minutes: Number(newServiceDuration),
      price: Number(newServicePrice),
      image: newServiceImage,
      videoUrl: newServiceVideoUrl,
      mediaType: newServiceMediaType,
      active: true,
      category: newServiceCategory,
    }
    const updated = [newS, ...services]
    setServices(updated)
    localStorage.setItem(`salon_services_${salon.slug}`, JSON.stringify(updated))
    setNewServiceName('')
    setNewServiceDesc('')
    setNewServiceVideoUrl('')
    setNewServiceMediaType('image')
    setShowServiceModal(false)
  }

  function removeService(id: string) {
    const updated = services.filter((s) => s.id !== id)
    setServices(updated)
    localStorage.setItem(`salon_services_${salon.slug}`, JSON.stringify(updated))
  }

  function addProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!newProductName) return
    const newP: ProductData = {
      id: 'prod-' + Date.now(),
      salon_id: salon.id,
      name: newProductName,
      description: newProductDesc || 'Produto oficial do salão.',
      price: Number(newProductPrice),
      image: newProductImage,
      category: newProductCategory,
      inStock: true,
    }
    const updated = [newP, ...products]
    setProducts(updated)
    localStorage.setItem(`salon_products_${salon.slug}`, JSON.stringify(updated))
    setNewProductName('')
    setNewProductDesc('')
    setShowProductModal(false)
  }

  function removeProduct(id: string) {
    const updated = products.filter((p) => p.id !== id)
    setProducts(updated)
    localStorage.setItem(`salon_products_${salon.slug}`, JSON.stringify(updated))
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category.toLowerCase().includes(serviceSearch.toLowerCase()))
  const filteredBookings = bookings.filter(b => b.client_name.toLowerCase().includes(bookingSearch.toLowerCase()) || b.service_name.toLowerCase().includes(bookingSearch.toLowerCase()))

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#fff5f7] flex items-center justify-center p-4 sm:p-6 text-stone-900">
        <div className="w-full max-w-md rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-900 to-rose-600 text-white shadow-md">
              <Lock className="size-6 text-rose-200" />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-normal">Área do Proprietário</h1>
            <p className="mt-2 text-xs text-stone-500">
              Autenticação de Gestão de <strong className="text-stone-800">{salon.name}</strong>
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Email Profissional</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@salão.ao"
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Mail className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Palavra-passe</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Insira a sua palavra-passe"
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Lock className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">
                Email de teste: <span className="font-mono text-rose-700 font-bold">{salon.email}</span> · Pass: <span className="font-mono text-rose-700 font-bold">123456</span>
              </p>
            </div>

            {authError && <p className="text-xs font-semibold text-red-600">{authError}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-gradient-to-r from-rose-900 to-pink-900 py-4 text-xs font-bold text-white transition hover:opacity-95 shadow-md"
            >
              Entrar no Painel do Salão
            </button>
          </form>

          <div className="mt-6 border-t border-rose-100 pt-4 text-center">
            <Link href={`/${salon.slug}`} className="text-xs font-semibold text-stone-500 hover:text-stone-900">
              ← Voltar à Página do Salão
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] text-stone-900 flex flex-col md:flex-row">
      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm md:hidden" />
      )}

      {/* SIDEBAR COM O BOTÃO "SOBRE O SALÃO" */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-rose-200/80 p-6 transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-rose-100 pb-5">
            <div className="flex items-center gap-3">
              <img src={salon.avatarImage} alt={salon.name} className="size-10 rounded-xl object-cover border border-rose-200 shadow-sm" />
              <div>
                <h2 className="font-serif text-base font-bold text-stone-900 truncate max-w-[140px]">{salon.name}</h2>
                <p className="text-[10px] text-rose-600 font-medium">/{salon.slug}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-stone-400 hover:text-stone-900">
              <X className="size-5" />
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {[
              { id: 'about', label: 'Sobre o Salão', icon: Info },
              { id: 'subscription', label: 'Plano & Subscrição', icon: CreditCard },
              { id: 'customization', label: 'Estilo & Template', icon: Palette },
              { id: 'products', label: 'Loja de Produtos', icon: ShoppingBag },
              { id: 'services', label: 'Menu de Serviços', icon: Scissors },
              { id: 'bookings', label: 'Agenda de Marcações', icon: Calendar },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20 scale-105'
                    : 'text-stone-600 hover:bg-rose-50 hover:text-rose-900'
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-rose-100 pt-4 space-y-2">
          <a
            href={`/${salon.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-rose-200 bg-[#fffafd] text-xs font-semibold text-rose-900 hover:bg-rose-50"
          >
            <span>Ver Página Pública</span>
            <ExternalLink className="size-3.5" />
          </a>

          <button
            onClick={() => setAuthenticated(false)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-500 hover:text-red-600 transition"
          >
            <LogOut className="size-3.5" /> Terminar Sessão
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL SUPERMODERNO */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-rose-200/60 bg-white/90 px-4 py-3.5 backdrop-blur-md flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-stone-700">
            <Menu className="size-6 text-rose-600" />
            <span className="text-xs font-bold font-serif">Menu Painel</span>
          </button>
          <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            {salon.name}
          </span>
        </header>

        <main className="p-4 sm:p-6 md:p-10 max-w-6xl w-full mx-auto">
          {/* SEPARADOR 1: SOBRE O SALÃO (VISÃO LIMPA DE CARTÃO MODERNO COM BOTÃO DE EDITAR/ADICIONAR) */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              {/* HERO CARD SUPERMODERNO DO SALÃO */}
              <div className="relative overflow-hidden rounded-[3rem] border border-rose-200 bg-white p-8 sm:p-10 shadow-xl">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-rose-100/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <input type="file" accept="image/*" ref={avatarFileRef} onChange={(e) => handleImageUpload(e, 'avatar')} className="hidden" />
                    <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                      <img src={salon.avatarImage} alt={salon.name} className="size-20 sm:size-24 rounded-3xl object-cover border-4 border-rose-100 shadow-md group-hover:opacity-80 transition" />
                      <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold text-center p-1">
                        Alterar Foto
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Perfil do Estabelecimento</span>
                        <button
                          type="button"
                          onClick={() => avatarFileRef.current?.click()}
                          className="text-[10px] font-bold text-rose-700 underline hover:text-rose-900"
                        >
                          Alterar Logótipo/Foto
                        </button>
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 mt-1">{salon.name}</h1>
                      <p className="text-xs text-rose-700 font-medium italic mt-0.5">{salon.tagline}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEditInfoModal(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 transition-transform"
                  >
                    <Edit3 className="size-4" /> Editar / Adicionar Detalhes
                  </button>
                </div>

                <div className="mt-8 border-t border-rose-100 pt-6 grid gap-6 sm:grid-cols-3">
                  <div>
                    <span className="text-xs font-semibold text-stone-400 uppercase">Localização</span>
                    <p className="text-xs font-bold text-stone-800 mt-1 flex items-center gap-1.5"><MapPin className="size-3.5 text-rose-600" />{salon.address}, {salon.city}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-400 uppercase">Telefone / WhatsApp</span>
                    <p className="text-xs font-bold text-stone-800 mt-1 flex items-center gap-1.5"><Phone className="size-3.5 text-rose-600" />{salon.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-400 uppercase">Email Profissional</span>
                    <p className="text-xs font-bold text-stone-800 mt-1 flex items-center gap-1.5"><Mail className="size-3.5 text-rose-600" />{salon.email}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-rose-100 pt-6">
                  <span className="text-xs font-semibold text-stone-400 uppercase block mb-2">Sobre o Salão</span>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">{salon.description}</p>
                </div>
              </div>

              {/* GALERIA DO ESPAÇO FÍSICO COM BOTÃO DE ADICIONAR FOTO */}
              <div className="rounded-[3rem] border border-rose-200 bg-white p-8 shadow-md">
                <div className="flex items-center justify-between border-b border-rose-100 pb-5 mb-6">
                  <div>
                    <h3 className="font-serif text-2xl font-normal">Fotos do Espaço Físico</h3>
                    <p className="text-xs text-stone-500">Fotografias reais que transmitem o ambiente aos seus clientes.</p>
                  </div>

                  <input type="file" accept="image/*" ref={galleryFileRef} onChange={(e) => handleImageUpload(e, 'gallery')} className="hidden" />
                  <button
                    type="button"
                    onClick={() => galleryFileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-[#fffafd] px-5 py-2.5 text-xs font-bold text-rose-900 hover:bg-rose-50 shadow-sm"
                  >
                    <Plus className="size-4 text-rose-600" /> Adicionar Foto
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {salon.gallery.map((img, idx) => (
                    <div key={idx} className="relative group rounded-3xl overflow-hidden border border-rose-200 h-36 shadow-sm">
                      <img src={img} alt={`Galeria ${idx}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-stone-950/80 text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEPARADOR SUBSCRIÇÃO & PLANOS DO SALÃO */}
          {activeTab === 'subscription' && (
            <div className="space-y-8">
              {/* CARTÃO DE ESTADO DO PLANO DO SALÃO */}
              <div className="rounded-[2.5rem] border border-rose-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Subscrição da Plataforma</span>
                    <h2 className="font-serif text-3xl font-normal text-stone-900 mt-1">Estado da Conta do Salão</h2>
                    <p className="text-xs text-stone-500 mt-1">Escolha o seu plano de subscrição e envie o comprovativo para manter a sua página pública e loja ativas.</p>
                  </div>

                  <div>
                    {salon.plan_status === 'ativo' ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" /> Plano Ativo: {salon.plan_name}
                      </span>
                    ) : salon.plan_status === 'em_analise' ? (
                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="size-4 text-amber-600 animate-pulse" /> Comprovativo em Análise pelo Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <AlertTriangle className="size-4 text-rose-600" /> Subscrição Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* NOTIFICAÇÃO E ALERTA DE EXPIRAÇÃO */}
                {salon.plan_status === 'ativo' && salon.plan_expires_at && (
                  <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-emerald-950">A sua loja está 100% Online e Aprovada</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        O seu plano <strong className="text-stone-950">{salon.plan_name}</strong> está ativo até{' '}
                        <strong className="text-stone-950">{new Date(salon.plan_expires_at).toLocaleDateString('pt-AO')}</strong>. Quando faltarem 5 dias para expirar, receberá um aviso automático.
                      </p>
                    </div>
                  </div>
                )}

                {(!salon.plan_status || salon.plan_status === 'sem_plano' || salon.plan_status === 'em_analise') && (
                  <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
                    <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-amber-950">Selecione o seu Plano de Pagamento</h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Para ativar a página pública do seu salão e começar a receber agendamentos e vendas de produtos, selecione um dos planos abaixo e faça a transferência para o IBAN oficial da plataforma.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SELEÇÃO DE PLANOS DISPONÍVEIS */}
              <div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-4">Planos de Pagamento Disponíveis</h3>
                <div className="grid gap-6 sm:grid-cols-3">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-[2.5rem] border p-7 shadow-sm transition-all flex flex-col justify-between ${
                        selectedPlanForSub?.id === plan.id
                          ? 'border-rose-600 bg-rose-50/70 shadow-lg scale-105'
                          : 'border-rose-200 bg-white hover:border-rose-300'
                      }`}
                    >
                      <div>
                        {plan.popular && (
                          <span className="rounded-full bg-rose-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            Recomendado
                          </span>
                        )}
                        <h4 className="font-serif text-2xl font-bold text-stone-900 mt-2">{plan.name}</h4>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{plan.description}</p>

                        <div className="mt-6">
                          <span className="font-serif text-3xl font-extrabold text-stone-900">{plan.price.toLocaleString('pt-AO')} Kz</span>
                          <span className="text-xs text-stone-400 font-medium"> / {plan.billingCycle}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPlanForSub(plan)
                          setProofSuccess(false)
                        }}
                        className={`mt-6 w-full rounded-full py-3 text-xs font-bold transition shadow-md ${
                          selectedPlanForSub?.id === plan.id
                            ? 'bg-rose-600 text-white'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        {selectedPlanForSub?.id === plan.id ? '✓ Plano Selecionado' : 'Escolher este Plano'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO DE COORDENADAS BANCÁRIAS E ENVIO DE COMPROVATIVO */}
              {selectedPlanForSub && (
                <div className="rounded-[2.5rem] border border-rose-300 bg-gradient-to-tr from-rose-50 to-white p-8 shadow-xl">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-4">
                    <div>
                      <span className="text-xs font-bold text-rose-600 uppercase">Pagamento via Transferência</span>
                      <h3 className="font-serif text-2xl font-normal text-stone-900">
                        Dados Bancários para o Plano: <strong className="text-rose-700">{selectedPlanForSub.name}</strong> ({selectedPlanForSub.price.toLocaleString('pt-AO')} Kz)
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                      <span className="text-xs font-semibold text-stone-400 uppercase">Banco</span>
                      <p className="font-serif text-lg font-bold text-stone-900 mt-1">{platformBank.bankName}</p>

                      <span className="text-xs font-semibold text-stone-400 uppercase block mt-4">Titular da Conta</span>
                      <p className="text-xs font-bold text-stone-800 mt-1">{platformBank.accountHolder}</p>

                      <span className="text-xs font-semibold text-stone-400 uppercase block mt-4">Número IBAN Oficial</span>
                      <div className="mt-1 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-rose-900">{platformBank.iban}</span>
                      </div>
                    </div>

                    {/* FORMULÁRIO DE ENVIO DE COMPROVATIVO */}
                    <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                      <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">Enviar Comprovativo de Pagamento</h4>
                      <p className="text-xs text-stone-500 mb-4">Carregue a captura de ecrã (imagem) ou o ficheiro PDF do comprovativo bancário.</p>

                      {/* NOTA DE AVISO ANTI-FRAUDE E RISCO DE BLOQUEIO PERMANENTE */}
                      <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-900 shadow-sm">
                        <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-red-700">Aviso Crítico Anti-Fraude</p>
                          <p className="text-xs mt-1 leading-relaxed text-red-950 font-medium">
                            <strong>ATENÇÃO:</strong> O envio de comprovativos falsos, adulterados ou de terceiros resultará no <strong>bloqueio imediato e permanente da conta do seu salão</strong>, sem possibilidade de recuperação ou reativação na rede SGS.
                          </p>
                        </div>
                      </div>

                      {!proofSuccess ? (
                        <form onSubmit={handleSubmitPaymentProof} className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase block mb-1.5">Anexar Captura de Ecrã ou Ficheiro PDF</label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              ref={proofFileRef}
                              onChange={handleProofFileSelect}
                              className="hidden"
                            />
                            
                            <div
                              onClick={() => proofFileRef.current?.click()}
                              className="cursor-pointer rounded-2xl border-2 border-dashed border-rose-200 bg-[#fffafd] p-4 text-center transition hover:border-rose-400 hover:bg-rose-50"
                            >
                              <Upload className="size-6 text-rose-500 mx-auto mb-1" />
                              <span className="text-xs font-bold text-rose-950 block">Clique para Selecionar Ficheiro (PNG, JPG, PDF)</span>
                              <span className="text-[11px] text-stone-500 block mt-0.5">
                                {proofFileName ? `Ficheiro Selecionado: ${proofFileName}` : 'Nenhum ficheiro selecionado'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase">Referência / Código da Transferência (Opcional)</label>
                            <input
                              value={proofFileName}
                              onChange={(e) => setProofFileName(e.target.value)}
                              placeholder="ex: comprovativo_bai_15000kz.pdf"
                              className="mt-1 w-full rounded-xl border border-rose-200 bg-[#fffafd] p-3 text-xs outline-none focus:border-rose-400"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 text-xs font-bold text-white shadow-md hover:opacity-95"
                          >
                            Confirmar & Submeter Comprovativo Verdadeiro
                          </button>
                        </form>
                      ) : (
                        <div className="py-4 text-center">
                          <CheckCircle2 className="size-10 text-emerald-600 mx-auto mb-2" />
                          <h4 className="font-serif text-lg font-bold text-stone-900">Comprovativo Submetido!</h4>
                          <p className="text-xs text-stone-500 mt-1">O Administrador Master foi notificado e ativará a sua loja após verificação bancária.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEPARADOR 2: ESTILO & TEMPLATES VISUAIS */}
          {activeTab === 'customization' && (
            <section className="rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-rose-100 pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-normal">Estilo Visual & Escolha de Template</h2>
                  <p className="text-xs text-stone-500">Escolha o estilo da página pública do salão.</p>
                </div>
                <Palette className="size-6 text-rose-400" />
              </div>

              <form onSubmit={handleSaveSalonCustomization} className="mt-6 flex flex-col gap-6">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase block mb-3">Escolher Template Visual da Página</label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { id: 'luxe-pink', name: 'Rose Luxe (Rosa & Luxo)', desc: 'Fundo suave rosa com toques editoriais de alta beleza.' },
                      { id: 'nordic-minimal', name: 'Nórdico Minimalista', desc: 'Linhas sóbrias em tons marfim e preto com sofisticação clássica.' },
                      { id: 'dark-glamour', name: 'Dark Glamour Velvet', desc: 'Ambiente noturno luxuoso com iluminação rosa vibrante.' },
                    ].map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => setSalon({ ...salon, templateId: tpl.id as any })}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                          salon.templateId === tpl.id
                            ? 'border-rose-600 bg-rose-50/70 shadow-md'
                            : 'border-rose-100 bg-[#fffafd] hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-base font-bold text-stone-900">{tpl.name}</h4>
                          {salon.templateId === tpl.id && <Check className="size-4 text-rose-600" />}
                        </div>
                        <p className="mt-2 text-xs text-stone-500 leading-relaxed">{tpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-[#fffafd] p-5">
                  <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Cor do Tema dos Botões & Destaques</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <input
                      type="color"
                      value={salon.themeColor || '#e11d48'}
                      onChange={(e) => setSalon({ ...salon, themeColor: e.target.value })}
                      className="size-12 rounded-xl cursor-pointer border-0 shadow-md"
                    />
                    <span className="font-mono text-xs font-bold text-rose-900">{salon.themeColor || '#e11d48'}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-3.5 text-xs font-bold text-white shadow-md shadow-rose-500/20"
                >
                  <Save className="size-4" /> Guardar Estilo Visual
                </button>
              </form>
            </section>
          )}

          {/* SEPARADOR 3: LOJA DE PRODUTOS */}
          {activeTab === 'products' && (
            <section className="rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-100 pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-normal">Produtos Registados na Loja</h2>
                  <p className="text-xs text-stone-500">Gestão e registo de cosméticos com preço em Kwanzas.</p>
                </div>

                <button
                  onClick={() => setShowProductModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:opacity-95"
                >
                  <Plus className="size-4" /> Registar Produto
                </button>
              </div>

              <div className="mt-6 relative">
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Pesquisar produto por nome ou categoria..."
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Search className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>

              <div className="mt-6 divide-y divide-rose-100">
                {filteredProducts.length === 0 ? (
                  <p className="py-8 text-center text-xs text-stone-400">Nenhum produto encontrado.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <img src={p.image} alt={p.name} className="size-14 rounded-2xl object-cover border border-rose-200 shadow-sm" />
                        <div>
                          <p className="font-serif font-bold text-sm text-stone-900">{p.name}</p>
                          <p className="text-xs text-stone-500">{p.description} · <span className="font-semibold text-rose-700">{p.category}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif font-bold text-stone-900">{formatKz(p.price)}</span>
                        <button onClick={() => removeProduct(p.id)} className="text-stone-300 hover:text-red-600 transition">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SEPARADOR 4: MENU DE SERVIÇOS */}
          {activeTab === 'services' && (
            <section className="rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-rose-100 pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-normal">Serviços de Beleza Registados</h2>
                  <p className="text-xs text-stone-500">Gestão e registo de tratamentos capilares com foto e preço.</p>
                </div>

                <button
                  onClick={() => setShowServiceModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:opacity-95"
                >
                  <Plus className="size-4" /> Registar Serviço
                </button>
              </div>

              <div className="mt-6 relative">
                <input
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Pesquisar serviço por nome ou categoria..."
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Search className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>

              <div className="mt-6 divide-y divide-rose-100">
                {filteredServices.length === 0 ? (
                  <p className="py-8 text-center text-xs text-stone-400">Nenhum serviço encontrado.</p>
                ) : (
                  filteredServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="size-14 rounded-2xl object-cover border border-rose-200 shadow-sm" />
                        ) : (
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold text-xs">
                            SGS
                          </div>
                        )}
                        <div>
                          <p className="font-serif font-bold text-sm text-stone-900">{s.name}</p>
                          <p className="text-xs text-stone-500">{s.description} · <span className="font-semibold text-rose-700">{s.duration_minutes} min</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif font-bold text-stone-900">{formatKz(s.price)}</span>
                        <button onClick={() => removeService(s.id)} className="text-stone-300 hover:text-red-600 transition">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SEPARADOR 5: MARCAÇÕES */}
          {activeTab === 'bookings' && (
            <section className="rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="border-b border-rose-100 pb-5">
                <h2 className="font-serif text-2xl font-normal">Agenda de Marcações</h2>
                <p className="text-xs text-stone-500">Histórico e próximos atendimentos de clientes.</p>
              </div>

              <div className="mt-6 relative">
                <input
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Pesquisar marcação por cliente ou serviço..."
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Search className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>

              <div className="mt-6 flex flex-col gap-4">
                {filteredBookings.length === 0 ? (
                  <p className="py-8 text-center text-xs text-stone-400">Nenhuma marcação encontrada na agenda.</p>
                ) : (
                  filteredBookings.map((b) => (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-rose-200/80 bg-[#fffafd] p-5 shadow-sm gap-4 hover:border-rose-300 transition">
                      <div className="flex items-center gap-4">
                        <img src={b.client_avatar} alt={b.client_name} className="size-14 rounded-2xl object-cover border-2 border-rose-200 shadow-md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-stone-900">{b.client_name}</h4>
                            <span className="rounded-full bg-rose-100 border border-rose-200 px-3 py-0.5 text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                              {b.service_name}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
                            <span className="flex items-center gap-1 text-stone-700 font-bold">
                              <Phone className="size-3.5 text-rose-600" /> {b.client_phone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5 text-rose-500" /> {b.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5 text-rose-500" /> {b.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-rose-100 justify-between sm:justify-end">
                        <span className={`rounded-full px-3.5 py-1 text-xs font-bold flex items-center gap-1 ${
                          b.status === 'Confirmado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {b.status === 'Confirmado' ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <Clock className="size-3.5 text-amber-600" />}
                          {b.status}
                        </span>

                        {b.status !== 'Confirmado' && (
                          <button
                            onClick={async () => {
                              try {
                                await supabase.from('bookings').update({ status: 'Confirmado' }).eq('id', b.id)
                                setBookings((prev) => prev.map((item) => (item.id === b.id ? { ...item, status: 'Confirmado' } : item)))
                              } catch (err) {
                                console.error('Erro ao confirmar marcação:', err)
                              }
                            }}
                            className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95"
                          >
                            Confirmar Atendimento
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL EDITAR DETALHES DO SALÃO (SOBRE O SALÃO) */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Editar Perfil do Salão</span>
                <h3 className="font-serif text-2xl font-normal">Informações & Contactos</h3>
              </div>
              <button onClick={() => setShowEditInfoModal(false)} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalonCustomization} className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Salão</label>
                  <input
                    value={salon.name}
                    onChange={(e) => setSalon({ ...salon, name: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Subtítulo / Tagline</label>
                  <input
                    value={salon.tagline}
                    onChange={(e) => setSalon({ ...salon, tagline: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              {/* SECCÃO DEDICADA PARA FOTO/VÍDEO DE CAPA HERO E LOGÓTIPO */}
              <div className="rounded-2xl border border-rose-200 bg-[#fffafd] p-4 flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Foto / Vídeo de Capa (Hero Banner)</span>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-500 uppercase">Foto de Capa (URL ou Upload)</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        value={salon.coverImage}
                        onChange={(e) => setSalon({ ...salon, coverImage: e.target.value })}
                        placeholder="https://exemplo.com/capa.jpg"
                        className="flex-1 rounded-2xl border border-rose-200 bg-white p-3 text-xs outline-none"
                      />
                      <input type="file" accept="image/*" ref={coverFileRef} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
                      <button
                        type="button"
                        onClick={() => coverFileRef.current?.click()}
                        className="rounded-2xl bg-rose-100 px-3 text-xs font-bold text-rose-800 hover:bg-rose-200 whitespace-nowrap"
                      >
                        Upload
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-500 uppercase">Vídeo Promocional de Capa (URL)</label>
                    <input
                      value={salon.heroVideoUrl || ''}
                      onChange={(e) => setSalon({ ...salon, heroVideoUrl: e.target.value, heroMediaType: e.target.value ? 'video' : 'image' })}
                      placeholder="https://assets.mixkit.co/video.mp4 (Até 10MB)"
                      className="mt-1 w-full rounded-2xl border border-rose-200 bg-white p-3 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Cidade</label>
                  <select
                    value={salon.city}
                    onChange={(e) => setSalon({ ...salon, city: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  >
                    <option>Luanda</option>
                    <option>Benguela</option>
                    <option>Huambo</option>
                    <option>Lubango</option>
                    <option>Cabinda</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Endereço</label>
                  <input
                    value={salon.address}
                    onChange={(e) => setSalon({ ...salon, address: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Telefone / WhatsApp</label>
                  <input
                    value={salon.phone}
                    onChange={(e) => setSalon({ ...salon, phone: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Email</label>
                  <input
                    value={salon.email}
                    onChange={(e) => setSalon({ ...salon, email: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Instagram</label>
                  <input
                    value={salon.instagram || ''}
                    onChange={(e) => setSalon({ ...salon, instagram: e.target.value })}
                    placeholder="@seu.salao.ao"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Facebook</label>
                  <input
                    value={salon.facebook || ''}
                    onChange={(e) => setSalon({ ...salon, facebook: e.target.value })}
                    placeholder="SeuSalãoLuanda"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Sobre o Salão (História & Especialidades)</label>
                <textarea
                  rows={3}
                  value={salon.description}
                  onChange={(e) => setSalon({ ...salon, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25"
              >
                Guardar Alterações do Salão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTAR PRODUTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Novo Produto</span>
                <h3 className="font-serif text-2xl font-normal">Registar Produto na Loja</h3>
              </div>
              <button onClick={() => setShowProductModal(false)} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={addProduct} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Produto</label>
                <input
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex: Óleo de Argan 100ml"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Preço em Kz</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="18500"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Categoria</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  >
                    <option>Cabelo</option>
                    <option>Tratamentos</option>
                    <option>Cosméticos</option>
                    <option>Unhas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Descrição</label>
                <input
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Ex: Sérum nutritivo para restauração de pontas."
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <img src={newProductImage} alt="Pré-visualização" className="size-14 rounded-2xl object-cover border-2 border-rose-200" />
                <input type="file" accept="image/*" ref={productFileRef} onChange={(e) => handleImageUpload(e, 'product')} className="hidden" />
                <button
                  type="button"
                  onClick={() => productFileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-[#fffafd] px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-rose-50"
                >
                  <Upload className="size-3.5 text-rose-600" /> Carregar Foto do Computador
                </button>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25"
              >
                Concluir Registo do Produto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTAR SERVIÇO */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Novo Serviço</span>
                <h3 className="font-serif text-2xl font-normal">Registar Novo Serviço</h3>
              </div>
              <button onClick={() => setShowServiceModal(false)} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={addService} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Serviço</label>
                <input
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ex: Balayage de Autor & Gloss 3D"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Preço em Kz</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="25000"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase">Duração (minutos)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="60"
                    className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Descrição Detalhada</label>
                <input
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Ex: Diagnóstico individual de visagismo e styling."
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              {/* UPLOAD DE FOTO E VÍDEO DO SERVIÇO (MÁX 10MB) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-500 uppercase block">Mídia do Serviço (Foto ou Vídeo até 10MB)</label>
                
                <div className="flex flex-wrap items-center gap-3">
                  <input type="file" accept="image/*" ref={serviceFileRef} onChange={(e) => { handleImageUpload(e, 'service'); setNewServiceMediaType('image') }} className="hidden" />
                  <input type="file" accept="video/mp4,video/webm" ref={serviceVideoFileRef} onChange={handleVideoUpload} className="hidden" />

                  <button
                    type="button"
                    onClick={() => serviceFileRef.current?.click()}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                      newServiceMediaType === 'image' ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-rose-200 bg-white text-stone-700'
                    }`}
                  >
                    <Upload className="size-3.5 text-rose-600" /> Foto
                  </button>

                  <button
                    type="button"
                    onClick={() => serviceVideoFileRef.current?.click()}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                      newServiceMediaType === 'video' ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-rose-200 bg-white text-stone-700'
                    }`}
                  >
                    <Upload className="size-3.5 text-rose-600" /> Carregar Vídeo (Máx 10MB)
                  </button>
                </div>

                {videoUploadError && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{videoUploadError}</p>
                )}

                {newServiceMediaType === 'video' && newServiceVideoUrl && (
                  <div className="relative rounded-2xl overflow-hidden h-32 w-full border border-rose-200 bg-black mt-2">
                    <video src={newServiceVideoUrl} controls className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                      Vídeo Carregado (10MB Max)
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25"
              >
                Concluir Registo do Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
