// PortalAccordion.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import PortalPanel, { type PortalData } from './PortalPanel'

const PORTALS: PortalData[] = [
  {
    id: 'farmer',
    role: 'farmer',
    title: 'Farmer',
    description: 'List your harvest and see fair mandi prices.',
    route: '/farmer',
    color: '#3F8F4A',
    image: '/assets/images/portals/farmer.jpg',
    alt: 'Farmer in agricultural field harvesting fresh crops',
  },
  {
    id: 'buyer',
    role: 'buyer',
    title: 'Buyer',
    description: 'Find, compare and bulk-order fresh produce.',
    route: '/buyer',
    color: '#D98A2B',
    image: '/assets/images/portals/buyer.jpg',
    alt: 'Wholesale agricultural buyer inspecting fresh market produce',
  },
  {
    id: 'store',
    role: 'store',
    title: 'Central Store',
    description: 'Verified stock, tracked from receipt to collection.',
    route: '/admin',
    color: '#3E7C8C',
    image: '/assets/images/portals/warehouse.jpg',
    alt: 'Central storage warehouse managing agricultural produce inventory',
  },
  {
    id: 'auction',
    role: 'auction',
    title: 'Auction',
    description: 'Post a requirement. Farmers bid to supply it.',
    route: '/auction',
    color: '#A8442F',
    image: '/assets/images/portals/Farmers_bidding.jpg',
    alt: 'Farmers and traders in competitive agricultural crop auction bidding',
  },
]

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function PortalAccordion() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section
      id="portals"
      className="relative min-h-screen bg-bg py-16 md:py-24 px-4 sm:px-6 md:px-12 flex flex-col justify-center"
      aria-labelledby="portal-heading"
    >
      {/* Section Header with Staggered Reveal */}
      <motion.div
        className="max-w-3xl mb-8 md:mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <span className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-3 block">
          Platform Entry
        </span>
        <h2
          id="portal-heading"
          className="font-serif text-3xl sm:text-4xl md:text-5xl text-text font-normal tracking-tight"
        >
          Choose your way in
        </h2>
        <p className="text-sm sm:text-base text-text-muted mt-3 font-normal leading-relaxed">
          Four dedicated portals for farmers, buyers, collection centers, and dynamic auctions.
        </p>
      </motion.div>

      {/* Accordion Container with Staggered Reveal */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 md:gap-5 w-full h-auto md:h-[62vh] md:min-h-[460px] max-h-[720px]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
      >
        {PORTALS.map((portal) => (
          <PortalPanel
            key={portal.id}
            item={portal}
            isHovered={hoveredId === portal.id}
            anyHovered={hoveredId !== null}
            onHoverStart={() => setHoveredId(portal.id)}
            onHoverEnd={() => setHoveredId((current) => (current === portal.id ? null : current))}
          />
        ))}
      </motion.div>
    </section>
  )
}
