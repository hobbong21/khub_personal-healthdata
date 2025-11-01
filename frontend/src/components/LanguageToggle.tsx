import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  variant?: 'header' | 'footer';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'header' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  if (variant === 'footer') {
    return (
      <button
        onClick={toggleLanguage}
        style={{
          background: 'transparent',
          border: '1px solid #374151',
          color: '#9ca3af',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#6b7280';
          e.currentTarget.style.color = '#d1d5db';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#374151';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        <span style={{ fontSize: '14px' }}>🌐</span>
        {language === 'ko' ? 'EN' : '한국어'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      style={{
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        color: '#374151',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#e5e7eb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#f3f4f6';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <span style={{ fontSize: '16px' }}>🌐</span>
      {language === 'ko' ? 'EN' : '한국어'}
    </button>
  );
};

export default LanguageToggle;