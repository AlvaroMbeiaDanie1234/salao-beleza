'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { SalonData, ServiceData, BookingData, initialServices, initialBookings } from '@/lib/salons-data'
import SalonAdminView from '@/components/salon-admin-view'

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

  useEffect(() => {
    let foundSalon = initialSalon

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
      const matchingBookings = initialBookings.filter((b) => b.salon_id === foundSalon?.id)
      setBookings(matchingBookings.length > 0 ? matchingBookings : defaultBookings)
    }

    setLoaded(true)
  }, [slug, initialSalon, defaultServices, defaultBookings])

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

  return <SalonAdminView salon={salon} services={services} bookings={bookings} />
}
