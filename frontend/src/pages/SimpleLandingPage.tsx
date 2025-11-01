import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const SimpleLandingPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#ffffff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000,
        height: '72px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              K
            </div>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              {t('common.khub')}
            </span>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#solutions" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              {t('common.solutions')}
            </a>
            <a href="#platform" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              {t('common.platform')}
            </a>
            <a href="#resources" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              {t('common.resources')}
            </a>
            <a href="#company" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              {t('common.company')}
            </a>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageToggle />
            <a href="/auth" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              {t('common.signin')}
            </a>
            <a 
              href="/auth" 
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '72px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          width: '100%'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f3f4f6',
              color: '#6b7280',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }}></div>
              {t('landing.hero.badge')}
            </div>
            
            <h1 style={{
              fontSize: '64px',
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '24px',
              color: '#111827',
              letterSpacing: '-0.025em'
            }}>
              {t('landing.hero.title')}<br />
              <span style={{ color: '#2563eb' }}>{t('landing.hero.highlight')}</span>
            </h1>
            
            <p style={{
              fontSize: '20px',
              lineHeight: '1.6',
              marginBottom: '40px',
              color: '#6b7280',
              fontWeight: '400'
            }}>
              {t('landing.hero.description').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < t('landing.hero.description').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
              <a 
                href="/auth" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '16px',
                  background: '#2563eb',
                  color: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {t('landing.hero.cta.primary')}
                <span>→</span>
              </a>
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                cursor: 'pointer'
              }}>
                <span>▶</span>
                {t('landing.hero.cta.secondary')}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '48px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  lineHeight: '1'
                }}>
                  50K+
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {t('landing.hero.stats.users')}
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  lineHeight: '1'
                }}>
                  99.9%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {t('landing.hero.stats.security')}
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  lineHeight: '1'
                }}>
                  24/7
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {t('landing.hero.stats.monitoring')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '600px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {t('dashboard.title')}
                </div>
              </div>
              <div style={{ padding: '24px', minHeight: '300px', background: '#ffffff' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
                      {t('dashboard.health.bloodpressure')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                      120/80
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
                      ↗ +2%
                    </div>
                  </div>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
                      {t('dashboard.health.heartrate')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                      72 bpm
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                      → Normal
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  height: '120px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    {t('dashboard.health.trends')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '60px' }}>
                    <div style={{ flex: 1, background: '#2563eb', height: '60%', borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ flex: 1, background: '#3b82f6', height: '80%', borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ flex: 1, background: '#60a5fa', height: '45%', borderRadius: '2px 2px 0 0' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" style={{
        padding: '120px 0',
        background: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '16px',
              border: '1px solid #dbeafe'
            }}>
              {t('common.solutions')}
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#111827',
              lineHeight: '1.2',
              letterSpacing: '-0.025em'
            }}>
              {t('landing.solutions.title').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < t('landing.solutions.title').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {t('landing.solutions.description').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < t('landing.solutions.description').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {/* Individual Solution */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '24px'
              }}>
                👤
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                {t('landing.solutions.individual.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                {t('landing.solutions.individual.description')}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.individual.feature1')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.individual.feature2')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.individual.feature3')}
                </li>
              </ul>
              <a href="/auth" style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {t('landing.solutions.individual.cta')} →
              </a>
            </div>

            {/* Healthcare Solution */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '24px'
              }}>
                🏥
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                {t('landing.solutions.healthcare.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                {t('landing.solutions.healthcare.description')}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.healthcare.feature1')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.healthcare.feature2')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.healthcare.feature3')}
                </li>
              </ul>
              <a href="#contact" style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {t('landing.solutions.healthcare.cta')} →
              </a>
            </div>

            {/* Enterprise Solution */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '24px'
              }}>
                🏢
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                {t('landing.solutions.enterprise.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                {t('landing.solutions.enterprise.description')}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.enterprise.feature1')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.enterprise.feature2')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓
                  </div>
                  {t('landing.solutions.enterprise.feature3')}
                </li>
              </ul>
              <a href="#contact" style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {t('landing.solutions.enterprise.cta')} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="platform" style={{
        padding: '120px 0',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '16px',
              border: '1px solid #dbeafe'
            }}>
              {t('common.platform')} {t('common.features')}
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#111827',
              lineHeight: '1.2',
              letterSpacing: '-0.025em'
            }}>
              {t('landing.features.title').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < t('landing.features.title').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>🤖</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.ai.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.ai.description')}
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>🧬</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.genomic.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.genomic.description')}
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>📱</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.wearable.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.wearable.description')}
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>🏥</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.records.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.records.description')}
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>💊</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.medication.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.medication.description')}
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>🔒</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                {t('landing.features.security.title')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                {t('landing.features.security.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '120px 0',
        background: '#111827',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            {t('landing.cta.title').split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('landing.cta.title').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '40px',
            color: '#d1d5db'
          }}>
            {t('landing.cta.description')}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <a href="/auth" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '18px 36px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '18px',
              background: '#2563eb',
              color: 'white'
            }}>
              {t('landing.cta.primary')}
              <span>→</span>
            </a>
            <a href="#contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '18px 36px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '18px',
              background: 'transparent',
              color: 'white',
              border: '1px solid #374151'
            }}>
              {t('landing.cta.secondary')}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#111827',
        color: '#d1d5db',
        padding: '80px 0 32px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '48px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#2563eb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  K
                </div>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                  K-hub
                </span>
              </div>
              <p style={{
                color: '#9ca3af',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                The new standard for AI-powered personalized health management
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#ffffff'
              }}>
                {t('footer.product')}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#features" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.features')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#pricing" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.pricing')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#security" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.security')}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#ffffff'
              }}>
                {t('footer.support')}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#help" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.help')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#contact" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.contact')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#api" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.api')}
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#ffffff'
              }}>
                {t('footer.company')}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#about" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.about')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#privacy" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.privacy')}
                  </a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="#terms" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}>
                    {t('footer.terms')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLandingPage;