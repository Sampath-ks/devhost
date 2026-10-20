import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useColorFill } from '@/components/transitions/ColorFillTransition'

interface LoginPageProps {
  initialMode?: 'login' | 'register'
}

export default function LoginPage({ initialMode = 'register' }: LoginPageProps) {
  const { navigateWithFill } = useColorFill()
  const lastCoordsRef = useRef<{ clientX: number; clientY: number } | null>(null)

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('')
  const [loginRole, setLoginRole] = useState('')
  const [loginStep, setLoginStep] = useState<'role' | 'form'>('role')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (mode === 'login' && !loginRole) {
      setError('Please choose whether you are logging in as a Farmer or User (Buyer)')
      return
    }

    if (mode === 'register' && !accountType) {
      setError('Please select whether you are registering as a Farmer or User (Buyer)')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)

    try {
      // Frontend-only persistence: accounts and the current session are saved in localStorage.
      // This is suitable for a prototype only; production authentication needs a secure backend.
      const accountsKey = 'agri_marketplace_accounts'
      const sessionKey = 'agri_marketplace_session'
      const storedAccounts = localStorage.getItem(accountsKey)
      const accounts: Array<{
        email: string
        password: string
        role: 'farmer' | 'user'
        createdAt?: string
      }> = storedAccounts ? JSON.parse(storedAccounts) : []

      if (!Array.isArray(accounts)) {
        throw new Error('Stored account data is invalid. Please clear the app account data and try again.')
      }

      if (mode === 'register') {
        const selectedRole = accountType as 'farmer' | 'user'
        const existingAccount = accounts.find((account) => account.email.toLowerCase() === normalizedEmail)

        if (existingAccount) {
          setError('An account with this email already exists. Please sign in instead.')
          setIsSubmitting(false)
          return
        }

        const newAccount = {
          email: normalizedEmail,
          password,
          role: selectedRole,
          createdAt: new Date().toISOString(),
        }

        accounts.push(newAccount)
        localStorage.setItem(accountsKey, JSON.stringify(accounts))
        localStorage.setItem(sessionKey, JSON.stringify({
          email: newAccount.email,
          role: newAccount.role,
          loggedInAt: new Date().toISOString(),
        }))
        const targetPath = selectedRole === 'farmer' ? '/farmer' : '/buyer'
        const targetColor = selectedRole === 'farmer' ? '#3F8F4A' : '#D98A2B'
        setSuccessMsg(`Registration successful! Redirecting to ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} dashboard...`)

        setTimeout(() => {
          navigateWithFill(lastCoordsRef.current, targetPath, targetColor)
        }, 300)
      } else {
        const selectedRole = loginRole as 'farmer' | 'user'
        const matchingAccount = accounts.find(
          (account) =>
            account.email.toLowerCase() === normalizedEmail &&
            account.password === password &&
            account.role === selectedRole
        )

        if (!matchingAccount) {
          setError('Invalid email, password, or account type. Please check your details or register first.')
          setIsSubmitting(false)
          return
        }

        localStorage.setItem(sessionKey, JSON.stringify({
          email: matchingAccount.email,
          role: matchingAccount.role,
          loggedInAt: new Date().toISOString(),
        }))
        const targetPath = selectedRole === 'farmer' ? '/farmer' : '/buyer'
        const targetColor = selectedRole === 'farmer' ? '#3F8F4A' : '#D98A2B'
        setSuccessMsg(`Login successful! Redirecting to ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} dashboard...`)

        setTimeout(() => {
          navigateWithFill(lastCoordsRef.current, targetPath, targetColor)
        }, 300)
      }
    } catch (storageError) {
      console.error('Unable to save or read account data:', storageError)
      setError('Could not access saved account data in this browser. Please check browser storage settings.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <style>{`
      @keyframes authFormEnter {
        from { opacity: 0; transform: translateY(12px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .animate-auth-in { animation: authFormEnter 320ms ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .animate-auth-in { animation: none; }
      }
    `}</style>
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-bg text-text">
      {/* Ambient background glows matching agricultural dark theme */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(63, 143, 74, 0.4) 0%, rgba(11, 15, 10, 0) 70%)',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand / Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-2 border border-border text-farmer mb-4 shadow-lg shadow-farmer/10">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-text">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === 'login'
              ? (loginStep === 'role' ? 'Choose how you want to sign in' : `Sign in as ${loginRole === 'farmer' ? 'Farmer' : 'User (Buyer)'}`)
              : 'Join the community of farmers and buyers today'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-surface-2 p-1 mb-6 border border-border">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setLoginStep('role')
                setLoginRole('')
                setError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-farmer text-text shadow'
                  : 'text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-farmer text-text shadow'
                  : 'text-muted hover:text-text'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-farmer/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-farmer mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login role selection: shown before the email/password form */}
          {mode === 'login' && loginStep === 'role' && (
            <div className="space-y-3 animate-auth-in">
              <p className="text-sm text-muted mb-4">How would you like to log in?</p>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('farmer')
                  setLoginStep('form')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border hover:border-farmer hover:bg-farmer/10 transition-all duration-200 text-left"
              >
                <span>
                  <span className="block text-sm font-medium text-text">Farmer</span>
                  <span className="block text-xs text-muted mt-1">Log in to your farmer account</span>
                </span>
                <ArrowRight className="w-4 h-4 text-farmer" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('user')
                  setLoginStep('form')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border hover:border-farmer hover:bg-farmer/10 transition-all duration-200 text-left"
              >
                <span>
                  <span className="block text-sm font-medium text-text">User (Buyer)</span>
                  <span className="block text-xs text-muted mt-1">Log in to your buyer account</span>
                </span>
                <ArrowRight className="w-4 h-4 text-farmer" />
              </button>
            </div>
          )}

          {/* Form */}
          {(mode === 'register' || (mode === 'login' && loginStep === 'form')) && (
          <form onSubmit={handleSubmit} className="space-y-4.5 animate-auth-in" noValidate>
            {/* Registration Role Field - shown only when registering */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-account-type"
                  className="block text-xs uppercase tracking-wider text-muted font-medium mb-1.5"
                >
                  Register As
                </label>
                <select
                  id="auth-account-type"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-text text-sm focus:outline-none focus:border-farmer focus:ring-1 focus:ring-farmer transition-colors"
                >
                  <option value="" disabled>
                    Select Farmer or User (Buyer)
                  </option>
                  <option value="farmer">Farmer</option>
                  <option value="user">User (Buyer)</option>
                </select>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between rounded-lg bg-surface-2 border border-border px-3 py-2">
                <span className="text-sm text-text">
                  Logging in as <strong>{loginRole === 'farmer' ? 'Farmer' : 'User (Buyer)'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('role')
                    setLoginRole('')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-xs text-farmer hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs uppercase tracking-wider text-muted font-medium mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted/50 text-sm focus:outline-none focus:border-farmer focus:ring-1 focus:ring-farmer transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs uppercase tracking-wider text-muted font-medium"
                >
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset will be available soon.')}
                    className="text-xs text-muted hover:text-farmer transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted/50 text-sm focus:outline-none focus:border-farmer focus:ring-1 focus:ring-farmer transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-text cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={(e) => {
                lastCoordsRef.current = { clientX: e.clientX, clientY: e.clientY }
              }}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-farmer hover:bg-[#34793e] text-text font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-farmer/20 disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Redirecting...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          )}

          {/* Footer toggle link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className="text-farmer hover:underline font-medium cursor-pointer"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setLoginStep('role')
                      setLoginRole('')
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className="text-farmer hover:underline font-medium cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Back to Hub navigation */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-muted hover:text-text transition-colors inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
