// PortalPanel.tsx
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useColorFill } from '@/components/transitions/ColorFillTransition'

export interface PortalData {
  id: string
  role: 'farmer' | 'buyer' | 'store' | 'auction'
  title: string
  description: string
  route: string
  color: string
  image: string
  alt: string
}

interface PortalPanelProps {
  item: PortalData
  isHovered: boolean
  anyHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function PortalPanel({
  item,
  isHovered,
  anyHovered,
  onHoverStart,
  onHoverEnd,
}: PortalPanelProps) {
  const { navigateWithFill } = useColorFill()
  const panelRef = useRef<HTMLDivElement>(null)

  const isCollapsed = anyHovered && !isHovered

  const handleClick = (e: React.MouseEvent) => {
    navigateWithFill(e, item.route, item.color)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Center coordinates of panel for keyboard navigation
      const rect = panelRef.current?.getBoundingClientRect()
      const coords = rect
        ? { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }
        : null
      navigateWithFill(coords, item.route, item.color)
    }
  }

  return (
    <motion.div
      ref={panelRef}
      layout
      transition={{
        layout: { duration: 0.6, ease: EASE_OUT },
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Enter ${item.title} portal: ${item.description}`}
      className="group relative cursor-pointer select-none rounded-[28px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-shadow duration-500 w-full md:w-auto h-[28vh] min-h-[220px] md:h-full md:min-h-0"
      style={{
        flex: isHovered ? 3.5 : 1,
        boxShadow: isHovered
          ? `0 0 35px -5px ${item.color}40, inset 0 0 0 1.5px ${item.color}90`
          : 'inset 0 0 0 1px var(--border)',
      }}
    >
      {/* Background Image */}
      <img
        src={item.image}
        alt={item.alt}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
        style={{
          filter: isCollapsed ? 'brightness(0.35) contrast(0.95)' : 'brightness(0.9) contrast(1.05)',
          transform: isHovered ? 'scale(1.04)' : 'scale(1.0)',
        }}
      />

      {/* Role-tinted & bottom dark gradients */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(to top, rgba(11, 15, 10, 0.95) 0%, rgba(11, 15, 10, 0.7) 40%, rgba(11, 15, 10, 0.2) 75%, transparent 100%)`,
          opacity: isCollapsed ? 0.7 : 1,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(to top, ${item.color}35 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0.2,
        }}
      />

      {/* Vertical Title for Collapsed Desktop State */}
      <div
        className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isCollapsed ? 1 : 0,
        }}
      >
        <span
          className="font-serif text-lg tracking-[0.25em] text-text-muted uppercase font-medium select-none"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          {item.title}
        </span>
      </div>

      {/* Expanded & Mobile Content */}
      <div
        className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end pointer-events-none transition-opacity duration-400"
        style={{
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {/* Role Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs uppercase tracking-widest font-semibold text-text-muted">
            {item.role} Portal
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-text font-normal tracking-tight">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-sm font-normal leading-relaxed">
          {item.description}
        </p>

        {/* Enter Button */}
        <div className="mt-4 pt-1">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[rgba(27,36,26,0.85)] border border-[rgba(243,235,221,0.2)] text-text backdrop-blur-sm transition-all duration-300 group-hover:border-gold group-hover:text-gold"
          >
            Enter
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </motion.div>
  )
}
