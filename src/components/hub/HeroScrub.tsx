// HeroScrub.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroScrub() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStaticMode, setIsStaticMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Detect touch devices or prefers-reduced-motion
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReducedMotion) {
      setIsStaticMode(true)
    }
  }, [])

  // Scroll tracking on wrapper
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  // Scrub video playback based on scroll
  useEffect(() => {
    if (isStaticMode) return

    const video = videoRef.current
    if (!video) return

    let duration = 0
    let targetProgress = 0
    let currentLerpTime = 0
    let isSeeking = false
    let animFrame: number

    const handleLoadedMetadata = () => {
      duration = video.duration || 0
      setIsLoaded(true)
    }

    if (video.readyState >= 1 && video.duration) {
      duration = video.duration
      setIsLoaded(true)
    }
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    const handleSeeked = () => {
      isSeeking = false
    }
    video.addEventListener('seeked', handleSeeked)

    const unsubscribeScroll = scrollYProgress.on('change', (latest) => {
      targetProgress = Math.max(0, Math.min(1, latest))
    })

    const loop = () => {
      if (duration > 0 && !isSeeking) {
        // Safe scrub range avoiding edge glitches
        const targetTime = targetProgress * Math.max(0.1, duration - 0.05)
        const diff = targetTime - currentLerpTime

        if (Math.abs(diff) > 0.015) {
          currentLerpTime += diff * 0.12
          // Clamp time
          const clampedTime = Math.max(0, Math.min(duration - 0.05, currentLerpTime))
          video.currentTime = clampedTime
        }
      }
      animFrame = requestAnimationFrame(loop)
    }

    animFrame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animFrame)
      unsubscribeScroll()
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
    }
  }, [isStaticMode, scrollYProgress])

  // Framer Motion transforms for hero text (fades & rises out between 0% and 30%)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -45])

  // Scroll cue fades out after the first bit of scroll (0% to 12%)
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  // "Choose your way in" short line fades in at 85-100%
  const nextSectionTextOpacity = useTransform(scrollYProgress, [0.85, 0.98], [0, 1])
  const nextSectionTextY = useTransform(scrollYProgress, [0.85, 0.98], [25, 0])

  return (
    <div
      ref={wrapperRef}
      className={isStaticMode ? 'relative h-screen w-full' : 'relative h-[300vh] w-full'}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-bg">
        {/* Hero Video */}
        <video
          ref={videoRef}
          src="/assets/videos/crops.mp4"
          muted
          playsInline
          preload="auto"
          autoPlay={isStaticMode}
          loop={isStaticMode}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: isLoaded || isStaticMode ? 1 : 0.4 }}
          aria-label="Crops and harvest background video"
        />

        {/* Dark Vignette & Edge Gradient Overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(11, 15, 10, 0.25) 0%, rgba(11, 15, 10, 0.85) 100%), linear-gradient(to top, #0B0F0A 0%, rgba(11, 15, 10, 0.4) 45%, rgba(11, 15, 10, 0.7) 100%)',
          }}
        />

        {/* Centered Hero Content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={isStaticMode ? {} : { opacity: heroOpacity, y: heroY }}
        >
          {/* Small Gold Tagline Label */}
          <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-gold uppercase mb-4 px-4 py-1.5 rounded-full bg-[rgba(217,164,65,0.08)] border border-[rgba(217,164,65,0.2)]">
            Bridging Marginal Farmers Directly to Fair Markets
          </span>

          {/* KisanSetu Headline */}
          <h1
            className="font-serif text-text font-normal tracking-tight mb-4 select-none drop-shadow-md"
            style={{
              fontSize: 'clamp(3rem, 9vw, 8rem)',
              lineHeight: 1.05,
            }}
          >
            KisanSetu
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-xl font-normal leading-relaxed">
            Fresh from the farm. Straight to your market.
          </p>
        </motion.div>

        {/* Scroll Cue Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={isStaticMode ? { opacity: 0.8 } : { opacity: cueOpacity }}
        >
          <span className="text-[11px] font-medium tracking-widest text-text-muted uppercase">
            Scroll to Explore
          </span>
          <div className="w-[1.5px] h-10 bg-[rgba(243,235,221,0.2)] relative overflow-hidden rounded-full">
            <motion.div
              className="w-full h-3 bg-gold rounded-full"
              animate={{
                y: [0, 32, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        {/* "Choose your way in" short line that fades in near bottom of scrub */}
        {!isStaticMode && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            style={{
              opacity: nextSectionTextOpacity,
              y: nextSectionTextY,
            }}
          >
            <p className="font-serif text-lg md:text-xl text-text tracking-wide font-normal">
              Choose your way in &darr;
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
