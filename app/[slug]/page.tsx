import { notFound } from 'next/navigation'
import { initialSalons, initialServices } from '@/lib/salons-data'
import SalonPublicView from '@/components/salon-public-view'

export default async function SalonSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const salon = initialSalons.find((s) => s.slug === slug)

  if (!salon) {
    notFound()
  }

  const services = initialServices.filter((s) => s.salon_id === salon.id)

  return <SalonPublicView salon={salon} services={services} />
}
