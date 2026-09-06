import { initialSalons, initialServices, SalonData } from '@/lib/salons-data'
import SalonPublicView from '@/components/salon-public-view'
import SalonSlugClient from '@/components/salon-slug-client'

export default async function SalonSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const initialSalon = initialSalons.find((s) => s.slug === slug)
  const services = initialServices.filter((s) => s.salon_id === (initialSalon?.id || ''))

  return <SalonSlugClient slug={slug} initialSalon={initialSalon} initialServices={services} />
}
