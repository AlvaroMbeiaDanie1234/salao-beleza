'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { SalonData, ServiceData, initialServices } from '@/lib/salons-data'
import SalonPublicView from '@/components/salon-public-view'

import { createClient } from '@/lib/supabase/client'

export default function SalonSlugClient({
  slug,
  initialSalon,
  initialServices: defaultServices,
}: {
  slug: string
  initialSalon?: SalonData
  initialServices: ServiceData[]
}) {
  const [salon, setSalon] = useState<SalonData | undefined>(initialSalon)
  const [services, setServices] = useState<ServiceData[]>(defaultServices)
  const [loaded, setLoaded] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSalonFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('slug', slug)
          .single()

        if (!error && data) {
          const mappedSalon: SalonData = {
            id: data.id,
            name: data.name,
            tagline: data.tagline || 'Salão de Beleza',
            slug: data.slug,
            city: data.city || 'Luanda',
            province: data.province,
            municipality: data.municipality,
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            description: data.description || '',
            status: data.status || 'approved',
            owner_id: data.owner_id || '',
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviews_count || 1),
            coverImage: data.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85',
            avatarImage: data.avatar_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            templateId: data.template_id || 'luxe-pink',
            themeColor: data.theme_color || '#e11d48',
            textColor: data.text_color || '#ffffff',
            fontFamily: data.font_family || 'serif',
            footerText: data.footer_text || '',
            gallery: data.gallery || [],
            mediaGallery: data.media_gallery || [],
            stylists: data.stylists || [],
            heroVideoUrl: data.hero_video_url,
            heroMediaType: data.hero_media_type,
            plan_id: data.plan_id,
            plan_name: data.plan_name,
            plan_status: data.plan_status,
          }
          setSalon(mappedSalon)

          // Carregar Serviços do Salão do Supabase
          const { data: sData, error: sErr } = await supabase
            .from('services')
            .select('*')
            .eq('salon_id', data.id)

          if (!sErr && sData && sData.length > 0) {
            const mappedServices: ServiceData[] = sData.map((s) => ({
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
            }))
            setServices(mappedServices)
          }
        }
      } catch (err) {
        console.error('Erro ao ler salão do Supabase:', err)
      } finally {
        setLoaded(true)
      }
    }

    fetchSalonFromSupabase()
  }, [slug])

  if (!loaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fff5f7]">
        <div className="size-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!salon) {
    return notFound()
  }

  return <SalonPublicView salon={salon} services={services} />
}
