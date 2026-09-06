export type ProductData = {
  id: string
  salon_id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
}

export type MediaItemData = {
  id: string
  type: 'image' | 'video'
  url: string
  title: string
  category?: string
}

export type SubscriptionPlan = {
  id: string
  name: string // Ex: Facilita, Simplifica, Gold
  price: number // Em Kwanzas
  billingCycle: 'mensal' | 'semestral' | 'anual'
  description: string
  popular?: boolean
}

export type PaymentProof = {
  id: string
  salon_id: string
  plan_id: string
  plan_name: string
  amount: number
  proof_file_name: string
  submitted_at: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
}

export type SalonData = {
  id: string
  name: string
  tagline: string
  slug: string
  city: string
  province?: string // Província de Angola (ex: Luanda, Benguela, Huambo)
  municipality?: string // Município (ex: Talatona, Belas, Cazenga, Lobito)
  address: string
  phone: string
  email: string
  description: string
  status: 'approved' | 'pending'
  owner_id: string
  rating: number
  reviewsCount: number
  coverImage: string
  avatarImage: string
  gallery: string[]
  mediaGallery?: MediaItemData[] // Galeria futurista com imagens e vídeos 3D / iPhone style
  stylists: { name: string; role: string; avatar: string }[]
  templateId: 'luxe-pink' | 'nordic-minimal' | 'dark-glamour'
  themeColor: string
  textColor: string
  fontFamily: 'serif' | 'sans'
  footerText: string
  instagram?: string
  facebook?: string
  // Dados de Subscrição / Planos SaaS
  plan_id?: string
  plan_name?: string
  plan_status?: 'sem_plano' | 'aguardando_comprovativo' | 'em_analise' | 'ativo' | 'expirado'
  plan_expires_at?: string // Data de expiração ISO
  payment_proof?: PaymentProof
}

export type ServiceData = {
  id: string
  salon_id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  image?: string
  videoUrl?: string // Suporte para vídeos promocionais do serviço (até 10MB)
  mediaType?: 'image' | 'video'
  active: boolean
  category: string
  popular?: boolean
}

export type BookingData = {
  id: string
  salon_id: string
  service_name: string
  date: string
  time: string
  client_name: string
  client_phone: string
  client_avatar: string
  status: 'Confirmado' | 'Pendente' | 'Concluído'
}

export const initialPlatformBankDetails = {
  bankName: 'Banco BAI',
  accountHolder: 'SGS - Gestão de Serviços Lda',
  iban: 'AO06 0040 0000 1234 5678 9012 3',
  whatsappSupport: '+244 923 456 789',
}

export const initialPlans: SubscriptionPlan[] = [
  {
    id: 'plan-facilita',
    name: 'Facilita',
    price: 15000,
    billingCycle: 'mensal',
    description: 'Ideal para pequenos salões e estúdios que querem agendamentos automáticos em Kwanzas.',
  },
  {
    id: 'plan-simplifica',
    name: 'Simplifica',
    price: 35000,
    billingCycle: 'semestral',
    description: 'O plano mais equilibrado com galeria futurista de fotos e vídeos HD para o seu salão.',
    popular: true,
  },
  {
    id: 'plan-gold',
    name: 'Gold VIP',
    price: 60000,
    billingCycle: 'anual',
    description: 'Acesso total, gestão completa da equipa, suporte prioritário 24/7 e selo VIP de verificação.',
  },
]

export const PresetImages = {
  covers: [
    { id: 'c1', label: 'Atelier Salão de Luxo', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85' },
    { id: 'c2', label: 'Spa & Wellness Holístico', url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1600&q=85' },
    { id: 'c3', label: 'Estúdio Barbearia & High Fashion', url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85' },
  ],
  avatars: [
    { id: 'a1', label: 'Logótipo Elegante 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { id: 'a2', label: 'Logótipo Elegante 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
  ]
}

export const initialSalons: SalonData[] = []

export const initialProducts: ProductData[] = [
  {
    id: 'p1',
    salon_id: 'lumiere',
    name: 'Óleo Capilar Elixir Silk Lumière 100ml',
    description: 'Sérum nutritivo com óleo de argan e macadâmia para brilho tridimensional e proteção térmica.',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1608248597261-e4d0947c6b1e?auto=format&fit=crop&w=600&q=80',
    category: 'Cabelo',
    inStock: true,
  },
]

export const initialServices: ServiceData[] = [
  {
    id: 's1',
    salon_id: 'lumiere',
    name: 'Corte de Autor & Brushing Silk',
    description: 'Diagnóstico individual de visagismo, lavagem sensorial com óleos botânicos e styling personalizado.',
    duration_minutes: 60,
    price: 25000,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
    active: true,
    category: 'Cabelo',
    popular: true,
  },
]

export const initialBookings: BookingData[] = []
