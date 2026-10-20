// ColorFillTransition.tsx
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface ColorFillContextType {
  navigateWithFill: (
    event: React.MouseEvent | MouseEvent | { clientX: number; clientY: number } | null | undefined,
    to: string,
    color: string
  ) => void
  registerNavigate: (nav: (to: string) => void) => void
}

const ColorFillContext = createContext<ColorFillContextType | null>(null)

export function useColorFill() {
  const context = useContext(ColorFillContext)
  if (!context) {
    throw new Error('useColorFill must be used within a ColorFillProvider')
  }
  return context
}

export function ColorFillRouterBridge() {
  const navigate = useNavigate()
  const { registerNavigate } = useColorFill()

  useEffect(() => {
    registerNavigate((to) => navigate(to))
  }, [navigate, registerNavigate])

  return null
}

interface TransitionState {
  phase: 'idle' | 'expanding' | 'shrinking'
  x: number
  y: number
  maxRadius: number
  color: string
  targetTo: string
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function ColorFillProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TransitionState>({
    phase: 'idle',
    x: 0,
    y: 0,
    maxRadius: 0,
    color: '#3F8F4A',
    targetTo: '',
  })

  const navigateFnRef = useRef<((to: string) => void) | null>(null)

  const registerNavigate = useCallback((nav: (to: string) => void) => {
    navigateFnRef.current = nav
  }, [])

  const navigateWithFill = useCallback(
    (
      event: React.MouseEvent | MouseEvent | { clientX: number; clientY: number } | null | undefined,
      to: string,
      color: string
    ) => {
      if (state.phase !== 'idle') return

      const x = event && 'clientX' in event && typeof event.clientX === 'number'
        ? event.clientX
        : window.innerWidth / 2
      const y = event && 'clientY' in event && typeof event.clientY === 'number'
        ? event.clientY
        : window.innerHeight / 2

      const maxRadius = Math.ceil(
        Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )
      ) + 30

      setState({
        phase: 'expanding',
        x,
        y,
        maxRadius,
        color,
        targetTo: to,
      })
    },
    [state.phase]
  )

  const handleAnimationComplete = () => {
    if (state.phase === 'expanding') {
      if (navigateFnRef.current) {
        navigateFnRef.current(state.targetTo)
      } else {
        window.history.pushState({}, '', state.targetTo)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }

      requestAnimationFrame(() => {
        setState((prev) => ({ ...prev, phase: 'shrinking' }))
      })
    } else if (state.phase === 'shrinking') {
      setState((prev) => ({ ...prev, phase: 'idle' }))
    }
  }

  const { phase, x, y, maxRadius, color } = state

  return (
    <ColorFillContext.Provider value={{ navigateWithFill, registerNavigate }}>
      {children}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            key="color-fill-overlay"
            className="fixed inset-0 z-40 pointer-events-auto"
            style={{
              backgroundColor: color,
            }}
            initial={{
              clipPath: `circle(0px at ${x}px ${y}px)`,
            }}
            animate={{
              clipPath:
                phase === 'expanding'
                  ? `circle(${maxRadius}px at ${x}px ${y}px)`
                  : `circle(0px at ${x}px ${y}px)`,
            }}
            transition={{
              duration: 0.9,
              ease: EASE_OUT,
            }}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
    </ColorFillContext.Provider>
  )
}

export default ColorFillProvider
