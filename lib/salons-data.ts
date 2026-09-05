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

export type SalonData = {
  id: string
  name: string
  tagline: string
  slug: string
  city: string
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
}

export type ServiceData = {
  id: string
  salon_id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  image?: string
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

export const initialSalons: SalonData[] = [
  {
    id: 'lumiere',
    name: 'Atelier Lumière',
    tagline: 'Haute Coiffure & Saúde Capilar Orgânica',
    slug: 'atelier-lumiere',
    city: 'Luanda',
    address: 'Avenida 4 de Fevereiro · Talatona',
    phone: '+244 923 456 789',
    email: 'contacto@lumiere.ao',
    description: 'Um santuário de beleza e visagismo no coração de Luanda. Especialistas em balayage de autor, saúde capilar orgânica e experiências sensoriais exclusivas.',
    status: 'approved',
    owner_id: 'owner-lumiere',
    rating: 4.9,
    reviewsCount: 148,
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
    avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    templateId: 'luxe-pink',
    themeColor: '#e11d48',
    textColor: '#ffffff',
    fontFamily: 'serif',
    footerText: '© 2026 Atelier Lumière. Todos os direitos reservados.',
    instagram: '@atelier.lumiere.ao',
    facebook: 'AtelierLumiereLuanda',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    ],
    mediaGallery: [
      { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85', title: 'Haute Coiffure Atelier', category: 'Cortes' },
      { id: 'm2', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-brushing-a-clients-hair-41246-large.mp4', title: 'Brushing Silk em Ação', category: 'Vídeo Demonstrativo' },
      { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85', title: 'Trança Nagô Elegante', category: 'Trança de Autor' },
      { id: 'm4', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-getting-her-hair-washed-at-a-salon-41244-large.mp4', title: 'Lavagem Sensorial & Massagem', category: 'Vídeo Spa' },
      { id: 'm5', type: 'image', url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85', title: 'Manicura Russa de Precisão', category: 'Unhas' },
    ],
    stylists: [
      { name: 'Camila Lumière', role: 'Master Stylist & Visagista', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
      { name: 'Diogo Ribeiro', role: 'Colorista de Autor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Beatriz Costa', role: 'Técnica de Manicura Russa', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
    ],
  },
]

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
