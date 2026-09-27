import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Maximize2, 
  MessageSquare, 
  Cpu, 
  ArrowRight,
  Calculator
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { queryGroqGuardian, getSmartPromptSuggestions } from '../engine/groqService.js';
import { useLanguage } from '../services/i18n.jsx';
import MarkdownView from './MarkdownView';

export default function FloatingGuardianChat({ 
  currentPersona, 
  forecastResult, 
  safeToSpendResult,
  onOpenFullGuardian 
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm_init',
      sender: 'ai',
      text: language === 'hinglish'
        ? `Namaste! Main aapka **PaisaPulse AI Guardian** hu. Aaj ka safe kharcha **${formatINR(safeToSpendResult.safeToSpendToday)}** hai. Main aapki kya madad karu?`
        : `Namaste! I am your **PaisaPulse AI Guardian** powered by Groq. Your current safe-to-spend is **${formatINR(safeToSpendResult.safeToSpendToday)}**. How can I help you today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm_init') {
        return [{
          id: 'm_init',
          sender: 'ai',
          text: language === 'hinglish'
            ? `Namaste! Main aapka **PaisaPulse AI Guardian** hu. Aaj ka safe kharcha **${formatINR(safeToSpendResult.safeToSpendToday)}** hai. Main aapki kya madad karu?`
            : `Namaste! I am your **PaisaPulse AI Guardian** powered by Groq. Your current safe-to-spend is **${formatINR(safeToSpendResult.safeToSpendToday)}**. How can I help you today?`
        }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const financialContext = {
    userName: currentPersona.name || 'Kartik Sharma',
    currentBalance: safeToSpendResult.effectiveCurrentBalance,
    safeToSpendToday: safeToSpendResult.safeToSpendToday,
    upcomingIncome: currentPersona.upcomingIncome || [],
    upcomingCommitments: safeToSpendResult.committedItems || currentPersona.upcomingCommitments || [],
    safetyBuffer: safeToSpendResult.safetyBuffer || currentPersona.safetyBuffer || 3000,
    forecastRisk: forecastResult.riskLevel.label,
    minProjectedBalance: forecastResult.minProjectedBalance,
    shortfallDay: forecastResult.shortfallDay,
    recentTransactions: currentPersona.transactions || [],
    learnedPreferences: {
      subscriptionProtectionWeight: 0.95,
      discretionaryCapFlexibility: 0.85,
      peerSplitAggressiveness: 0.90
    }
  };

  const isSevere = forecastResult.riskLevel.label === 'Shortfall Risk' || forecastResult.minProjectedBalance < 0;

  const handleSendMessage = async (text) => {
    const q = (text || inputQuery).trim();
    if (!q || isLoading) return;

    soundFX.playClick();
    setInputQuery('');

    const userMsg = {
      id: `m_u_${Date.now()}`,
      sender: 'user',
      text: q
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setIsLoading(true);

    try {
      const reply = await queryGroqGuardian({
        messages: newThread,
        financialContext,
        language,
        maxTokens: 350
      });

      soundFX.playSuccess();
      setMessages(prev => [
        ...prev,
        {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: reply.text
        }
      ]);
    } catch (err) {
      soundFX.playWarning();
      setMessages(prev => [
        ...prev,
        {
          id: `m_err_${Date.now()}`,
          sender: 'ai',
          text: `Query failed: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPills = isSevere
    ? ['How do I avoid shortfall?', 'Will rent bounce?', 'Can I spend ₹300?']
    : ['Can I spend ₹1,000 today?', 'Why is safe-to-spend this amount?', 'What if salary is delayed?'];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '28px', zIndex: 1000 }}>
      {/* Floating Window */}
      {isOpen ? (
        <div style={{
          width: '380px',
          height: '520px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #EFE8DF',
          boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: isSevere ? 'linear-gradient(90deg, #991B1B, #DC2626)' : 'linear-gradient(90deg, #1C1917, #292524)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={15} color="#FDBA74" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  PaisaPulse AI Assistant
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#E4E4E7' }}>
                  Groq LPU • Live Financial Context
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullGuardian();
                }}
                style={{ color: '#E4E4E7', padding: '4px' }}
                title="Expand to Full View"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: '#E4E4E7', padding: '4px' }}
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div style={{
            padding: '6px 14px',
            background: isSevere ? '#FEF2F2' : '#FAF7F2',
            borderBottom: '1px solid #EFE8DF',
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#44403C'
          }}>
            <span>Balance: <strong>{formatINR(safeToSpendResult.effectiveCurrentBalance)}</strong></span>
            <span>Safe: <strong style={{ color: safeToSpendResult.safeToSpendToday > 0 ? '#059669' : '#EF4444' }}>{formatINR(safeToSpendResult.safeToSpendToday)}</strong></span>
            <span>Risk: <strong>{forecastResult.riskLevel.label}</strong></span>
          </div>

          {/* Message Thread */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', background: '#FAFAF9' }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  background: m.sender === 'user' ? '#EA580C' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : '#1C1917',
                  border: m.sender === 'user' ? 'none' : '1px solid #EFE8DF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  {m.sender === 'user' ? m.text : <MarkdownView content={m.text} />}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick prompt chips */}
          <div style={{ padding: '6px 12px', background: '#FFFFFF', borderTop: '1px solid #EFE8DF', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickPills.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                style={{
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  padding: '4px 8px',
                  borderRadius: '999px',
                  background: '#F5EFE6',
                  color: '#44403C',
                  fontWeight: 600,
                  border: '1px solid #EFE8DF'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              background: '#FFFFFF',
              borderTop: '1px solid #EFE8DF',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={language === 'hinglish' ? 'PaisaPulse AI se poochhein...' : 'Ask PaisaPulse AI...'}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D6D3D1',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#EA580C',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button */
        <button
          onClick={() => {
            soundFX.playClick();
            setIsOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isSevere ? 'linear-gradient(135deg, #DC2626, #991B1B)' : 'linear-gradient(135deg, #EA580C, #C2410C)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '999px',
            boxShadow: isSevere ? '0 8px 24px rgba(220, 38, 38, 0.45)' : '0 8px 24px rgba(234, 88, 12, 0.35)',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
          className="floating-ai-btn"
        >
          <Sparkles size={17} color="#FED7AA" />
          <span>{isSevere 
            ? (language === 'hinglish' ? 'AI Shortfall Bachao' : 'AI Shortfall Recovery') 
            : (language === 'hinglish' ? 'AI Guardian Se Baat Karein' : 'Chat with AI Guardian')}</span>
        </button>
      )}
    </div>
  );
}
