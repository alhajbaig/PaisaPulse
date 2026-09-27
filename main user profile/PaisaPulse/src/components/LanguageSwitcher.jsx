import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../services/i18n.jsx';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className="language-switcher-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#FAF8F4',
        border: '1px solid #E5DCCE',
        borderRadius: '999px',
        padding: '3px 4px',
        gap: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}
      title="Switch Language: English / Hinglish"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
        color: '#EA580C'
      }}>
        <Globe size={14} />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          background: language === 'en' ? '#FFFFFF' : 'transparent',
          color: language === 'en' ? '#EA580C' : '#78716C',
          fontWeight: language === 'en' ? 800 : 600,
          border: language === 'en' ? '1px solid #FDBA74' : '1px solid transparent',
          borderRadius: '999px',
          padding: compact ? '2px 8px' : '4px 10px',
          fontSize: compact ? '0.74rem' : '0.78rem',
          cursor: 'pointer',
          boxShadow: language === 'en' ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'none',
          transition: 'all 0.18s ease'
        }}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hinglish')}
        style={{
          background: language === 'hinglish' ? '#FFFFFF' : 'transparent',
          color: language === 'hinglish' ? '#EA580C' : '#78716C',
          fontWeight: language === 'hinglish' ? 800 : 600,
          border: language === 'hinglish' ? '1px solid #FDBA74' : '1px solid transparent',
          borderRadius: '999px',
          padding: compact ? '2px 8px' : '4px 10px',
          fontSize: compact ? '0.74rem' : '0.78rem',
          cursor: 'pointer',
          boxShadow: language === 'hinglish' ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'none',
          transition: 'all 0.18s ease'
        }}
      >
        Hinglish (देसी)
      </button>
    </div>
  );
}
