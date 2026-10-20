// App.tsx
import { BrowserRouter } from 'react-router-dom'
import { ColorFillProvider, ColorFillRouterBridge } from '@/components/transitions/ColorFillTransition'
import { AppStoreProvider } from '@/lib/store'
import AppRoutes from '@/routes'
import { useLenis } from '@/hooks/useLenis'

function AppContent() {
  useLenis()

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
        <AppStoreProvider>
          <AppContent />
        </AppStoreProvider>
      </BrowserRouter>
    </ColorFillProvider>
  )
}
