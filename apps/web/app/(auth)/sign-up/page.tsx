'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUp, signIn } from '@/lib/auth-client'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const res = await signUp.email({ name, email, password })
      if (res?.error) {
        setError(res.error.message || 'Could not create account')
      } else {
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: redirect,
      })
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-desc">Start learning AI tools for free</p>

      <button className="google-btn" onClick={handleGoogleSignIn} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">
          Full Name
          <input
            className="auth-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            autoComplete="name"
          />
        </label>

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link href={`/sign-in${redirect !== '/' ? `?redirect=${redirect}` : ''}`}>Sign in</Link>
      </p>

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 420px;
        }

        .auth-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .auth-desc {
          color: #666;
          margin-bottom: 1.75rem;
          font-size: 0.95rem;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-size: 0.95rem;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .google-btn:hover {
          border-color: #bbb;
          background: #f8f8f8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #aaa;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .auth-label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }

        .auth-input {
          padding: 0.7rem 0.9rem;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #111;
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          font-family: inherit;
        }

        .auth-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .auth-input::placeholder {
          color: #bbb;
        }

        .auth-submit {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-error {
          padding: 0.7rem 0.9rem;
          border-radius: 8px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9rem;
          color: #666;
        }

        .auth-footer a {
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
