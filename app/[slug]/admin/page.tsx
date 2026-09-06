import { initialSalons, initialServices, initialBookings } from '@/lib/salons-data'
import SalonAdminSlugClient from '@/components/salon-admin-slug-client'

export default async function SalonAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const initialSalon = initialSalons.find((s) => s.slug === slug)
  const services = initialServices.filter((s) => s.salon_id === (initialSalon?.id || ''))
  const bookings = initialBookings.filter((b) => b.salon_id === (initialSalon?.id || ''))

  return (
    <SalonAdminSlugClient
      slug={slug}
      initialSalon={initialSalon}
      initialServices={services}
      initialBookings={bookings}
    />
  )
}
