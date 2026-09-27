import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  ArrowRight,
  Calculator,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Cpu,
  TrendingDown,
  TrendingUp,
  CreditCard,
  UserCheck
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
  const firstName = currentPersona.name?.split(' ')[0] || 'Alhaj';

  // Financial context object to pass into Groq AI
  const financialContext = {
    userName: currentPersona.name || 'Alhaj',
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
        return `**Namaste ${firstName} bhai! Warning: Shortfall Risk detect hua hai.**\n\nAapka projected minimum balance lagbhag **${forecastResult.shortfallDay?.dayLabel || 'Oct 14'}** ko **${formatINR(forecastResult.minProjectedBalance)}** tak girne ka khatra hai. Aaj ka aapka Safe-to-Spend limit sirf **${formatINR(safeToSpendResult.safeToSpendToday)}/day** hai.\n\nMain aapka Groq-powered Personal AI Financial Guardian hu. Poochhein kuch bhi—kya Swiggy pe kharcha karna safe hai, ya emergency recovery plan kaise banayein!`;
      }
      return `**Namaste ${firstName}! Shortfall Alert Detected.**\n\nYour projected minimum balance is forecasted to reach **${formatINR(forecastResult.minProjectedBalance)}** around **${forecastResult.shortfallDay?.dayLabel || 'Oct 14'}**. Your current daily Safe-to-Spend limit is **${formatINR(safeToSpendResult.safeToSpendToday)}/day**.\n\nI am your Groq-powered Personal AI Financial Guardian. Ask me anything—from calculating whether you can afford an expense (e.g. *"Can I afford a ₹350 Swiggy dinner tonight?"*) to building an emergency recovery plan!`;
    } else {
      if (isHinglish) {
        return `**Namaste ${firstName} bhai! Main aapka PaisaPulse AI Financial Guardian hu.**\n\nMain aapke bank account (**${formatINR(safeToSpendResult.effectiveCurrentBalance)}** current balance) aur upcoming bills pe nazar rakh raha hu. Aaj ka aapka Safe-to-Spend limit **${formatINR(safeToSpendResult.safeToSpendToday)}** hai.\n\nKuch bhi poochhein—kya naya kharcha afford kar sakte hain, ya salary delay ho toh kya karein!`;
      }
      return `**Namaste ${firstName}! I am your PaisaPulse AI Financial Guardian.**\n\nI am actively watching your bank account (**${formatINR(safeToSpendResult.effectiveCurrentBalance)}** liquid balance) and commitments. Your current Safe-to-Spend limit is **${formatINR(safeToSpendResult.safeToSpendToday)} today**.\n\nAsk me about upcoming purchases, salary delays, or how to optimize your spending!`;
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: buildWelcomeMessage(language)
    }
  ]);

  // Update initial welcome message when language toggles if user hasn't started chatting
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
            ? `**Groq query poori nahi ho saki**: ${err.message}. Kripya connection check karein ya dobara try karein.`
            : `**Unable to complete Groq query**: ${err.message}. Please check your connection or try again.`
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
        text: language === 'hinglish'
          ? `Conversation clear ho gaya. Main aapke live data ke saath taiyaar hu: **${formatINR(safeToSpendResult.effectiveCurrentBalance)}** current balance, **${formatINR(safeToSpendResult.safeToSpendToday)}/day** safe kharcha.`
          : `Conversation cleared. I am ready with your live financial data: **${formatINR(safeToSpendResult.effectiveCurrentBalance)}** liquid, **${formatINR(safeToSpendResult.safeToSpendToday)}/day** safe-to-spend.`
      }
    ]);
  };

  return (
    <div>
      {/* Header */}
      <div className="transactions-view-header">
        <div className="view-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>{t('chat_view_title', 'Personalised AI Financial Guardian')}</h2>
            <span style={{
              background: '#ECFDF5',
              color: '#059669',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #A7F3D0'
            }}>
              <Cpu size={12} />
              <span>{t('chat_model_badge', 'Groq LPU • Qwen 27B Active')}</span>
            </span>
          </div>
          <p>{t('chat_view_sub', 'Real-time conversational financial intelligence personalized to your exact Indian bank statement and scheduled commitments.')}</p>
        </div>

        <button 
          className="btn-secondary"
          onClick={handleClearHistory}
          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} />
          <span>{t('chat_reset_btn', 'Reset Chat')}</span>
        </button>
      </div>

      {/* Main Split Layout: Left is Chat Stream, Right is Real-time Financial Reality Panel */}
      <div className="guardian-chat-container">
        {/* Left Side: Conversational Feed & Input */}
        <div className="chat-thread-wrapper">
          <div className="chat-messages-scroll">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-row ${m.sender}`}>
                {m.sender === 'user' ? (
                  <div className="chat-bubble user">
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{m.text}</div>
                  </div>
                ) : (
                  <div className="chat-bubble ai">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Sparkles size={12} />
                        <span>PaisaPulse Guardian</span>
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#A8A29E' }}>
                        {m.modelUsed || (language === 'hinglish' ? 'Groq AI (Hinglish)' : 'Groq AI')}
                      </span>
                    </div>

                    {/* AI Response Text with Markdown Rendering */}
                    <div 
                      className="ai-response-content"
                      style={{ 
                        fontSize: '0.88rem', 
                        color: '#1C1917',
                        wordBreak: 'break-word',
                        lineHeight: 1.6
                      }}
                    >
                      <MarkdownView content={m.text} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="chat-bubble ai" style={{ maxWidth: '60%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontSize: '0.84rem', fontWeight: 600 }}>
                  <Sparkles size={16} className="animate-spin" />
                  <span>{language === 'hinglish' ? 'PaisaPulse calculate karke Hinglish advice ready kar raha hai...' : 'PaisaPulse is analyzing your balance & calculating math...'}</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat input form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="chat-input-bar"
          >
            <input 
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t('chat_input_placeholder', 'Ask anything: "Can I spend ₹1,200 on dinner tonight?", "What if salary is late?", "How to avoid shortfall?"')}
              className="chat-input-field"
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="chat-send-btn"
              disabled={!inputQuery.trim() || isLoading}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Right Side: Live Financial Context & Suggested Questions */}
        <div className="suggested-questions-panel">
          {/* Live Single Source of Truth Snapshot */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: isSevere ? '#FEF2F2' : '#FAF8F4',
            border: `1px solid ${isSevere ? '#FECACA' : '#EFE8DF'}`,
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calculator size={15} color={isSevere ? '#EF4444' : '#10B981'} />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1C1917' }}>
                  {t('chat_reality_title', 'Live Financial Reality')}
                </span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: isSevere ? '#EF4444' : '#059669',
                background: isSevere ? '#FEE2E2' : '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {forecastResult.riskLevel.label}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#44403C', lineHeight: '1.6' }}>
              <div>• {t('chat_reality_liquid', 'Liquid Balance:')} <strong>{formatINR(safeToSpendResult.effectiveCurrentBalance)}</strong></div>
              <div>• {t('chat_reality_safe', 'Safe-To-Spend:')} <strong style={{ color: safeToSpendResult.safeToSpendToday > 0 ? '#059669' : '#EF4444' }}>{formatINR(safeToSpendResult.safeToSpendToday)}/day</strong></div>
              <div>• {t('chat_reality_buffer', 'Protected Buffer:')} <strong>{formatINR(safeToSpendResult.safetyBuffer)}</strong></div>
              {nextIncome && (
                <div>• Next Inflow: <strong>+{formatINR(nextIncome.amount)}</strong> ({nextIncome.title}) in {nextIncome.daysAway} days</div>
              )}
              {forecastResult.shortfallDay && (
                <div style={{ color: '#DC2626', fontWeight: 700, marginTop: '4px' }}>
                  Deficit of {formatINR(forecastResult.shortfallDay.deficit)} on {forecastResult.shortfallDay.dayLabel}!
                </div>
              )}
            </div>
          </div>

          {/* Contextual Smart Prompt Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HelpCircle size={16} color="#EA580C" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1C1917' }}>
              {t('chat_suggested_title', 'Suggested Questions')}
            </h3>
          </div>

          <div className="suggested-pills-list">
            {smartSuggestions.map((q, idx) => (
              <button
                key={idx}
                className="suggested-pill"
                onClick={() => handleAsk(q)}
                disabled={isLoading}
                style={{ textAlign: 'left' }}
              >
                <ArrowRight size={13} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Active Commitments Mini-Card */}
          <div style={{
            marginTop: '18px',
            padding: '14px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #EFE8DF'
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {t('chat_looming_commitments', 'LOOMING COMMITMENTS TO CLEAR:')}
            </span>
            {commitments.length > 0 ? (
              <div style={{ fontSize: '0.78rem', color: '#292524' }}>
                {commitments.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>{c.title} (in {c.daysAway}d)</span>
                    <strong style={{ color: '#EA580C' }}>{formatINR(c.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.78rem', color: '#78716C' }}>
                {t('chat_no_commitments', 'No fixed commitments scheduled')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
