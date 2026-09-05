import { notFound } from 'next/navigation'
import { initialSalons, initialServices, initialBookings } from '@/lib/salons-data'
import SalonAdminView from '@/components/salon-admin-view'

export default async function SalonAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const salon = initialSalons.find((s) => s.slug === slug)

  if (!salon) {
    notFound()
  }

  const services = initialServices.filter((s) => s.salon_id === salon.id)
  const bookings = initialBookings.filter((b) => b.salon_id === salon.id)

  return <SalonAdminView salon={salon} services={services} bookings={bookings} />
}
