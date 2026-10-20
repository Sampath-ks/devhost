import { Link } from 'react-router-dom'
import { useColorFill } from '@/components/transitions/ColorFillTransition'

export default function Hub() {
  const { navigateWithFill } = useColorFill()

  return (
    <div className="p-8 flex flex-col items-start gap-6">
      <h1 className="text-4xl font-bold">Hub</h1>
      <div className="flex flex-wrap items-center gap-4">
        <button
          id="btn-farmer-transition"
          onClick={(e) => navigateWithFill(e, '/farmer', '#3F8F4A')}
          className="px-5 py-2.5 rounded-lg bg-farmer text-text font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Go to Farmer Dashboard
        </button>
        <Link
          to="/login"
          id="btn-login-page"
          className="px-5 py-2.5 rounded-lg bg-surface border border-border text-text font-medium hover:bg-surface-2 transition-colors cursor-pointer"
        >
          Login / Register
        </Link>
      </div>
    </div>
  )
}
