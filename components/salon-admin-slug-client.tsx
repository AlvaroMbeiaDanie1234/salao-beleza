'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { SalonData, ServiceData, BookingData, initialServices, initialBookings } from '@/lib/salons-data'
import SalonAdminView from '@/components/salon-admin-view'

import { createClient } from '@/lib/supabase/client'

export default function SalonAdminSlugClient({
  slug,
  initialSalon,
  initialServices: defaultServices,
  initialBookings: defaultBookings,
}: {
  slug: string
  initialSalon?: SalonData
  initialServices: ServiceData[]
  initialBookings: BookingData[]
}) {
  const [salon, setSalon] = useState<SalonData | undefined>(initialSalon)
  const [services, setServices] = useState<ServiceData[]>(defaultServices)
  const [bookings, setBookings] = useState<BookingData[]>(defaultBookings)
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
        }
      } catch (err) {
        console.error('Erro ao ler salão admin do Supabase:', err)
      } finally {
        setLoaded(true)
      }
    }

    fetchSalonFromSupabase()
  }, [slug])

  if (!loaded && !salon) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fff5f7]">
        <div className="size-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff5f7] p-6 text-center text-stone-900">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-bold text-2xl">
            ?
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold">Painel do Salão Não Encontrado</h2>
          <p className="mt-2 text-xs text-stone-500">
            Não foi encontrado nenhum salão com a conta <span className="font-mono font-bold text-rose-700">/{slug}/admin</span>.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:opacity-90"
          >
            Voltar à Página Principal
          </a>
        </div>
      </div>
    )
  }

  return <SalonAdminView salon={salon} services={services} bookings={bookings} />
}
