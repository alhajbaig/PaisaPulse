import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  FileSpreadsheet, 
  Plus, 
  Calendar, 
  Home, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Building2,
  Banknote,
  Smartphone,
  CreditCard,
  Tv,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../engine/audioEffects';
import { formatINR } from '../engine/cashflowEngine';

export default function OnboardingModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onCompleteOnboarding,
  onOpenCSVImport,
  onOpenAddTxModal
}) {
  const [step, setStep] = useState(1);

  // Step 1: Available Money & Location
  const [openingBalance, setOpeningBalance] = useState(currentUser?.initialBalance?.toString() || '12500');
  const [moneyLocations, setMoneyLocations] = useState({
    bank: true,
    cash: true,
    upi: true,
    other: false
  });

  // Step 3: Upcoming Money
  const [incomeSource, setIncomeSource] = useState('Monthly Stipend');
  const [incomeAmount, setIncomeAmount] = useState('8000');
  const [incomeDays, setIncomeDays] = useState('3');
  const [incomeCertainty, setIncomeCertainty] = useState('confirmed'); // confirmed | likely | uncertain
  const [hasUpcomingIncome, setHasUpcomingIncome] = useState(true);

  // Step 4: Scheduled Commitments
  const [commitmentTitle, setCommitmentTitle] = useState('Hostel / PG Rent');
  const [commitmentAmount, setCommitmentAmount] = useState('5000');
  const [commitmentDays, setCommitmentDays] = useState('2');
  const [commitmentCategory, setCommitmentCategory] = useState('Rent/Hostel');
  const [hasCommitment, setHasCommitment] = useState(true);

  // Step 5: Safety Preference
  const [safetyBufferChoice, setSafetyBufferChoice] = useState('3000');
  const [customBuffer, setCustomBuffer] = useState('');

  if (!isOpen) return null;

  const toggleLocation = (loc) => {
    soundFX.playClick();
    setMoneyLocations(prev => ({ ...prev, [loc]: !prev[loc] }));
  };

  const handleNext = () => {
    soundFX.playClick();
    setStep(prev => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    soundFX.playClick();
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinish = () => {
    soundFX.playSuccess();
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}

    const selectedBuffer = safetyBufferChoice === 'custom' 
      ? (parseFloat(customBuffer) || 1000) 
      : parseFloat(safetyBufferChoice);

    const userIncomes = [];
    if (hasUpcomingIncome && parseFloat(incomeAmount) > 0) {
      userIncomes.push({
        id: `inc_onboard_${Date.now()}`,
        title: incomeSource.trim() || 'Stipend',
        amount: parseFloat(incomeAmount),
        daysAway: parseInt(incomeDays, 10) || 5,
        certainty: incomeCertainty,
        date: `In ${incomeDays} days`,
        source: 'User Onboarding'
      });
    }

    const userCommitments = [];
    if (hasCommitment && parseFloat(commitmentAmount) > 0) {
      userCommitments.push({
        id: `com_onboard_${Date.now()}`,
        title: commitmentTitle.trim() || 'Rent',
        amount: parseFloat(commitmentAmount),
        daysAway: parseInt(commitmentDays, 10) || 3,
        category: commitmentCategory,
        essential: true,
        date: `In ${commitmentDays} days`
      });
    }

    onCompleteOnboarding({
      initialBalance: parseFloat(openingBalance) || 0,
      safetyBuffer: selectedBuffer,
      upcomingIncome: userIncomes,
      upcomingCommitments: userCommitments
    });

    onClose();
  };

  const effectiveBuffer = safetyBufferChoice === 'custom' 
    ? (parseFloat(customBuffer) || 0) 
    : parseFloat(safetyBufferChoice);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(28, 25, 23, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '92vh',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        border: '1px solid #EFE8DF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.25s ease-out'
      }}>
        {/* Header with Step Progress */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #EFE8DF',
          background: '#FCFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#EA580C',
                color: '#FFF',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                STEP {step} OF 5
              </span>
              <span style={{ fontSize: '0.82rem', color: '#78716C', fontWeight: 600 }}>
                First-Time Setup Guide
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1917', lineHeight: 1.2 }}>
              {step === 1 && "Tell PaisaPulse About Your Money"}
              {step === 2 && "Add or Import Your Transactions"}
              {step === 3 && "Tell Us About Upcoming Money"}
              {step === 4 && "Tell Us About Your Fixed Commitments"}
              {step === 5 && "Set Your Emergency Safety Floor"}
            </h2>
          </div>
          <button 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#78716C" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: '#F5EFE6' }}>
          <div style={{
            height: '100%',
            width: `${(step / 5) * 100}%`,
            background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* STEP 1: CURRENT AVAILABLE MONEY */}
          {step === 1 && (
            <div>
              <div style={{
                background: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px'
              }}>
                <Wallet size={20} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#C2410C' }}>
                    How Much Cash is Available to You Right Now?
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '2px' }}>
                    This is your <strong>Opening Balance</strong> baseline. It is <strong>NOT</strong> an expense — it defines your cash reserves from which safe daily spending is calculated.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>
                  Current Total Available Money (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', fontWeight: 800, color: '#EA580C' }}>
                    ₹
                  </span>
                  <input 
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="12500"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 34px',
                      borderRadius: '12px',
                      border: '2px solid #EFE8DF',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: '#1C1917',
                      background: '#FAF8F4',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1C1917', marginBottom: '10px' }}>
                Where is this money kept? (Select all that apply)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div 
                  onClick={() => toggleLocation('bank')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${moneyLocations.bank ? '#EA580C' : '#EFE8DF'}`,
                    background: moneyLocations.bank ? '#FFF7ED' : '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Building2 size={18} color={moneyLocations.bank ? '#EA580C' : '#78716C'} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>Bank Account</div>
                    <div style={{ fontSize: '0.72rem', color: '#78716C' }}>SBI, HDFC, ICICI, etc.</div>
                  </div>
                </div>

                <div 
                  onClick={() => toggleLocation('cash')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${moneyLocations.cash ? '#EA580C' : '#EFE8DF'}`,
                    background: moneyLocations.cash ? '#FFF7ED' : '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Banknote size={18} color={moneyLocations.cash ? '#EA580C' : '#78716C'} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>Cash in Hand</div>
                    <div style={{ fontSize: '0.72rem', color: '#78716C' }}>Physical notes / wallet</div>
                  </div>
                </div>

                <div 
                  onClick={() => toggleLocation('upi')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${moneyLocations.upi ? '#EA580C' : '#EFE8DF'}`,
                    background: moneyLocations.upi ? '#FFF7ED' : '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Smartphone size={18} color={moneyLocations.upi ? '#EA580C' : '#78716C'} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>UPI Wallets</div>
                    <div style={{ fontSize: '0.72rem', color: '#78716C' }}>Paytm, PhonePe, GPay</div>
                  </div>
                </div>

                <div 
                  onClick={() => toggleLocation('other')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${moneyLocations.other ? '#EA580C' : '#EFE8DF'}`,
                    background: moneyLocations.other ? '#FFF7ED' : '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <CreditCard size={18} color={moneyLocations.other ? '#EA580C' : '#78716C'} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1C1917' }}>Other / Prepaid</div>
                    <div style={{ fontSize: '0.72rem', color: '#78716C' }}>Campus card / splits</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADD / IMPORT TRANSACTIONS */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '18px' }}>
                How would you like to load your recent spending history into PaisaPulse?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  onClick={() => {
                    soundFX.playClick();
                    onOpenCSVImport();
                  }}
                  style={{
                    padding: '18px',
                    borderRadius: '14px',
                    border: '1.5px solid #EA580C',
                    background: '#FFF7ED',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EA580C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileSpreadsheet size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1C1917' }}>
                        Import Statement (CSV / Excel / JSON)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '2px' }}>
                        Upload statement from SBI, HDFC, GPay, PhonePe, or Splitwise.
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="#EA580C" />
                </div>

                <div 
                  onClick={() => {
                    soundFX.playClick();
                    onOpenAddTxModal();
                  }}
                  style={{
                    padding: '18px',
                    borderRadius: '14px',
                    border: '1.5px solid #EFE8DF',
                    background: '#FAF8F4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F5EFE6', color: '#44403C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1C1917' }}>
                        Add Transactions Manually
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '2px' }}>
                        Type individual payments (e.g. Swiggy, Uber, Chai, Books).
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="#78716C" />
                </div>

                <div 
                  onClick={handleNext}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px dashed #D6CCC2',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#57534E' }}>
                    Skip for now — Start with Starting Cash Only →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPCOMING MONEY */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
                Tell PaisaPulse about salary, stipends, or allowances you expect in the next 14–30 days.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' }}>
                <input 
                  type="checkbox"
                  checked={hasUpcomingIncome}
                  onChange={(e) => setHasUpcomingIncome(e.target.checked)}
                />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1C1917' }}>
                  I have expected income coming in soon
                </span>
              </label>

              {hasUpcomingIncome && (
                <div style={{ background: '#FAF8F4', padding: '16px', borderRadius: '14px', border: '1px solid #EFE8DF' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      Source / Title
                    </label>
                    <input 
                      type="text"
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      placeholder="e.g. Internship Stipend or Family Allowance"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Amount (₹)
                      </label>
                      <input 
                        type="number"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        placeholder="8000"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 800 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Expected In (Days)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={incomeDays}
                        onChange={(e) => setIncomeDays(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                      Income Certainty (Conservative Calculation)
                    </label>
                    <select
                      value={incomeCertainty}
                      onChange={(e) => setIncomeCertainty(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                    >
                      <option value="confirmed">Confirmed (100% Guaranteed payroll / stipend)</option>
                      <option value="likely">Likely (85% Monthly family transfer)</option>
                      <option value="uncertain">Uncertain (50% Client invoice / gig payment)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '4px', display: 'block' }}>
                      PaisaPulse will protect your liquidity by not frontloading unconfirmed funds.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SCHEDULED COMMITMENTS */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
                Fixed bills must be protected so you never bounce rent or incur bank penalties.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px' }}>
                <input 
                  type="checkbox"
                  checked={hasCommitment}
                  onChange={(e) => setHasCommitment(e.target.checked)}
                />
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1C1917' }}>
                  I have fixed rent, bills, or subscriptions due before next income
                </span>
              </label>

              {hasCommitment && (
                <div style={{ background: '#FAF8F4', padding: '16px', borderRadius: '14px', border: '1px solid #EFE8DF' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Commitment Title
                      </label>
                      <input 
                        type="text"
                        value={commitmentTitle}
                        onChange={(e) => setCommitmentTitle(e.target.value)}
                        placeholder="e.g. PG Rent"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        value={commitmentCategory}
                        onChange={(e) => setCommitmentCategory(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      >
                        <option value="Rent/Hostel">Rent / Hostel</option>
                        <option value="Subscriptions">Subscriptions (Netflix, Gym)</option>
                        <option value="Bills">Bills (WiFi, Phone, Electricity)</option>
                        <option value="Education">Education / Exam Fee</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Amount (₹)
                      </label>
                      <input 
                        type="number"
                        value={commitmentAmount}
                        onChange={(e) => setCommitmentAmount(e.target.value)}
                        placeholder="5000"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 800 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                        Due In (Days)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={commitmentDays}
                        onChange={(e) => setCommitmentDays(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: SET SAFETY PREFERENCE */}
          {step === 5 && (
            <div>
              <p style={{ fontSize: '0.84rem', color: '#78716C', marginBottom: '16px' }}>
                How much money do you want to keep strictly protected as an untouchable emergency cushion?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {['1000', '2000', '3000', 'custom'].map(opt => {
                  const isSelected = safetyBufferChoice === opt;
                  return (
                    <div 
                      key={opt}
                      onClick={() => {
                        soundFX.playClick();
                        setSafetyBufferChoice(opt);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#10B981' : '#EFE8DF'}`,
                        background: isSelected ? '#ECFDF5' : '#FAF8F4',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isSelected ? '#047857' : '#1C1917' }}>
                        {opt === 'custom' ? 'Custom' : `₹${parseInt(opt).toLocaleString('en-IN')}`}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '2px' }}>
                        {opt === '1000' && 'Minimal cushion'}
                        {opt === '2000' && 'Standard student buffer'}
                        {opt === '3000' && 'Recommended safety floor'}
                        {opt === 'custom' && 'Enter your own amount'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {safetyBufferChoice === 'custom' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                    Custom Emergency Buffer Amount (₹)
                  </label>
                  <input 
                    type="number"
                    value={customBuffer}
                    onChange={(e) => setCustomBuffer(e.target.value)}
                    placeholder="e.g. 4000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D6CCC2', background: '#FFF', fontWeight: 800 }}
                  />
                </div>
              )}

              {/* Transparent Explanation Box */}
              <div style={{
                background: '#FAF8F4',
                border: '1px solid #EFE8DF',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                gap: '10px'
              }}>
                <ShieldCheck size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#1C1917' }}>
                    PaisaPulse Safety Guarantee
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#57534E', marginTop: '2px', lineHeight: 1.4 }}>
                    Your protected reserve of <strong>{formatINR(effectiveBuffer)}</strong> will <strong>never</strong> be considered available for discretionary spending. All daily safe-to-spend limits stop immediately if this floor is threatened.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #EFE8DF',
          background: '#FCFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {step > 1 ? (
            <button 
              className="btn-secondary"
              onClick={handlePrev}
              style={{ fontSize: '0.84rem', padding: '9px 16px', gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button 
              className="btn-primary"
              onClick={handleNext}
              style={{ fontSize: '0.86rem', padding: '9px 20px', gap: '6px' }}
            >
              <span>Continue</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button 
              className="btn-primary"
              onClick={handleFinish}
              style={{ fontSize: '0.88rem', padding: '10px 22px', gap: '6px', background: '#059669' }}
            >
              <CheckCircle2 size={16} />
              <span>Complete Setup & Launch Decision Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
