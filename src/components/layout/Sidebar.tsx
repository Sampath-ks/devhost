// Sidebar.tsx
export default function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen p-6">
        <div className="text-sm font-semibold tracking-wider text-muted uppercase">
          Menu
        </div>
        <div className="mt-6 text-sm text-muted">
          Sidebar Placeholder
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-30 flex items-center justify-center">
        <span className="text-xs text-muted tracking-wide">
          Bottom Bar Placeholder
        </span>
      </nav>
    </>
  )
}
