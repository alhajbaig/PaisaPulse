import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  Calendar,
  Home,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../engine/audioEffects';
import { 
  loginUser, 
  loginUserAsync,
  switchUserByEmail,
  registerUser, 
  getDemoUser, 
  DEMO_CREDENTIALS,
  findUserByEmail,
  saveUserData
} from '../engine/userStore';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';
import { fetchUserFromSupabase } from '../services/supabaseSync';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('College Student & Intern');
  const [initialBalance, setInitialBalance] = useState('15000');
  const [safetyBuffer, setSafetyBuffer] = useState('3000');

  // Optional user-specified upcoming income
  const [hasUpcomingIncome, setHasUpcomingIncome] = useState(false);
  const [incomeTitle, setIncomeTitle] = useState('Monthly Stipend');
  const [incomeAmount, setIncomeAmount] = useState('20000');
  const [incomeDays, setIncomeDays] = useState('5');

  // Optional user-specified recurring commitment
  const [hasCommitment, setHasCommitment] = useState(false);
  const [comTitle, setComTitle] = useState('PG Rent');
  const [comAmount, setComAmount] = useState('5000');
  const [comDays, setComDays] = useState('3');

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAuthError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // 1-Click Quick Demo Login for Hackathon Evaluators
  const handleQuickDemoLogin = (personaKey) => {
    soundFX.playSuccess();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    const user = getDemoUser(personaKey);
    onLoginSuccess({
      isDemo: true,
      personaKey,
      user
    });
    setAuthError(null);
    onClose();
  };

  // Pre-fill login credentials from demo card
  const handleFillDemoCredentials = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setAuthError(null);
    soundFX.playClick();
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError({
        message: 'Please enter both your email address and password.'
      });
      soundFX.playWarning();
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUserAsync(loginEmail, loginPassword);

      if (!result.success) {
        soundFX.playWarning();
        setAuthError({
          message: result.error,
          suggestSignup: result.suggestSignup,
          email: result.email
        });
        setIsLoading(false);
        return;
      }

      // Success!
      soundFX.playSuccess();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess({
        isDemo: false,
        user: result.user
      });
      onClose();
    } catch (err) {
      soundFX.playWarning();
      setAuthError({
        message: err?.message || 'An unexpected error occurred during login.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to Signup tab with email pre-filled
  const handleSwitchToSignup = (presetEmail) => {
    soundFX.playClick();
    setAuthError(null);
    if (presetEmail) {
      setSignupEmail(presetEmail);
    } else if (loginEmail.trim()) {
      setSignupEmail(loginEmail.trim());
    }
    setMode('signup');
  };

  // Switch to Login tab with email pre-filled
  const handleSwitchToLogin = (presetEmail) => {
    soundFX.playClick();
    setAuthError(null);
    if (presetEmail) {
      setLoginEmail(presetEmail);
    } else if (signupEmail.trim()) {
      setLoginEmail(signupEmail.trim());
    }
    setMode('login');
  };

  // Handle Sign Up Submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!fullName.trim()) {
      setAuthError({ message: 'Please provide your full name.' });
      soundFX.playWarning();
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setAuthError({ message: 'Please enter a valid email address.' });
      soundFX.playWarning();
      return;
    }

    if (!signupPassword || signupPassword.length < 4) {
      setAuthError({ message: 'Password must be at least 4 characters long.' });
      soundFX.playWarning();
      return;
    }

    if (signupPassword !== confirmPassword) {
      setAuthError({ message: 'Passwords do not match. Please re-enter carefully.' });
      soundFX.playWarning();
      return;
    }

    // Parse upcoming income
    const userIncomes = [];
    if (hasUpcomingIncome && incomeTitle.trim() && parseFloat(incomeAmount) > 0) {
      userIncomes.push({
        id: `inc_${Date.now()}`,
        title: incomeTitle.trim(),
        amount: parseFloat(incomeAmount),
        daysAway: parseInt(incomeDays, 10) || 5,
        date: `In ${incomeDays} days`,
        probability: 0.95
      });
    }

    // Parse recurring commitments
    const userCommitments = [];
    if (hasCommitment && comTitle.trim() && parseFloat(comAmount) > 0) {
      userCommitments.push({
        id: `com_${Date.now()}`,
        title: comTitle.trim(),
        amount: parseFloat(comAmount),
        daysAway: parseInt(comDays, 10) || 3,
        category: 'Rent',
        essential: true,
        date: `In ${comDays} days`
      });
    }

    let supaUid = null;
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase();
        if (client) {
          client.auth.signUp({
            email: signupEmail.trim().toLowerCase(),
            password: signupPassword,
            options: { data: { name: fullName.trim(), role } }
          }).then(res => {
            if (res?.data?.user?.id) {
              const u = findUserByEmail(signupEmail);
              if (u) saveUserData({ ...u, id: res.data.user.id });
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }

    const regResult = registerUser({
      id: supaUid || undefined,
      name: fullName,
      email: signupEmail,
      password: signupPassword,
      role,
      initialBalance: parseFloat(initialBalance) || 0,
      safetyBuffer: parseFloat(safetyBuffer) || 0,
      upcomingIncome: userIncomes,
      upcomingCommitments: userCommitments
    });

    if (!regResult.success) {
      soundFX.playWarning();
      setAuthError({
        message: regResult.error,
        suggestLogin: true,
        email: signupEmail
      });
      return;
    }

    soundFX.playSuccess();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    onLoginSuccess({
      isDemo: false,
      user: regResult.user
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #EFE8DF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #EFE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FCFAF7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}>
              <Zap size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>
                {mode === 'login' ? 'Log In to PaisaPulse' : 'Create Guardian Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '2px' }}>
                {mode === 'login' 
                  ? 'Access your saved transactions, forecasts & balance' 
                  : 'Your personal financial ledger — saved securely & accessible anytime'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: '#F5EFE6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#78716C',
              transition: 'background 0.2s'
            }}
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher - Seamlessly Connects Login & Sign Up */}
        <div style={{ 
          display: 'flex', 
          padding: '12px 24px 0', 
          gap: '8px', 
          background: '#FCFAF7',
          borderBottom: '1px solid #EFE8DF'
        }}>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setAuthError(null);
              setMode('login');
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px 10px 0 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#EA580C' : '#78716C',
              borderTop: mode === 'login' ? '2px solid #EA580C' : '2px solid transparent',
              borderLeft: mode === 'login' ? '1px solid #EFE8DF' : '1px solid transparent',
              borderRight: mode === 'login' ? '1px solid #EFE8DF' : '1px solid transparent',
              borderBottom: mode === 'login' ? '1px solid #FFFFFF' : 'none',
              marginBottom: mode === 'login' ? '-1px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <LogIn size={16} />
            <span>Log In (Existing User)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setAuthError(null);
              setMode('signup');
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px 10px 0 0',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              color: mode === 'signup' ? '#EA580C' : '#78716C',
              borderTop: mode === 'signup' ? '2px solid #EA580C' : '2px solid transparent',
              borderLeft: mode === 'signup' ? '1px solid #EFE8DF' : '1px solid transparent',
              borderRight: mode === 'signup' ? '1px solid #EFE8DF' : '1px solid transparent',
              borderBottom: mode === 'signup' ? '1px solid #FFFFFF' : 'none',
              marginBottom: mode === 'signup' ? '-1px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={16} />
            <span>Sign Up (New Account)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Dynamic Error / Helper Notification */}
          {authError && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.84rem', color: '#991B1B', fontWeight: 600 }}>
                  {authError.message}
                </p>
                {/* Cross-Link helper to seamlessly switch */}
                {authError.suggestSignup && (
                  <button
                    type="button"
                    onClick={() => handleSwitchToSignup(authError.email)}
                    style={{
                      marginTop: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#EA580C',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    <span>Click here to create an account with this email</span>
                    <ArrowRight size={13} />
                  </button>
                )}
                {authError.suggestLogin && (
                  <button
                    type="button"
                    onClick={() => handleSwitchToLogin(authError.email)}
                    style={{
                      marginTop: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#EA580C',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    <span>Click here to log into your existing account</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LOG IN VIEW                                                   */}
          {/* ============================================================== */}
          {mode === 'login' ? (
            <div>
              {/* Evaluator Quick Demo Cards */}
              <div style={{
                background: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={16} color="#EA580C" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#C2410C' }}>
                    1-Click Evaluator Demo Accounts
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#78716C', marginBottom: '10px' }}>
                  Pre-populated real datasets (or log in with password <code style={{ background: '#FFEDD5', padding: '1px 5px', borderRadius: '4px', color: '#9A3412', fontWeight: 700 }}>password123</code>):
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {DEMO_CREDENTIALS.map(demo => (
                    <div 
                      key={demo.key}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #FED7AA',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#1C1917' }}>
                          {demo.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#78716C' }}>
                          {demo.email}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700, marginTop: '2px' }}>
                          Balance: {demo.balance}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleQuickDemoLogin(demo.key)}
                          style={{
                            flex: 1,
                            background: '#EA580C',
                            color: '#FFF',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Zap size={12} />
                          <span>1-Click</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemoCredentials(demo.email, demo.password)}
                          style={{
                            background: '#F5EFE6',
                            color: '#44403C',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                          title="Fill credentials into form"
                        >
                          Autofill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} autoComplete="off">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                    <Mail size={14} color="#EA580C" />
                    <span>Registered Email Address *</span>
                  </label>
                  <input 
                    type="email"
                    autoComplete="off"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="kartik@pulse.in or your email"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #D6CCC2',
                      background: '#FAF8F4',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                    <Lock size={14} color="#EA580C" />
                    <span>Password *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="off"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Enter your account password"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D6CCC2',
                        background: '#FAF8F4',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#78716C',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '13px', 
                    fontSize: '0.95rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  <LogIn size={18} />
                  <span>Log In & Access My Data</span>
                </button>
              </form>

              {/* Seamless Connection Link to Sign Up */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #EFE8DF',
                textAlign: 'center',
                background: '#FAF8F4',
                padding: '14px',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#57534E' }}>
                  Don't have an account yet?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchToSignup()}
                  style={{
                    color: '#EA580C',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Sign Up & Start Ledger</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* SIGN UP VIEW                                                  */
            /* ============================================================== */
            <form onSubmit={handleSignupSubmit}>
              {/* SECTION 1: CREDENTIALS */}
              <div style={{
                background: '#FAF8F4',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #EFE8DF',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <UserPlus size={16} color="#EA580C" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1C1917' }}>
                    1. Account Credentials & Login Details
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6CCC2',
                        background: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      Profile / Profession
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6CCC2',
                        background: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    >
                      <option value="College Student & Intern">College Student & Intern</option>
                      <option value="Freelancer / Consultant">Freelancer / Creator</option>
                      <option value="Young Working Professional">Young Working Professional</option>
                      <option value="Startup Founder">Startup Founder / Entrepreneur</option>
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                    <Mail size={13} color="#EA580C" />
                    <span>Email Address (Used for future logins) *</span>
                  </label>
                  <input 
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@gmail.com"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D6CCC2',
                      background: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '2px', display: 'block' }}>
                    This email is your unique account key. Your financial data will be permanently saved to it.
                  </span>
                </div>

                {/* Passwords */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      <Lock size={13} color="#EA580C" />
                      <span>Password *</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 4 characters"
                        required
                        minLength={4}
                        style={{
                          width: '100%',
                          padding: '9px 34px 9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D6CCC2',
                          background: '#FFFFFF',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#78716C',
                          padding: '2px'
                        }}
                      >
                        {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      <Lock size={13} color="#EA580C" />
                      <span>Confirm Password *</span>
                    </label>
                    <input 
                      type={showSignupPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6CCC2',
                        background: '#FFFFFF',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STARTING BALANCE & SAFETY BUFFER */}
              <div style={{
                background: '#FAF8F4',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #EFE8DF',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Wallet size={16} color="#EA580C" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1C1917' }}>
                    2. Starting Liquidity & Emergency Floor
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                      Liquid Bank Balance (₹) *
                    </label>
                    <input 
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="15000"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6CCC2',
                        background: '#FFFFFF',
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#1C1917',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#78716C' }}>Actual cash in bank account today</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                      Safety Buffer Target (₹) *
                    </label>
                    <input 
                      type="number"
                      value={safetyBuffer}
                      onChange={(e) => setSafetyBuffer(e.target.value)}
                      placeholder="3000"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D6CCC2',
                        background: '#FFFFFF',
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#10B981',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#78716C' }}>Untouchable liquidity baseline</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: USER DEFINES NEXT EXPECTED INCOME */}
              <div style={{
                background: '#FAF8F4',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #EFE8DF',
                marginBottom: '14px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: hasUpcomingIncome ? '12px' : '0' }}>
                  <input 
                    type="checkbox"
                    checked={hasUpcomingIncome}
                    onChange={(e) => setHasUpcomingIncome(e.target.checked)}
                  />
                  <Calendar size={15} color="#059669" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>
                    I have an expected salary / stipend / transfer coming soon
                  </span>
                </label>

                {hasUpcomingIncome && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid #EFE8DF' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        Source / Title
                      </label>
                      <input 
                        type="text"
                        value={incomeTitle}
                        onChange={(e) => setIncomeTitle(e.target.value)}
                        placeholder="e.g. Stipend"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        Amount (₹)
                      </label>
                      <input 
                        type="number"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        placeholder="20000"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        In (Days)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={incomeDays}
                        onChange={(e) => setIncomeDays(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: USER DEFINES RECURRING COMMITMENTS */}
              <div style={{
                background: '#FAF8F4',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #EFE8DF',
                marginBottom: '18px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: hasCommitment ? '12px' : '0' }}>
                  <input 
                    type="checkbox"
                    checked={hasCommitment}
                    onChange={(e) => setHasCommitment(e.target.checked)}
                  />
                  <Home size={15} color="#EA580C" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>
                    I have a fixed bill or rent due before next income
                  </span>
                </label>

                {hasCommitment && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid #EFE8DF' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        Bill Title
                      </label>
                      <input 
                        type="text"
                        value={comTitle}
                        onChange={(e) => setComTitle(e.target.value)}
                        placeholder="e.g. PG Rent"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        Amount (₹)
                      </label>
                      <input 
                        type="number"
                        value={comAmount}
                        onChange={(e) => setComAmount(e.target.value)}
                        placeholder="5000"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#57534E', marginBottom: '2px' }}>
                        Due In (Days)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={comDays}
                        onChange={(e) => setComDays(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '13px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Create Account & Save My Profile</span>
              </button>

              {/* Seamless Connection Link to Log In */}
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #EFE8DF',
                textAlign: 'center',
                background: '#FAF8F4',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#57534E' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchToLogin()}
                  style={{
                    color: '#EA580C',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Log In to Existing Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
