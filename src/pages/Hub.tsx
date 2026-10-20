// Hub.tsx
import { useEffect } from 'react'
import HeroScrub from '@/components/hub/HeroScrub'
import PortalAccordion from '@/components/hub/PortalAccordion'

export default function Hub() {
  // Preload portal images & video first frame to prevent pop-in
  useEffect(() => {
    const imagesToPreload = [
      '/assets/images/portals/farmer.jpg',
      '/assets/images/portals/buyer.jpg',
      '/assets/images/portals/warehouse.jpg',
      '/assets/images/portals/Farmers_bidding.jpg',
    ]

    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    const videoPreloader = document.createElement('video')
    videoPreloader.preload = 'auto'
    videoPreloader.src = '/assets/videos/crops.mp4'
    videoPreloader.load()
  }, [])

  return (
    <main className="relative min-h-screen bg-bg text-text selection:bg-gold/20 selection:text-gold">
      <HeroScrub />
      <PortalAccordion />
    </main>
  )
}
