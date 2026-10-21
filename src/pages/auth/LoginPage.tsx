import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sprout,
  ShoppingCart,
  User,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useColorFill } from '@/components/transitions/ColorFillTransition'

interface LoginPageProps {
  initialMode?: 'login' | 'register'
}

function EmblemLogo({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-full border-[2.5px] border-[#204e38] bg-white/90 p-1 flex items-center justify-center overflow-hidden shadow-md ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Golden Sun */}
        <circle cx="50" cy="52" r="17" fill="#F59E0B" />

        {/* Plant Stem and Leaves */}
        <path d="M50 56 V30" stroke="#2D6A4F" strokeWidth="4.5" strokeLinecap="round" />
        {/* Left leaf */}
        <path
          d="M50 40 C41 40 37 31 39 23 C48 23 50 31 50 40 Z"
          fill="#38A169"
          stroke="#204E38"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right leaf */}
        <path
          d="M50 36 C59 36 63 27 61 19 C52 19 50 27 50 36 Z"
          fill="#48BB78"
          stroke="#204E38"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ocean Waves */}
        <path
          d="M10 65 Q 25 58, 40 65 T 70 65 T 90 65"
          stroke="#167A74"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M15 76 Q 30 70, 45 76 T 75 76 T 90 76"
          stroke="#259D96"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 86 Q 35 81, 50 86 T 80 86"
          stroke="#48B8B0"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

function WaveGraphic() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-14 rounded-b-[28px]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 440 60"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Background soft wave */}
        <path
          d="M0 35 Q 110 15, 220 30 T 440 25 L 440 60 L 0 60 Z"
          fill="#E1F3F0"
          opacity="0.75"
        />
        {/* Foreground wave */}
        <path
          d="M0 42 Q 130 25, 260 40 T 440 32 L 440 60 L 0 60 Z"
          fill="#CCEBE5"
          opacity="0.9"
        />
        {/* Boat silhouette near right edge */}
        <g
          transform="translate(348, 20) scale(0.68)"
          stroke="#558C82"
          strokeWidth="1.5"
          fill="#78AAA0"
        >
          {/* Hull */}
          <path d="M4 22 C 12 28, 38 28, 46 22 L 42 16 L 8 16 Z" />
          {/* Cabin */}
          <rect x="20" y="8" width="14" height="8" rx="1" fill="#6B9F95" />
          {/* Mast and rigging */}
          <line x1="27" y1="8" x2="27" y2="0" strokeWidth="1.5" />
          <line x1="12" y1="16" x2="27" y2="2" strokeWidth="1" strokeDasharray="2 1" />
          <line x1="40" y1="16" x2="27" y2="2" strokeWidth="1" strokeDasharray="2 1" />
        </g>
        {/* Little birds flying */}
        <path
          d="M316 16 Q 319 13, 322 16 Q 325 13, 328 16"
          stroke="#78AAA0"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M332 10 Q 334 8, 336 10 Q 338 8, 340 10"
          stroke="#78AAA0"
          strokeWidth="0.9"
          fill="none"
        />
      </svg>
    </div>
  )
}

export default function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const { navigateWithFill } = useColorFill()
  const lastCoordsRef = useRef<{ clientX: number; clientY: number } | null>(null)

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'farmer' | 'user' | ''>('')
  const [loginRole, setLoginRole] = useState<'farmer' | 'user' | ''>('')
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
      setError('Please choose whether you are logging in as a Farmer or Buyer')
      return
    }

    if (mode === 'register' && !accountType) {
      setError('Please select whether you are registering as a Farmer or Buyer')
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
        throw new Error('Stored account data is invalid.')
      }

      if (mode === 'register') {
        const selectedRole = accountType as 'farmer' | 'user'
        const existingAccount = accounts.find((a) => a.email.toLowerCase() === normalizedEmail)

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
        localStorage.setItem(
          sessionKey,
          JSON.stringify({
            email: newAccount.email,
            role: newAccount.role,
            loggedInAt: new Date().toISOString(),
          })
        )
        const targetPath = selectedRole === 'farmer' ? '/farmer' : '/buyer'
        const targetColor = selectedRole === 'farmer' ? '#3F8F4A' : '#D98A2B'
        setSuccessMsg(
          `Registration successful! Redirecting to ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} dashboard...`
        )

        setTimeout(() => {
          navigateWithFill(lastCoordsRef.current, targetPath, targetColor)
        }, 300)
      } else {
        const selectedRole = loginRole as 'farmer' | 'user'
        const matchingAccount = accounts.find(
          (a) =>
            a.email.toLowerCase() === normalizedEmail &&
            a.password === password &&
            a.role === selectedRole
        )

        if (!matchingAccount) {
          setError('Invalid email, password, or account type. Please check details or register.')
          setIsSubmitting(false)
          return
        }

        localStorage.setItem(
          sessionKey,
          JSON.stringify({
            email: matchingAccount.email,
            role: matchingAccount.role,
            loggedInAt: new Date().toISOString(),
          })
        )
        const targetPath = selectedRole === 'farmer' ? '/farmer' : '/buyer'
        const targetColor = selectedRole === 'farmer' ? '#3F8F4A' : '#D98A2B'
        setSuccessMsg(
          `Login successful! Redirecting to ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} dashboard...`
        )

        setTimeout(() => {
          navigateWithFill(lastCoordsRef.current, targetPath, targetColor)
        }, 300)
      }
    } catch (storageError) {
      console.error('Unable to save or read account data:', storageError)
      setError('Could not access saved account data. Please check browser storage.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-auth-fade { animation: authFadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .font-script { font-family: 'Caveat', cursive; }
      `}</style>

      <div
        className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat overflow-x-hidden selection:bg-[#2d6a4f] selection:text-white"
        style={{
          backgroundImage: `url('/assets/images/portals/auth_bg.jpg')`,
        }}
      >
        {/* Subtle warm atmospheric filter to match the reference look */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-amber-900/5 to-emerald-950/20 pointer-events-none"
          aria-hidden="true"
        />

        <div className="w-full max-w-[430px] relative z-10 flex flex-col items-center">
          {/* Header section with Logo, Cursive Heading & Subtitle */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="flex justify-center mb-2.5">
              <EmblemLogo className="w-14 h-14" />
            </div>

            <h1 className="font-script text-4xl sm:text-5xl font-bold text-[#1a4433] tracking-tight drop-shadow-sm leading-tight">
              {mode === 'login' ? 'Welcome Back' : 'Join KisanSetu'}
            </h1>

            <p className="mt-1 text-xs sm:text-sm font-medium text-[#2d5541] tracking-wide">
              {mode === 'login'
                ? 'Good food grows when farmers and buyers connect'
                : 'Direct connection from farm to table across India'}
            </p>

            {/* Decorative wave squiggle matching reference */}
            <div className="flex justify-center mt-1.5" aria-hidden="true">
              <svg
                width="64"
                height="8"
                viewBox="0 0 64 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4 C 6 1, 10 7, 14 4 C 18 1, 22 7, 26 4 C 30 1, 34 7, 38 4 C 42 1, 46 7, 50 4 C 54 1, 58 7, 62 4"
                  stroke="#2D6A4F"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Central Modal Card */}
          <div className="w-full bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-7 shadow-[0_22px_45px_rgba(0,0,0,0.24)] border border-white/80 relative overflow-hidden transition-all duration-300">
            {/* Top Pill Switcher: Sign In / Register */}
            <div className="grid grid-cols-2 p-1 bg-[#edf3ef] rounded-full mb-6 border border-[#dce8e0]">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setLoginStep('role')
                  setLoginRole('')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#2d6a4f] text-white shadow-sm'
                    : 'text-[#4d7264] hover:text-[#1d4133]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#2d6a4f] text-white shadow-sm'
                    : 'text-[#4d7264] hover:text-[#1d4133]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-auth-fade">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-auth-fade">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Role Selection (Step 1) */}
            {mode === 'login' && loginStep === 'role' && (
              <div className="animate-auth-fade pb-6">
                <p className="text-xs sm:text-sm font-semibold text-[#1e3b2e] mb-3">
                  How would you like to log in?
                </p>

                {/* Farmer Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('farmer')
                    setLoginStep('form')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="w-full mb-3 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#d2e7db] bg-[#f4faf6] hover:bg-[#ebf6ef] hover:border-[#8ec4a4] hover:shadow-sm transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#d8efe2] text-[#2d6a4f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sprout className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <span className="block text-sm sm:text-base font-bold text-[#1f3a2d] group-hover:text-[#185c3b]">
                        Farmer
                      </span>
                      <span className="block text-xs text-[#52796f] mt-0.5">
                        Log in to your farmer account
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#2d6a4f] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Buyer Option Card */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('user')
                    setLoginStep('form')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="w-full mb-5 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#d2e7db] bg-[#f4faf6] hover:bg-[#ebf6ef] hover:border-[#8ec4a4] hover:shadow-sm transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#d4ede9] text-[#1b7a70] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5 text-[#1b7a70]" />
                    </div>
                    <div>
                      <span className="block text-sm sm:text-base font-bold text-[#1f3a2d] group-hover:text-[#185c3b]">
                        Buyer
                      </span>
                      <span className="block text-xs text-[#52796f] mt-0.5">
                        Log in to your buyer account
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#2d6a4f] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Inside card registration prompt */}
                <div className="text-center pt-2 relative z-10">
                  <p className="text-xs text-[#52796f]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="text-[#2d6a4f] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      Register now <span>→</span>
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Form Step for Login (Credentials) or Registration */}
            {(mode === 'register' || (mode === 'login' && loginStep === 'form')) && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 animate-auth-fade pb-7"
                noValidate
              >
                {/* Active Role Indicator in Login Form */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4faf6] border border-[#d2e7db]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#d8efe2] text-[#2d6a4f] flex items-center justify-center">
                        {loginRole === 'farmer' ? (
                          <Sprout className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-[#1b7a70]" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm text-[#1f3a2d]">
                        Logging in as{' '}
                        <strong className="font-bold text-[#2d6a4f]">
                          {loginRole === 'farmer' ? 'Farmer' : 'Buyer'}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('role')
                        setLoginRole('')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className="text-xs font-semibold text-[#2d6a4f] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Account Type Selector for Registration */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1e3b2e] mb-2">
                      Choose Your Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAccountType('farmer')}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                          accountType === 'farmer'
                            ? 'border-[#2d6a4f] bg-[#eaf5ef] ring-2 ring-[#2d6a4f]/20 shadow-sm'
                            : 'border-[#d2e7db] bg-[#f8faf8] hover:bg-[#f0f5f1]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#d8efe2] text-[#2d6a4f] flex items-center justify-center shrink-0">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-[#1f3a2d]">Farmer</span>
                          <span className="block text-[10px] text-[#52796f]">Sell crops</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountType('user')}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                          accountType === 'user'
                            ? 'border-[#2d6a4f] bg-[#eaf5ef] ring-2 ring-[#2d6a4f]/20 shadow-sm'
                            : 'border-[#d2e7db] bg-[#f8faf8] hover:bg-[#f0f5f1]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#d4ede9] text-[#1b7a70] flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-[#1f3a2d]">Buyer</span>
                          <span className="block text-[10px] text-[#52796f]">Buy produce</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-medium text-[#2d5541] mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#719888]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d2e7db] text-[#1f3a2d] placeholder:text-[#8ba89c] text-sm focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-medium text-[#2d5541]"
                    >
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset link will be sent to your email.')}
                        className="text-xs text-[#52796f] hover:text-[#2d6a4f] font-medium transition-colors cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#719888]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border border-[#d2e7db] text-[#1f3a2d] placeholder:text-[#8ba89c] text-sm focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#719888] hover:text-[#1f3a2d] cursor-pointer transition-colors"
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
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#23533e] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#2d6a4f]/25 disabled:opacity-60"
                >
                  <span>
                    {isSubmitting
                      ? 'Redirecting...'
                      : mode === 'login'
                      ? `Sign In as ${loginRole === 'farmer' ? 'Farmer' : 'Buyer'}`
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Footer Switcher */}
                <div className="text-center pt-2 relative z-10">
                  <p className="text-xs text-[#52796f]">
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
                          className="text-[#2d6a4f] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          Register now <span>→</span>
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
                          className="text-[#2d6a4f] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          Sign in <span>→</span>
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </form>
            )}

            {/* Subtle bottom wave graphic & boat silhouette matching design */}
            <WaveGraphic />
          </div>

          {/* Back to Home Link */}
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-xs sm:text-sm font-semibold text-white hover:text-emerald-100 transition-all inline-flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] hover:scale-105"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

