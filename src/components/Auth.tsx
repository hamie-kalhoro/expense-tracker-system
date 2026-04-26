import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Wallet, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, AtSign, Sun, Moon, CheckCircle, Activity, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isMockMode, checkUsernameAvailability } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Real-time username availability check
  useEffect(() => {
    if (!signupUsername.trim() || signupUsername.length < 3) {
      setUsernameAvailable('idle');
      return;
    }
    const isValidFormat = /^[a-z0-9_]+$/.test(signupUsername);
    if (!isValidFormat) {
      setUsernameAvailable('idle');
      return;
    }
    setUsernameAvailable('checking');
    const timeoutId = setTimeout(async () => {
      try {
        const isAvailable = await checkUsernameAvailability(signupUsername);
        setUsernameAvailable(isAvailable ? 'available' : 'taken');
      } catch {
        setUsernameAvailable('idle');
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [signupUsername, checkUsernameAvailability]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(loginIdentifier, loginPassword);
      toast.success('Welcome back! 👋');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (signupUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(signupUsername)) {
      toast.error('Username can only contain lowercase letters, numbers, and underscores');
      return;
    }
    if (usernameAvailable !== 'available') {
      toast.error('Please choose an available username');
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(signupEmail, signupPassword, signupUsername);
      if (result?.session) {
        toast.success('Account created successfully! 🎉');
      } else {
        toast.success('Signup successful! Please check your email for a confirmation link.', { duration: 6000 });
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px 13px 42px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--auth-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Blobs */}
      <div className="blob" style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        opacity: 0.6, zIndex: 0
      }} />
      <div className="blob" style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
        opacity: 0.6, zIndex: 0
      }} />

      <div
        className="glass animate-entrance"
        style={{
          maxWidth: '850px',
          width: '95%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1,
          border: '1px solid var(--border)',
        }}
      >
        {/* Left Side: Brand/Visuals (Hidden on mobile) */}
        <div className="nav-tabs" style={{
          padding: 'clamp(32px, 5vw, 48px)',
          background: 'linear-gradient(225deg, #4f46e5 0%, #7626e8 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Back Button (Desktop) */}
          <button onClick={() => navigate('/')} className="icon-btn desktop-only" style={{ position: 'absolute', top: '24px', left: '24px', color: 'white', zIndex: 10 }}>
            <ArrowLeft size={20} />
          </button>
          {/* Subtle grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px', opacity: 0.3
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '32px', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Wallet size={32} />
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}>
              Secure your <br /> 
              <span className="text-glow">finances.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6, maxWidth: '280px' }}>
              SplitEase helps you track, split, and settle debts with friends in a secure, aesthetic environment.
            </p>

            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: CheckCircle, text: 'Real-time settlement' },
                { icon: Activity, text: 'Expense analytics' },
                { icon: Users, text: 'Social networking' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <item.icon size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div style={{
          padding: 'clamp(24px, 4vw, 40px) clamp(24px, 4vw, 36px)',
          background: 'var(--bg-card)',
          position: 'relative'
        }}>
          {/* Mobile Back Button */}
          <button onClick={() => navigate('/')} className="icon-btn mobile-only" style={{ position: 'absolute', top: '24px', left: '24px', color: 'var(--text-primary)', zIndex: 10 }}>
            <ArrowLeft size={20} />
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="icon-btn theme-spin" style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-primary)', zIndex: 10 }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '8px' }}>
              {isLogin ? 'Access Portal' : 'Register Now'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {isLogin ? "Welcome back to your financial hub." : "Start your professional tracking today."}
            </p>
          </div>

          {/* Error Banner */}
          {(window.location.hash.includes('error') || window.location.search.includes('error')) && (
            <div className="animate-slide-down" style={{ 
              background: 'var(--error-bg)', color: 'var(--error)', 
              padding: '12px 16px', borderRadius: 'var(--radius-md)', 
              marginBottom: '24px', fontSize: '0.85rem', border: '1px solid var(--error-border)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Lock size={16} />
              <span>Authentication issue detected. Please try again.</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--bg-elevated)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: 'var(--radius-sm)',
                background: isLogin ? 'var(--bg-card)' : 'transparent',
                color: isLogin ? 'var(--accent-1)' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: isLogin ? 'var(--shadow-sm)' : 'none', fontSize: '0.85rem'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: 'var(--radius-sm)',
                background: !isLogin ? 'var(--bg-card)' : 'transparent',
                color: !isLogin ? 'var(--accent-1)' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none', fontSize: '0.85rem'
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isLogin && (
              <div>
                <label style={labelStyle}>Username</label>
                <div style={{ position: 'relative' }}>
                  <AtSign size={18} style={iconStyle} />
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="input-field"
                    style={{ 
                      paddingLeft: '44px',
                      borderColor: usernameAvailable === 'taken' ? 'var(--error)' : usernameAvailable === 'available' ? 'var(--success)' : 'var(--border)'
                    }}
                    placeholder="alex_smith"
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    {usernameAvailable === 'checking' && <div className="spinner" style={{ width: '16px', height: '16px' }} />}
                    {usernameAvailable === 'available' && <CheckCircle size={18} color="var(--success)" />}
                  </div>
                </div>
              </div>
            )}

            {isLogin ? (
              <div>
                <label style={labelStyle}>Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <AtSign size={18} style={iconStyle} />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    placeholder="alex_smith or name@company.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={iconStyle} />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Password</label>
                {isLogin && <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-1)', marginBottom: '8px' }}>Forgot?</a>}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={isLogin ? loginPassword : signupPassword}
                  onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '8px' }}
            >
              {loading ? <div className="spinner" style={{ borderTopColor: 'white' }} /> : (isLogin ? 'Sign in' : 'Create free account')}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="btn btn-ghost"
            style={{ width: '100%', padding: '12px', gap: '12px' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
            Google Workspace
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            By continuing, you agree to our <a href="#" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

