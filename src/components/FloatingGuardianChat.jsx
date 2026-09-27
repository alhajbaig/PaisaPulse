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
    userName: currentPersona?.name || 'User',
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
        language
      });

      setMessages(prev => [
        ...prev,
        {
          id: `m_ai_${Date.now()}`,
          sender: 'ai',
          text: reply
        }
      ]);
      soundFX.playSuccess();
    } catch (err) {
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
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Window */}
      {isOpen ? (
        <div className="w-[380px] h-[520px] bg-ivory rounded-2xl border border-line-medium shadow-lifted flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="p-4 border-b border-line-medium bg-ivory flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cream border border-line-light flex items-center justify-center text-coral">
                <Sparkles size={14} />
              </div>
              <div>
                <h4 className="font-editorial text-lg text-ink font-normal leading-tight">
                  PaisaPulse Guardian
                </h4>
                <span className="font-sans text-[10px] text-ink-muted block">
                  AI Cashflow Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullGuardian();
                }}
                className="w-7 h-7 rounded-full border border-line-medium hover:border-line-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
                title="Expand to Full View"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full border border-line-medium hover:border-line-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-2 bg-cream/40 border-b border-line-light font-sans text-[11px] flex items-center justify-between text-ink-muted">
            <span>Balance: <strong className="text-ink font-accent num-tabular">{formatINR(safeToSpendResult.effectiveCurrentBalance)}</strong></span>
            <span>Safe: <strong className="text-coral font-accent num-tabular">{formatINR(safeToSpendResult.safeToSpendToday)}</strong></span>
            <span>Risk: <strong className="text-ink font-accent">{forecastResult.riskLevel.label}</strong></span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto bg-ivory space-y-3">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl text-xs font-sans leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cream border border-line-medium text-ink'
                    : 'bg-ivory border border-line-medium text-ink shadow-subtle'
                }`}>
                  {m.sender === 'user' ? m.text : <MarkdownView content={m.text} />}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-xs font-sans text-coral flex items-center gap-1.5 pt-1">
                <Sparkles size={13} className="animate-spin" />
                <span>Guardian is analyzing cashflow...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick prompt chips */}
          <div className="p-2.5 px-3 bg-cream/30 border-t border-line-light flex gap-1.5 overflow-x-auto">
            {quickPills.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-[10px] font-sans whitespace-nowrap px-2.5 py-1 rounded-full bg-ivory border border-line-medium text-ink-muted hover:border-line-dark hover:text-ink transition-colors cursor-pointer flex-shrink-0"
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
            className="p-3 bg-ivory border-t border-line-medium flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={language === 'hinglish' ? 'PaisaPulse se poochhein...' : 'Ask Guardian...'}
              className="flex-1 px-3 py-1.5 rounded-full border border-line-medium bg-cream text-ink font-sans text-xs focus:outline-none focus:border-coral transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center hover:bg-coral-dark transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
            >
              <Send size={13} />
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
          className="flex items-center gap-2 bg-ivory border border-line-medium text-ink px-4 py-2.5 rounded-full shadow-lifted hover:border-line-dark hover:shadow-hover transition-all cursor-pointer group"
        >
          <div className="w-5 h-5 rounded-full bg-coral text-white flex items-center justify-center text-[10px]">
            <Sparkles size={11} />
          </div>
          <span className="font-sans text-xs font-semibold text-ink group-hover:text-coral transition-colors">
            {isSevere 
              ? (language === 'hinglish' ? 'Shortfall Bachao' : 'Shortfall Shield') 
              : (language === 'hinglish' ? 'AI Guardian' : 'AI Guardian')}
          </span>
        </button>
      )}
    </div>
  );
}
