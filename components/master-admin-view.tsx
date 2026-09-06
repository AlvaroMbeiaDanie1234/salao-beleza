'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { initialSalons, SalonData, initialPlans, SubscriptionPlan, initialPlatformBankDetails } from '@/lib/salons-data'
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Users2,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  UserCheck,
  Lock,
  ArrowLeft,
  Store,
  Scissors,
  Menu,
  LogOut,
  LayoutDashboard,
  Store as StoreIcon,
  DollarSign,
  Trash2,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function MasterAdminView() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [salons, setSalons] = useState<SalonData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all')

  const supabase = createClient()

  // Carregar salões diretamente da BD Supabase em tempo real
  useEffect(() => {
    async function loadSalonsFromSupabase() {
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
            payment_proof: s.payment_proof,
          }))
          setSalons(mappedSalons)
        }
      } catch (err) {
        console.error('Erro ao ler salões do Supabase:', err)
      }
    }

    loadSalonsFromSupabase()
    const interval = setInterval(loadSalonsFromSupabase, 2500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Sidebar Ativa Master
  const [activeTab, setActiveTab] = useState<'salons' | 'plans' | 'analytics' | 'settings'>('salons')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Planos SaaS Geridos pelo Admin Principal
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
  const [bankDetails, setBankDetails] = useState(initialPlatformBankDetails)

  // Modais de Criação de Planos
  const [showAddPlanModal, setShowAddPlanModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanPrice, setNewPlanPrice] = useState('20000')
  const [newPlanCycle, setNewPlanCycle] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const [newPlanDesc, setNewPlanDesc] = useState('')

  // Carregar planos da BD Supabase
  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase.from('subscription_plans').select('*')
        if (!error && data && data.length > 0) {
          const mappedPlans: SubscriptionPlan[] = data.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            billingCycle: p.billing_cycle,
            description: p.description,
            popular: p.popular,
          }))
          setPlans(mappedPlans)
        }
      } catch (err) {
        console.error('Erro ao carregar planos:', err)
      }
    }
    loadPlans()
  }, [])

  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!newPlanName) return
    const newPlan: SubscriptionPlan = {
      id: 'plan-' + Date.now(),
      name: newPlanName,
      price: Number(newPlanPrice) || 20000,
      billingCycle: newPlanCycle,
      description: newPlanDesc || 'Plano customizado do sistema SGS',
    }
    const updated = [...plans, newPlan]
    setPlans(updated)
    localStorage.setItem('sgs_global_plans', JSON.stringify(updated))
    setShowAddPlanModal(false)
    setNewPlanName('')
    setNewPlanDesc('')
    confetti({ particleCount: 70, spread: 60 })
  }

  function handleUpdateBankDetails(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('sgs_platform_bank', JSON.stringify(bankDetails))
    confetti({ particleCount: 50, spread: 50 })
  }

  async function handleApproveProof(salonId: string) {
    const targetSalon = salons.find((s) => s.id === salonId)
    if (!targetSalon) return

    const daysToAdd = targetSalon.payment_proof?.plan_name.toLowerCase().includes('anual')
      ? 365
      : targetSalon.payment_proof?.plan_name.toLowerCase().includes('semestral')
      ? 180
      : 30

    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + daysToAdd)

    const updatedProof = targetSalon.payment_proof
      ? { ...targetSalon.payment_proof, status: 'aprovado' as const }
      : undefined

    // Atualizar no Supabase
    try {
      await supabase.from('salons').update({
        status: 'approved',
        plan_status: 'ativo',
        plan_name: targetSalon.payment_proof?.plan_name || 'Ativo',
        plan_expires_at: expiresDate.toISOString(),
        payment_proof: updatedProof,
      }).eq('id', salonId)
    } catch (err) {
      console.error('Erro ao aprovar salão no Supabase:', err)
    }

    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? {
        ...s,
        status: 'approved',
        plan_status: 'ativo',
        plan_name: s.payment_proof?.plan_name || 'Ativo',
        plan_expires_at: expiresDate.toISOString(),
        payment_proof: updatedProof,
      } : s))
    )
    confetti({ particleCount: 100, spread: 80 })
  }

  // Estado para adicionar um novo salão manualmente pelo Admin Principal
  const [newSalonName, setNewSalonName] = useState('')
  const [newSalonCity, setNewSalonCity] = useState('Luanda')
  const [newSalonSlug, setNewSalonSlug] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === 'admin123' || passwordInput === '123456' || passwordInput === 'admin') {
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Palavra-passe de Admin incorreta. (Dica de teste: admin123 ou 123456)')
    }
  }

  const [deletingSalon, setDeletingSalon] = useState<SalonData | null>(null)

  async function handleDeleteSalon(id: string) {
    // Eliminar diretamente do Supabase
    try {
      await supabase.from('salons').delete().eq('id', id)
    } catch (err) {
      console.error('Erro ao eliminar salão do Supabase:', err)
    }

    setSalons((prev) => prev.filter((s) => s.id !== id))
    setDeletingSalon(null)
  }

  async function handleApproveSalon(id: string) {
    try {
      await supabase.from('salons').update({ status: 'approved' }).eq('id', id)
    } catch (err) {
      console.error('Erro ao aprovar salão no Supabase:', err)
    }

    setSalons((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s)))
    confetti({ particleCount: 70, spread: 60 })
  }

  async function handleCreateSalon(e: React.FormEvent) {
    e.preventDefault()
    if (!newSalonName) return
    const slug = newSalonSlug || newSalonName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const newSalon: SalonData = {
      id: 'salon-' + Date.now(),
      name: newSalonName,
      tagline: 'Salão de Beleza & Estética Avançada',
      slug,
      city: newSalonCity,
      address: 'Endereço Registado no SGS',
      phone: '+244 923 000 000',
      email: `${slug}@sgs.ao`,
      description: 'Espaço de beleza registado no Sistema de Gestão de Serviços.',
      status: 'approved',
      owner_id: 'owner-' + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      templateId: 'luxe-pink',
      themeColor: '#1c1917',
      textColor: '#fbf9f6',
      fontFamily: 'serif',
      footerText: `© 2026 ${newSalonName}. Todos os direitos reservados.`,
      gallery: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      ],
      stylists: [],
    }

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
      console.error('Erro ao criar salão no Supabase:', err)
    }

    setSalons((prev) => [newSalon, ...prev])
    setNewSalonName('')
    setNewSalonSlug('')
    setShowAddModal(false)
    confetti({ particleCount: 100, spread: 80 })
  }

  const [selectedProvince, setSelectedProvince] = useState<string>('todas')
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('todos')

  const filteredSalons = salons.filter((s) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(searchLower) ||
      s.city.toLowerCase().includes(searchLower) ||
      (s.province && s.province.toLowerCase().includes(searchLower)) ||
      (s.municipality && s.municipality.toLowerCase().includes(searchLower))

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    const matchesProvince = selectedProvince === 'todas' || (s.province || s.city) === selectedProvince
    const matchesMunicipality = selectedMunicipality === 'todos' || s.municipality === selectedMunicipality

    return matchesSearch && matchesStatus && matchesProvince && matchesMunicipality
  })

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#fff5f7] flex items-center justify-center p-4 sm:p-6 text-stone-900">
        <div className="w-full max-w-md rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-900 to-rose-600 text-white shadow-lg shadow-rose-500/25">
              <ShieldCheck className="size-8 text-rose-200" />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-normal">Admin Principal SGS</h1>
            <p className="mt-2 text-xs text-stone-500">
              Controlo Global de Salões Registados na Plataforma
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Palavra-passe de Administrador</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Insira a senha master (admin123)"
                  className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                />
                <Lock className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">Dica de teste: <span className="font-mono text-rose-700 font-bold">admin123</span> ou <span className="font-mono text-rose-700 font-bold">123456</span></p>
            </div>

            {authError && <p className="text-xs font-semibold text-red-600">{authError}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 py-4 text-xs font-bold text-white shadow-xl hover:opacity-95"
            >
              Aceder à Gestão Global do SaaS
            </button>
          </form>

          <div className="mt-6 border-t border-rose-100 pt-4 text-center">
            <Link href="/" className="text-xs font-semibold text-stone-500 hover:text-stone-900">
              ← Voltar à Plataforma Principal
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] text-[#2d1820] flex flex-col md:flex-row">
      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm md:hidden" />
      )}

      {/* SIDEBAR MASTER ADMIN */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-stone-950 text-white p-6 transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md">
                <ShieldCheck className="size-5 text-rose-100" />
              </div>
              <div>
                <span className="font-serif text-2xl font-black tracking-wider text-white">SGS</span>
                <p className="text-[9px] font-extrabold text-rose-400 uppercase tracking-widest">Master Admin</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-stone-400 hover:text-white">
              <X className="size-5" />
            </button>
          </div>

          <nav className="mt-6 space-y-1.5">
            {[
              { id: 'salons', label: 'Gestão de Salões', icon: StoreIcon },
              { id: 'plans', label: 'Planos & Pagamentos IBAN', icon: CreditCard },
              { id: 'analytics', label: 'Desempenho & Faturação', icon: TrendingUp },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-white'
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-stone-800 pt-4 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-xs font-semibold text-stone-300 hover:text-white"
          >
            <span>Ver Plataforma Pública</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            onClick={() => setAuthenticated(false)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-400 hover:text-red-400 transition"
          >
            <LogOut className="size-3.5" /> Sair do Master Admin
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (COM HEADER MOBILE RESPONSIVO) */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-rose-200/60 bg-white/90 px-4 py-3.5 backdrop-blur-md flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-stone-700">
            <Menu className="size-6 text-rose-600" />
            <span className="text-xs font-bold font-serif">Menu Master</span>
          </button>
          <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            SGS Admin
          </span>
        </header>

        <main className="p-4 sm:p-6 md:p-10 max-w-6xl w-full mx-auto">
          {/* TAB DE GESTÃO DE PLANOS & IBAN DE PAGAMENTO */}
          {activeTab === 'plans' ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2.5rem] border border-rose-200 bg-white p-8 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">SaaS Subscrições</span>
                  <h2 className="mt-1 font-serif text-3xl font-normal">Planos de Pagamento & Dados IBAN</h2>
                  <p className="mt-1 text-xs text-stone-500">Crie planos customizados e configure as coordenadas bancárias para validação de comprovativos.</p>
                </div>
                <button
                  onClick={() => setShowAddPlanModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:opacity-95"
                >
                  <Plus className="size-4" /> Criar Novo Plano
                </button>
              </div>

              {/* LISTA DE PLANOS CADASTRADOS */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                  <div key={p.id} className="relative rounded-[2.5rem] border border-rose-200 bg-white p-7 shadow-sm flex flex-col justify-between">
                    {p.popular && (
                      <span className="absolute top-4 right-4 rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Mais Vendido
                      </span>
                    )}
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-stone-900">{p.name}</h3>
                      <p className="mt-1 text-xs text-stone-500">{p.description}</p>
                      <div className="mt-6">
                        <span className="font-serif text-3xl font-bold text-stone-900">{p.price.toLocaleString('pt-AO')} Kz</span>
                        <span className="text-xs text-stone-400 font-medium"> / {p.billingCycle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updated = plans.filter((item) => item.id !== p.id)
                        setPlans(updated)
                        localStorage.setItem('sgs_global_plans', JSON.stringify(updated))
                      }}
                      className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-2xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 className="size-3.5" /> Remover Plano
                    </button>
                  </div>
                ))}
              </div>

              {/* CONFIGURAÇÃO DO IBAN DA PLATAFORMA */}
              <div className="rounded-[2.5rem] border border-rose-200 bg-white p-8 shadow-sm">
                <h3 className="font-serif text-2xl font-normal text-stone-900">Coordenadas Bancárias da Plataforma (IBAN)</h3>
                <p className="mt-1 text-xs text-stone-500">Estes dados serão apresentados aos proprietários de salões para efetuarem o pagamento via transferência bancária.</p>

                <form onSubmit={handleUpdateBankDetails} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Banco</label>
                    <input
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-500 uppercase">Titular da Conta</label>
                    <input
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3 text-sm outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase">Número de IBAN</label>
                    <input
                      value={bankDetails.iban}
                      onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3 text-sm font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-full bg-stone-900 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-stone-800"
                    >
                      Guardar Alterações do IBAN
                    </button>
                  </div>
                </form>
              </div>

              {/* COMPROVATIVOS DE PAGAMENTO PENDENTES PARA ANÁLISE */}
              <div className="rounded-[2.5rem] border border-rose-200 bg-white p-8 shadow-sm">
                <h3 className="font-serif text-2xl font-normal text-stone-900">Comprovativos de Pagamento Pendentes</h3>
                <p className="mt-1 text-xs text-stone-500">Valide os comprovativos enviados pelos donos de salões para ativar as suas contas.</p>

                <div className="mt-6 divide-y divide-rose-100">
                  {salons.filter((s) => s.payment_proof && s.payment_proof.status === 'pendente').length === 0 ? (
                    <p className="py-6 text-center text-xs text-stone-400 font-medium">Nenhum comprovativo pendente de validação neste momento.</p>
                  ) : (
                    salons.filter((s) => s.payment_proof && s.payment_proof.status === 'pendente').map((s) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                        <div>
                          <p className="font-serif font-semibold text-stone-900">{s.name}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Plano Escolhido: <strong className="text-rose-600">{s.payment_proof?.plan_name}</strong> ({s.payment_proof?.amount.toLocaleString('pt-AO')} Kz)
                          </p>
                          <p className="text-[11px] font-mono text-stone-400 mt-1">
                            Ficheiro: {s.payment_proof?.proof_file_name} · Recebido: {s.payment_proof?.submitted_at}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveProof(s.id)}
                            className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
                          >
                            Aprovar Pagamento & Ativar Loja
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* BANNER DE BOAS-VINDAS & BOTÃO DE NOVO SALÃO */}
          <div className="flex flex-col gap-6 rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Painel de Controlo SaaS</span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal">Visão Geral dos Salões</h2>
              <p className="mt-1 text-xs text-stone-500">Acompanhe a aprovação, estado e endpoints de todos os estabelecimentos da rede.</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:opacity-95"
            >
              <Plus className="size-4" /> Aprovar / Registar Novo Salão
            </button>
          </div>

          {/* MÉTRICAS GLOBAIS DA REDE */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold text-stone-400 uppercase">Total de Salões</span>
              <p className="mt-2 font-serif text-4xl font-normal text-stone-900">{salons.length}</p>
            </div>
            <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold text-stone-400 uppercase">Salões Aprovados</span>
              <p className="mt-2 font-serif text-4xl font-normal text-emerald-600">
                {salons.filter((s) => s.status === 'approved').length}
              </p>
            </div>
            <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold text-stone-400 uppercase">Pendentes de Aprovação</span>
              <p className="mt-2 font-serif text-4xl font-normal text-amber-600">
                {salons.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold text-stone-400 uppercase">Faturação Global Estimada</span>
              <p className="mt-2 font-serif text-3xl font-normal text-rose-900">14.850.000 Kz</p>
            </div>
          </div>

          {/* TABELA E PESQUISA DE SALÕES */}
          <div className="mt-10 rounded-[2.5rem] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-rose-100 pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar salão por nome, cidade ou província..."
                    className="w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 pl-10 text-sm outline-none focus:border-rose-400"
                  />
                  <Search className="absolute left-3.5 top-3.5 size-4 text-stone-400" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                      filterStatus === 'all' ? 'bg-stone-900 text-white' : 'bg-rose-50 text-stone-700 hover:bg-rose-100'
                    }`}
                  >
                    Todos ({salons.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('approved')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                      filterStatus === 'approved' ? 'bg-emerald-700 text-white' : 'bg-rose-50 text-stone-700 hover:bg-rose-100'
                    }`}
                  >
                    Aprovados
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${
                      filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-rose-50 text-stone-700 hover:bg-rose-100'
                    }`}
                  >
                    Pendentes
                  </button>
                </div>
              </div>

              {/* FILTROS AVANÇADOS POR PROVÍNCIA E MUNICÍPIO DE ANGOLA */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                  <SlidersHorizontal className="size-3.5 text-rose-600" /> FiltrosGeográficos:
                </span>

                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="rounded-xl border border-rose-200 bg-[#fffafd] px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none"
                >
                  <option value="todas">Todas as Províncias</option>
                  <option value="Luanda">Luanda</option>
                  <option value="Benguela">Benguela</option>
                  <option value="Huambo">Huambo</option>
                  <option value="Lubango">Huíla (Lubango)</option>
                  <option value="Cabinda">Cabinda</option>
                </select>

                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="rounded-xl border border-rose-200 bg-[#fffafd] px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none"
                >
                  <option value="todos">Todos os Municípios</option>
                  <option value="Talatona">Talatona</option>
                  <option value="Belas">Belas</option>
                  <option value="Cazenga">Cazenga</option>
                  <option value="Viana">Viana</option>
                  <option value="Lobito">Lobito</option>
                </select>

                {(selectedProvince !== 'todas' || selectedMunicipality !== 'todos') && (
                  <button
                    onClick={() => {
                      setSelectedProvince('todas')
                      setSelectedMunicipality('todos')
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 divide-y divide-rose-100">
              {filteredSalons.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={s.avatarImage} alt={s.name} className="size-14 rounded-2xl object-cover border-2 border-rose-200 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl font-normal text-stone-900">{s.name}</h3>
                        <span className="text-xs font-mono text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          /{s.slug}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1"><MapPin className="inline size-3.5 mr-1" />{s.city} · {s.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {s.status === 'approved' ? (
                      <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="size-3.5" /> Aprovado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveSalon(s.id)}
                        className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
                      >
                        Aprovar Salão
                      </button>
                    )}

                    <Link
                      href={`/${s.slug}/admin`}
                      target="_blank"
                      className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-rose-50"
                    >
                      Painel /admin
                    </Link>

                    <Link
                      href={`/${s.slug}`}
                      target="_blank"
                      className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                    >
                      Ver Página <ArrowUpRight className="inline size-3.5 ml-1" />
                    </Link>

                    {/* Botão de Apagar Salão */}
                    <button
                      onClick={() => setDeletingSalon(s)}
                      className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white shadow-sm"
                      title="Apagar Salão da Plataforma"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE APAGAR SALÃO */}
      {deletingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border border-red-100">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4 mx-auto">
              <Trash2 className="size-7" />
            </div>

            <h3 className="font-serif text-2xl font-normal text-center text-stone-900">Apagar Salão?</h3>
            <p className="mt-2 text-xs text-center text-stone-500 leading-relaxed">
              Tem a certeza que deseja remover o salão <strong className="text-stone-900">{deletingSalon.name}</strong> (`/{deletingSalon.slug}`)? Esta ação apagará permanentemente a conta e a página deste salão da plataforma.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeletingSalon(null)}
                className="w-1/2 rounded-full border border-stone-200 bg-white py-3.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSalon(deletingSalon.id)}
                className="w-1/2 rounded-full bg-red-600 py-3.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-lg shadow-red-500/25"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR NOVO SALÃO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <h3 className="font-serif text-2xl font-normal">Registar Salão na Rede</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalon} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Salão</label>
                <input
                  required
                  value={newSalonName}
                  onChange={(e) => setNewSalonName(e.target.value)}
                  placeholder="Ex: Studio Glamour Luanda"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Cidade</label>
                <select value={newSalonCity} onChange={(e) => setNewSalonCity(e.target.value)} className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none">
                  <option>Luanda</option>
                  <option>Benguela</option>
                  <option>Huambo</option>
                  <option>Lubango</option>
                  <option>Cabinda</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">URL Slug (Endpoint)</label>
                <input
                  value={newSalonSlug}
                  onChange={(e) => setNewSalonSlug(e.target.value)}
                  placeholder="ex: studio-glamour"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25"
              >
                Criar e Aprovar Salão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR NOVO PLANO */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <h3 className="font-serif text-2xl font-normal">Criar Plano de Subscrição</h3>
              <button onClick={() => setShowAddPlanModal(false)} className="rounded-full p-2 text-stone-400 hover:bg-rose-50">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Nome do Plano</label>
                <input
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Ex: Facilita / Simplifica / Gold"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Preço em Kwanzas (Kz)</label>
                <input
                  required
                  type="number"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(e.target.value)}
                  placeholder="25000"
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Periodicidade / Tempo</label>
                <select
                  value={newPlanCycle}
                  onChange={(e) => setNewPlanCycle(e.target.value as any)}
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none"
                >
                  <option value="mensal">Mensal</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Descrição do Plano</label>
                <textarea
                  rows={3}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Descreva as vantagens e acessos incluídos neste plano..."
                  className="mt-1 w-full rounded-2xl border border-rose-200 bg-[#fffafd] p-3.5 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 py-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25"
              >
                Guardar Novo Plano SaaS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
