export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#grad)" />
              <path d="M12 28V16l8-6 8 6v12H22v-6h-4v6H12z" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="auth-brand-name">AI Seekho</span>
          </div>
          <h1 className="auth-tagline">Learn AI tools in<br />bite-sized videos</h1>
          <p className="auth-subtitle">
            Short, focused tutorials on the latest AI tools. 
            Watch anywhere, learn at your pace.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">🎬</span>
              <span>Short-form video lessons</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🤖</span>
              <span>Latest AI tools covered</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">📱</span>
              <span>Watch on any device</span>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        {children}
      </div>

      <style>{`
        .auth-layout {
          display: flex;
          min-height: 100vh;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
        }

        .auth-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%);
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          animation: pulse 8s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(3deg); }
        }

        .auth-brand {
          position: relative;
          z-index: 1;
          max-width: 480px;
          color: white;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 2.5rem;
        }

        .auth-brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .auth-tagline {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .auth-feature-icon {
          font-size: 1.25rem;
        }

        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .auth-layout {
            flex-direction: column;
          }
          .auth-left {
            padding: 2rem;
            min-height: auto;
          }
          .auth-tagline {
            font-size: 1.75rem;
          }
          .auth-features {
            display: none;
          }
          .auth-right {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  )
}
