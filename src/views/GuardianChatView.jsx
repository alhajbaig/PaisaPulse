"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ArrowRight,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { queryGroqGuardian, getSmartPromptSuggestions } from '../engine/groqService.js';
import { useLanguage } from '../services/i18n.jsx';
import MarkdownView from '../components/MarkdownView';

export default function GuardianChatView({ 
  currentPersona, 
  forecastResult, 
  safeToSpendResult,
  activeScenario 
}) {
  const { t, language } = useLanguage();
  const nextIncome = currentPersona.upcomingIncome?.[0];
  const commitments = safeToSpendResult.committedItems || currentPersona.upcomingCommitments || [];
  const firstName = currentPersona?.name ? currentPersona.name.split(' ')[0] : 'User';

  // Financial context object to pass into Groq AI (100% preserved)
  const financialContext = {
    userName: currentPersona?.name || 'User',
    currentBalance: safeToSpendResult.effectiveCurrentBalance,
    safeToSpendToday: safeToSpendResult.safeToSpendToday,
    upcomingIncome: currentPersona.upcomingIncome || [],
    upcomingCommitments: commitments,
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

  const buildWelcomeMessage = (lang) => {
    const isHinglish = lang === 'hinglish';
    if (isSevere) {
      if (isHinglish) {
        return `**Namaste ${firstName}! Warning: Shortfall Risk detect hua hai.**\n\nAapka projected minimum balance lagbhag **${forecastResult.shortfallDay?.dayLabel || 'Day 4'}** ko **${formatINR(forecastResult.minProjectedBalance)}** tak girne ka risk hai. Aaj ka aapka Safe-to-Spend limit **${formatINR(safeToSpendResult.safeToSpendToday)}/day** hai.\n\nKuch bhi poochhein—kya Zomato ya shopping afford kar sakte hain, ya recovery plan kaise banayein!`;
      }
      return `**Hello ${firstName}. Shortfall Risk Detected.**\n\nYour projected minimum balance drops to **${formatINR(forecastResult.minProjectedBalance)}** around **${forecastResult.shortfallDay?.dayLabel || 'Day 4'}**. Your current Safe-to-Spend limit is **${formatINR(safeToSpendResult.safeToSpendToday)}/day**.\n\nAsk me anything about your cashflow—whether a specific purchase is safe, or how to ring-fence your commitments.`;
    } else {
      if (isHinglish) {
        return `**Namaste ${firstName}! Main aapka PaisaPulse AI Financial Guardian hu.**\n\nMain aapke bank account (**${formatINR(safeToSpendResult.effectiveCurrentBalance)}** liquid balance) aur upcoming commitments pe nazar rakh raha hu. Aaj ka aapka Safe-to-Spend limit **${formatINR(safeToSpendResult.safeToSpendToday)}** hai.\n\nKuch bhi poochhein—kya naya purchase safe hai, ya salary delay ho toh kya hoga!`;
      }
      return `**Good day, ${firstName}. I am your PaisaPulse Financial Guardian.**\n\nI am watching your account (**${formatINR(safeToSpendResult.effectiveCurrentBalance)}** liquid cash) and commitments. Your current Safe-to-Spend limit is **${formatINR(safeToSpendResult.safeToSpendToday)} today**.\n\nAsk me about upcoming purchases, salary changes, or how to protect your safety buffer.`;
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: buildWelcomeMessage(language)
    }
  ]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg_welcome') {
        return [{
          id: 'msg_welcome',
          sender: 'ai',
          text: buildWelcomeMessage(language)
        }];
      }
      return prev;
    });
  }, [language]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const smartSuggestions = getSmartPromptSuggestions(financialContext, language);

  const handleAsk = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    soundFX.playClick();
    setInputQuery('');

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: q
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setIsLoading(true);

    try {
      const aiReply = await queryGroqGuardian({
        messages: newThread,
        financialContext,
        language
      });

      soundFX.playSuccess();
      setMessages(prev => [
        ...prev,
        {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: aiReply.text,
          modelUsed: aiReply.modelUsed
        }
      ]);
    } catch (err) {
      soundFX.playWarning();
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'ai',
          text: language === 'hinglish'
            ? `**Error**: ${err.message}. Kripya connection check karein ya dobara try karein.`
            : `**Unable to complete query**: ${err.message}. Please check connection or retry.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    soundFX.playClick();
    setMessages([
      {
        id: `msg_init_${Date.now()}`,
        sender: 'ai',
        text: buildWelcomeMessage(language)
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-line-medium pb-6 pt-2">
        <div className="space-y-1">
          <span className="text-xs font-accent uppercase tracking-widest text-coral font-bold block">
            Guardian AI
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink font-normal">
            Your financial intelligence assistant
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted">
            Personalized to your exact statement, upcoming commitments, and real-time cashflow math.
          </p>
        </div>

        <button 
          onClick={handleClearHistory}
          className="px-4 py-1.5 rounded-full bg-ivory border border-line-medium text-xs font-sans text-ink-muted hover:text-ink hover:border-line-dark transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Conversation</span>
        </button>
      </div>

      {/* Main Grid: Conversation Left, Financial Context Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chat Stream & Clean Input */}
        <div className="lg:col-span-8 space-y-6">
          {/* Messages Stream */}
          <div className="space-y-4 min-h-[380px]">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'user' ? (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink text-ivory px-5 py-3 text-sm font-sans leading-relaxed shadow-sm">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-cream/60 border border-line-medium px-6 py-4 space-y-2 text-ink">
                    <div className="flex items-center justify-between text-[11px] font-accent text-coral font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>PaisaPulse Guardian</span>
                      </span>
                      <span className="text-[10px] text-ink-subtle font-normal">
                        {m.modelUsed || 'AI Engine'}
                      </span>
                    </div>
                    <div className="text-sm font-sans leading-relaxed text-ink">
                      <MarkdownView content={m.text} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-cream/60 border border-line-medium px-5 py-3 text-xs font-sans text-coral flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating forward cashflow math...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Quick Prompt Pills */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-accent uppercase text-ink-subtle font-bold tracking-wider block">
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-2">
              {smartSuggestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-full bg-ivory border border-line-medium hover:border-coral/40 text-xs font-sans text-ink-muted hover:text-ink transition-all text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-coral shrink-0" />
                  <span className="truncate max-w-xs">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clean Editorial Chat Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="rounded-full bg-ivory border-2 border-line-medium focus-within:border-coral transition-colors px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <input 
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder='Ask anything: "Can I spend ₹1,200 on dinner?", "What if stipend is late?"...'
              className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-ink placeholder:text-ink-subtle px-2"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-coral text-ivory hover:bg-coral-hover disabled:opacity-40 transition-all flex items-center justify-center shrink-0 shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Live Financial Reality Snapshot (Quiet Editorial) */}
        <div className="lg:col-span-4 space-y-6 p-5 rounded-2xl bg-cream/40 border border-line-medium">
          <div className="border-b border-line-medium pb-3">
            <span className="text-[10px] font-accent uppercase tracking-widest text-ink-subtle font-bold block">
              Live Baseline Data
            </span>
            <h3 className="font-editorial text-lg text-ink font-normal">
              Active cashflow parameters
            </h3>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between py-1 border-b border-line-light">
              <span className="text-ink-muted">Available Liquid Cash:</span>
              <span className="font-bold text-ink num-tabular">{formatINR(safeToSpendResult.effectiveCurrentBalance)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-light">
              <span className="text-ink-muted">Safe-To-Spend Today:</span>
              <span className="font-bold text-coral num-tabular">{formatINR(safeToSpendResult.safeToSpendToday)}/day</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-light">
              <span className="text-ink-muted">Protected Safety Buffer:</span>
              <span className="font-semibold text-ink num-tabular">{formatINR(safeToSpendResult.safetyBuffer)}</span>
            </div>
            {nextIncome && (
              <div className="flex justify-between py-1 border-b border-line-light">
                <span className="text-ink-muted">Next Inflow ({nextIncome.daysAway}d):</span>
                <span className="font-semibold text-emerald-800 num-tabular">+{formatINR(nextIncome.amount)}</span>
              </div>
            )}
          </div>

          {/* Upcoming Commitments Ring-Fenced */}
          <div className="pt-2">
            <span className="text-[10px] font-accent uppercase tracking-wider text-ink-subtle font-bold block mb-2">
              Ring-Fenced Commitments
            </span>
            <div className="space-y-1.5 text-xs font-sans">
              {commitments.slice(0, 3).map((c, i) => (
                <div key={i} className="flex justify-between text-ink py-0.5">
                  <span className="text-ink-muted truncate max-w-[140px]">{c.title} (in {c.daysAway}d)</span>
                  <span className="font-semibold text-coral num-tabular">−{formatINR(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
