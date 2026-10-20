import { useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ColorFillProvider, ColorFillRouterBridge } from '@/components/transitions/ColorFillTransition'
import AppRoutes from '@/routes'
import { useLenis } from '@/hooks/useLenis'

function AppContent() {
  useLenis()
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger admin dashboard when Ctrl + Shift are pressed together
      const isCtrlAndShift =
        (e.ctrlKey && (e.shiftKey || e.key === 'Shift')) ||
        (e.shiftKey && (e.ctrlKey || e.key === 'Control'))

      if (isCtrlAndShift) {
        navigate('/admin')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Global Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 bg-repeat opacity-[0.06]"
        style={{
          backgroundImage: 'url(/assets/textures/grain.png)',
        }}
        aria-hidden="true"
      />

      {/* App Routes */}
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <ColorFillProvider>
      <BrowserRouter>
        <ColorFillRouterBridge />
        <AppContent />
      </BrowserRouter>
    </ColorFillProvider>
  )
}
