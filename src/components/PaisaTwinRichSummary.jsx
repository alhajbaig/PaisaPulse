import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  MessageSquare, 
  Sliders, 
  ShieldAlert, 
  Calendar,
  Flame,
  Wallet,
  TrendingDown,
  Info
} from 'lucide-react';
import { formatINR } from '../engine/cashflowEngine.js';
import { soundFX } from '../engine/audioEffects.js';
import { useLanguage, getActiveLanguage } from '../services/i18n.jsx';

/**
 * Parses raw text into rich tokens (negative amounts, modes, money, dates, bold, italic)
 */
function renderRichTokens(text) {
  if (!text) return null;

  // Master regex pattern matching special tokens
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|-₹\s*[\d,]+(?:\.\d+)?|\+₹\s*[\d,]+(?:\.\d+)?|₹\s*[\d,]+(?:\/day)?|\b(?:PANIC|TIGHT|WATCH|CHILL)\s+MODE\b|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?)/gi;

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Handle **Bold** wrappers that might contain special sub-tokens
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2).trim();

      if (inner.includes('-₹')) {
        return (
          <span key={index} className="pt-pill-negative">
            <TrendingDown size={13} style={{ display: 'inline', marginRight: '3px' }} />
            {inner}
          </span>
        );
      }
      if (/PANIC\s+MODE/i.test(inner)) {
        return <span key={index} className="pt-pill-mode pt-mode-panic">🚨 Panic Mode</span>;
      }
      if (/TIGHT\s+MODE/i.test(inner)) {
        return <span key={index} className="pt-pill-mode pt-mode-tight">🟠 Tight Mode</span>;
      }
      if (/WATCH\s+MODE/i.test(inner)) {
        return <span key={index} className="pt-pill-mode pt-mode-watch">🟡 Watch Mode</span>;
      }
      if (/CHILL\s+MODE/i.test(inner)) {
        return <span key={index} className="pt-pill-mode pt-mode-chill">🟢 Chill Mode</span>;
      }
      if (inner.startsWith('₹') || inner.startsWith('+₹')) {
        return <span key={index} className="pt-pill-money">{inner}</span>;
      }

      return <strong key={index} style={{ fontWeight: 800, color: '#1C1917' }}>{renderRichTokens(inner)}</strong>;
    }

    // Handle *Italics*
    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1);
      return <em key={index} style={{ fontStyle: 'italic', color: '#44403C' }}>{inner}</em>;
    }

    // Negative currency: -₹5,348
    if (part.startsWith('-₹')) {
      return (
        <span key={index} className="pt-pill-negative">
          <TrendingDown size={13} style={{ display: 'inline', marginRight: '3px' }} />
          {part}
        </span>
      );
    }

    // Positive currency: +₹50,000
    if (part.startsWith('+₹')) {
      return (
        <span key={index} className="pt-pill-positive">
          {part}
        </span>
      );
    }

    // General currency: ₹1,500, ₹420/day
    if (part.startsWith('₹')) {
      return (
        <span key={index} className="pt-pill-money">
          {part}
        </span>
      );
    }

    // Modes without asterisks
    if (/^PANIC\s+MODE$/i.test(part)) {
      return <span key={index} className="pt-pill-mode pt-mode-panic">🚨 Panic Mode</span>;
    }
    if (/^TIGHT\s+MODE$/i.test(part)) {
      return <span key={index} className="pt-pill-mode pt-mode-tight">🟠 Tight Mode</span>;
    }
    if (/^WATCH\s+MODE$/i.test(part)) {
      return <span key={index} className="pt-pill-mode pt-mode-watch">🟡 Watch Mode</span>;
    }
    if (/^CHILL\s+MODE$/i.test(part)) {
      return <span key={index} className="pt-pill-mode pt-mode-chill">🟢 Chill Mode</span>;
    }

    // Dates
    if (/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(part)) {
      return (
        <span key={index} className="pt-pill-date">
          <Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />
          {part}
        </span>
      );
    }

    return part;
  });
}

/**
 * Splits text into Diagnosis section and Recommended Solutions
 */
function parseTwinContent(text, twinModel, language = getActiveLanguage()) {
  if (!text) return { diagnosisParagraphs: [], solutions: [] };

  const isHinglish = language === 'hinglish';

  // Split on solutions header line
  const splitRegex = /(?:^|\n)(?:###|\*\*|##)?\s*(?:💡\s*)?(?:RECOMMENDED SOLUTIONS|Recommended Solutions|Actionable Solutions|Solutions|Action Plan|Zaroori Solutions).*?(?:\*\*|\n|$)/i;
  const match = text.match(splitRegex);

  let rawDiagnosis = text;
  let rawSolutions = '';

  if (match && match.index !== undefined) {
    rawDiagnosis = text.substring(0, match.index).trim();
    rawSolutions = text.substring(match.index + match[0].length).trim();
  }

  // Clean diagnosis
  rawDiagnosis = rawDiagnosis.replace(/^(?:\*\*DIAGNOSIS\*\*|###\s*Diagnosis|##\s*Diagnosis)\s*/i, '').trim();
  const diagnosisParagraphs = rawDiagnosis.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  // Extract solutions
  let solutions = [];
  if (rawSolutions) {
    const rawItems = rawSolutions.split(/\n\s*(?=(?:\d+\.|\*|-|•)\s+)/);
    for (const item of rawItems) {
      const clean = item.trim().replace(/^[\d+.*•\-]+\s*/, '');
      if (clean && clean.length > 5) {
        solutions.push(clean);
      }
    }
  }

  // If no solutions were extracted (e.g. from an older summary or truncated response), provide deterministic tailored solutions!
  if (solutions.length === 0 && twinModel) {
    const {
      currentCash = 1500,
      confirmedIncome = 50000,
      mandatoryCommitments = 5500,
      safetyBuffer = 3000,
      averageDailyBurn = 420,
      safeDailySpend = 0,
      minimumProjectedBalance = -5348,
      minimumProjectedDate = 'September 29',
      minimumProjectedReason = 'PG Rent due before salary credit'
    } = twinModel;

    if (minimumProjectedBalance < 0) {
      const deficit = Math.abs(minimumProjectedBalance);
      if (isHinglish) {
        solutions = [
          `**Landlord Se Rent Stagger / Delay Ki Baat Karo**: Apne landlord ya PG owner ko inform karein ki stipend **${minimumProjectedDate}** ke baad credit hoga. Unse request karein ki **${formatINR(deficit)}** ka balance stipend aane par clear karne dein. Good faith ke liye abhi **${formatINR(Math.min(currentCash, 2000))}** partial pay kar dein.`,
          `**Zero-Spend Freeze (Roz Ka Kharcha ₹0)**: Agle 3-4 dino ke liye bahar ka khana (Swiggy/Zomato) aur travel kharche bilkul rok dein. Roz ka **${formatINR(averageDailyBurn)}** bachaane se aapka **${formatINR(currentCash)}** cash safe rahega.`,
          `**Emergency Buffer Ka Tactical Use**: Aapke paas **${formatINR(safetyBuffer)}** ka emergency buffer rakha hua hai. Auto-debit bounce aur penalty se bachne ke liye temporarily **${formatINR(Math.min(deficit, safetyBuffer))}** use karein, aur stipend aate hi sabse pehle buffer wapas bharein.`
        ];
      } else {
        solutions = [
          `**Stagger or Defer PG Rent to Match Stipend Date**: Contact your PG owner or landlord immediately. Explain that your salary/stipend lands shortly and request to defer **${formatINR(deficit)}** until your confirmed **${formatINR(confirmedIncome)}** income arrives on your credit date. Offer a partial payment of **${formatINR(Math.min(currentCash, 2000))}** now to show good faith.`,
          `**Zero-Discretionary Spend Freeze**: Effective immediately, reduce your daily discretionary burn from **${formatINR(averageDailyBurn)}/day** to **₹0**. Pausing Swiggy, outside coffee, and leisure purchases preserves your **${formatINR(currentCash)}** liquid cash and softens the dip.`,
          `**Temporary Safety Cushion Utilization**: You have **${formatINR(safetyBuffer)}** designated as your emergency cushion. Use up to **${formatINR(Math.min(deficit, safetyBuffer))}** strictly to prevent auto-debit bounce fees, and replenish it the very hour your **${formatINR(confirmedIncome)}** credit clears.`
        ];
      }
    } else if (minimumProjectedBalance < safetyBuffer) {
      if (isHinglish) {
        solutions = [
          `**Safe Limit Ke Andar Kharcha Rakhein**: Discretionary kharcha strictly **${formatINR(safeDailySpend)}/day** ke andar hi rakhein taaki buffer safe rahe.`,
          `**Auto-Debits Audit Karein**: Sabhi scheduled bills (**${formatINR(mandatoryCommitments)}**) ki exact dates check karein taaki achanak deduct na ho.`,
          `**Pending Dues Claim Karein**: Dosto ya room partner se pending Splitwise paise turant request karein.`
        ];
      } else {
        solutions = [
          `**Cap Discretionary Spending at Safe Limit**: Strictly adhere to your **${formatINR(safeDailySpend)}/day** safe-to-spend limit to prevent dipping into your **${formatINR(safetyBuffer)}** buffer before **${minimumProjectedDate}**.`,
          `**Review Fixed Commitments Schedule**: Verify dates for scheduled commitments totaling **${formatINR(mandatoryCommitments)}** to make sure they do not cluster on the same date.`,
          `**Accelerate Outstanding Inflows**: If you have pending reimbursements or freelance dues, request an early settlement to boost your liquidity buffer.`
        ];
      }
    } else {
      if (isHinglish) {
        solutions = [
          `**Safe Spend Discipline Banaye Rakhein**: Rozana kharcha **${formatINR(safeDailySpend)}/day** ke andar hi chalate rahein.`,
          `**Surplus Cash Ko Auto-Save Karein**: **${formatINR(safetyBuffer)}** buffer ke upar bacha surplus kisi high-interest digital vault mein transfer karein.`,
          `**Agla Mahina Pre-Fund Karein**: Aane wale **${formatINR(confirmedIncome)}** mein se agle rent ka hissa pehle hi alag account mein rakh lein.`
        ];
      } else {
        solutions = [
          `**Maintain Safe Spend Discipline**: Keep variable spending under **${formatINR(safeDailySpend)}/day** to allow your surplus to grow naturally.`,
          `**Automate Surplus Reserve**: Sweep any cash balance beyond your **${formatINR(safetyBuffer)}** protected cushion into a high-yield liquid fund or digital vault.`,
          `**Pre-fund Next Month's Commitments**: Allocate a portion of your **${formatINR(confirmedIncome)}** incoming funds early into a dedicated account for rent.`
        ];
      }
    }
  }

  return { diagnosisParagraphs, solutions };
}

export default function PaisaTwinRichSummary({
  summaryText,
  twinModel,
  onNavigateToScenarios,
  onNavigateToGuardianChat
}) {
  const { t, language } = useLanguage();
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!summaryText) return null;

  const { diagnosisParagraphs, solutions } = parseTwinContent(summaryText, twinModel, language);

  const handleCopyLandlordScript = (index, customScript) => {
    soundFX.playClick();
    const defaultScript = language === 'hinglish'
      ? `Namaste, Mera stipend/salary credit kuch hi dino mein aane wala hai. Kya main abhi rent ka kuch hissa dekar baaki balance stipend aane par clear kar du? Samajhne ke liye bohot dhanyawad!`
      : `Namaste, My stipend/salary credit is scheduled to land in a few days. Could I pay part of the rent today and clear the remaining balance once my credit clears? Thank you for understanding!`;
    const script = customScript || defaultScript;
    navigator.clipboard.writeText(script);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="pt-rich-summary-container" style={{
      background: '#FFFFFF',
      border: '1px solid #EFE8DF',
      borderRadius: '16px',
      padding: '22px 24px',
      marginTop: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* 1. At A Glance Indicator Bar */}
      {twinModel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '16px',
          marginBottom: '18px',
          borderBottom: '1px solid #F5EFE6'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Reality Signals:
          </div>

          <span className={`pt-pill-mode ${
            twinModel.healthMode?.label === 'PANIC MODE' ? 'pt-mode-panic' :
            twinModel.healthMode?.label === 'TIGHT MODE' ? 'pt-mode-tight' :
            twinModel.healthMode?.label === 'WATCH MODE' ? 'pt-mode-watch' : 'pt-mode-chill'
          }`}>
            <span>{twinModel.healthMode?.emoji || '⚡'}</span>
            <span>{twinModel.healthMode?.label || 'WATCH MODE'}</span>
          </span>

          <span className="pt-pill-money">
            <Wallet size={13} style={{ display: 'inline', marginRight: '3px' }} />
            Cash: {formatINR(twinModel.currentCash)}
          </span>

          <span className="pt-pill-money">
            <Flame size={13} color="#DC2626" style={{ display: 'inline', marginRight: '3px' }} />
            Burn: {formatINR(twinModel.averageDailyBurn)}/day
          </span>

          {twinModel.minimumProjectedBalance < 0 ? (
            <span className="pt-pill-negative">
              <TrendingDown size={13} style={{ display: 'inline', marginRight: '3px' }} />
              Projected Deficit: {formatINR(twinModel.minimumProjectedBalance)} on {twinModel.minimumProjectedDate}
            </span>
          ) : (
            <span className="pt-pill-positive">
              Safe Daily Spend: {formatINR(twinModel.safeDailySpend)}/day
            </span>
          )}
        </div>
      )}

      {/* 2. Diagnosis & Financial Reality Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#EA580C',
            background: '#FFF7ED',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid #FFEDD5',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Sparkles size={13} />
            <span>{language === 'hinglish' ? 'Financial Reality Diagnosis (देसी हिसाब)' : 'Financial Reality Diagnosis'}</span>
          </span>
        </div>

        <div className="pt-diagnosis-box" style={{
          fontSize: '0.94rem',
          lineHeight: '1.75',
          color: '#292524',
          fontFamily: 'var(--font-sans)'
        }}>
          {diagnosisParagraphs.map((para, i) => (
            <p key={i} style={{ 
              marginBottom: i === diagnosisParagraphs.length - 1 ? 0 : '14px',
              color: '#332F2B',
              letterSpacing: '-0.005em'
            }}>
              {renderRichTokens(para)}
            </p>
          ))}
        </div>
      </div>

      {/* 3. Recommended Solutions & Action Plan Section */}
      {solutions.length > 0 && (
        <div style={{
          background: 'linear-gradient(180deg, #FAF8F4 0%, #F5EFE6 100%)',
          border: '1px solid #E5DCCE',
          borderRadius: '14px',
          padding: '20px',
          marginTop: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#EA580C',
                color: '#FFFFFF',
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}>
                💡
              </span>
              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#1C1917' }}>
                {t('solutions_header', 'Recommended Solutions & Action Plan')}
              </h4>
            </div>

            <span style={{ fontSize: '0.76rem', color: '#78716C', fontWeight: 600 }}>
              {t('solutions_header_sub', 'Tailored to your exact Indian bank commitments')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {solutions.map((sol, index) => {
              // Extract title if formatted as **Title**: Description or **Title** Description
              let title = language === 'hinglish' ? `Action Step ${index + 1}` : `Action Step ${index + 1}`;
              let body = sol;

              const titleMatch = sol.match(/^\*\*(.*?)\*\*(?::)?\s*(.*)$/s);
              if (titleMatch) {
                title = titleMatch[1].trim();
                body = titleMatch[2].trim();
              }

              const isRentStep = /rent|landlord|pg/i.test(title + body);

              const badgeLabel = language === 'hinglish'
                ? (index === 0 ? 'Top Priority' : (index === 1 ? 'Turant Action' : 'Reserve Strategy'))
                : (index === 0 ? 'High Priority' : (index === 1 ? 'Immediate Action' : 'Reserve Strategy'));

              return (
                <div 
                  key={index}
                  className="pt-solution-card"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EFE8DF',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: index === 0 ? '#EA580C' : (index === 1 ? '#059669' : '#4F46E5'),
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <h5 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#1C1917' }}>
                          {title}
                        </h5>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: index === 0 ? '#FEEEDD' : (index === 1 ? '#ECFDF5' : '#EEF2FF'),
                          color: index === 0 ? '#C2410C' : (index === 1 ? '#059669' : '#4338CA')
                        }}>
                          {badgeLabel}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#44403C', lineHeight: '1.65', marginBottom: '10px' }}>
                        {renderRichTokens(body)}
                      </div>

                      {/* Interactive Action Shortcuts */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {isRentStep && (
                          <button
                            onClick={() => handleCopyLandlordScript(index)}
                            className="btn-secondary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={13} color="#059669" />
                                <span style={{ color: '#059669', fontWeight: 700 }}>
                                  {t('script_copied', 'WhatsApp Message Copied!')}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>{t('copy_script_btn', 'Copy WhatsApp Script for Landlord')}</span>
                              </>
                            )}
                          </button>
                        )}

                        {onNavigateToScenarios && (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onNavigateToScenarios();
                            }}
                            className="btn-secondary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Sliders size={13} />
                            <span>{t('simulate_scenario_btn', 'Simulate in What-If Scenarios')}</span>
                          </button>
                        )}

                        {onNavigateToGuardianChat && (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onNavigateToGuardianChat();
                            }}
                            className="btn-secondary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>{t('ask_guardian_btn', 'Ask Guardian AI')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
