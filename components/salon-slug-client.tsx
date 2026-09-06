'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { SalonData, ServiceData, initialServices } from '@/lib/salons-data'
import SalonPublicView from '@/components/salon-public-view'

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

  useEffect(() => {
    let foundSalon = initialSalon

    // Tenta encontrar o salão guardado no localStorage sgs_global_salons
    const savedSalonsStr = localStorage.getItem('sgs_global_salons')
    if (savedSalonsStr) {
      try {
        const parsedSalons: SalonData[] = JSON.parse(savedSalonsStr)
        const match = parsedSalons.find((s) => s.slug === slug)
        if (match) {
          foundSalon = match
        }
      } catch (err) {
        console.error('Erro ao ler sgs_global_salons no client:', err)
      }
    }

    if (foundSalon) {
      setSalon(foundSalon)
      const matchingServices = initialServices.filter((s) => s.salon_id === foundSalon?.id)
      setServices(matchingServices.length > 0 ? matchingServices : defaultServices)
    }

    setLoaded(true)
  }, [slug, initialSalon, defaultServices])

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
