import React from 'react';

const FeaturesPage: React.FC = () => {
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
            <a href="/" style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', textDecoration: 'none' }}>
              K-hub
            </a>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="/#solutions" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              Solutions
            </a>
            <a href="/features" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
              Features
            </a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              About
            </a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              Contact
            </a>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/auth" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
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
        paddingTop: '120px',
        paddingBottom: '80px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '24px',
            color: '#111827',
            letterSpacing: '-0.025em'
          }}>
            Powerful <span style={{ color: '#2563eb' }}>Features</span>
          </h1>
          <p style={{
            fontSize: '24px',
            lineHeight: '1.6',
            marginBottom: '40px',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto 40px'
          }}>
            Discover the comprehensive suite of AI-powered tools and features<br />
            that make K-hub the most advanced health management platform.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section style={{
        padding: '80px 0',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#111827',
              lineHeight: '1.2'
            }}>
              Core Features
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need for comprehensive health management in one integrated platform
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {/* AI Health Analysis */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '24px'
              }}>
                🤖
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                AI Health Analysis
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                Advanced machine learning algorithms analyze your health data to provide personalized insights, 
                risk assessments, and predictive health recommendations.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Predictive health modeling
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Risk factor identification
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Personalized recommendations
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Early warning alerts
                </li>
              </ul>
            </div>

            {/* Real-time Monitoring */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '24px'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Real-time Monitoring
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                Continuous health monitoring through wearable devices and manual inputs, 
                providing instant feedback and trend analysis for all your vital signs.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Heart rate & blood pressure
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Sleep quality tracking
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Activity & exercise monitoring
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Nutrition & hydration tracking
                </li>
              </ul>
            </div>

            {/* Smart Medication Management */}
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '24px'
              }}>
                💊
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Smart Medication Management
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '16px'
              }}>
                Intelligent medication tracking with drug interaction warnings, 
                dosage reminders, and adherence monitoring to ensure safe and effective treatment.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Automated reminders
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Drug interaction alerts
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
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Adherence tracking
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#2563eb',
                    borderRadius: '50%'
                  }}></div>
                  Refill notifications
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section style={{
        padding: '80px 0',
        background: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#111827',
              lineHeight: '1.2'
            }}>
              Advanced Capabilities
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Cutting-edge features that set K-hub apart from traditional health platforms
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
            marginBottom: '80px'
          }}>
            <div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                Genomic Analysis & Personalization
              </h3>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#6b7280',
                marginBottom: '32px'
              }}>
                Leverage your genetic information to receive truly personalized health recommendations. 
                Our genomic analysis identifies genetic predispositions, optimal medication responses, 
                and lifestyle factors tailored to your unique DNA profile.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '16px',
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
                  Disease risk assessment based on genetic markers
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '16px',
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
                  Pharmacogenomic drug response predictions
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
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
                  Personalized nutrition and fitness recommendations
                </li>
              </ul>
            </div>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '80px',
                marginBottom: '24px'
              }}>
                🧬
              </div>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Genetic Insights
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Unlock the power of your genetic code with comprehensive genomic analysis 
                and personalized health recommendations.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '80px',
                marginBottom: '24px'
              }}>
                🔒
              </div>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Enterprise Security
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Military-grade encryption, HIPAA compliance, and zero-trust architecture 
                ensure your health data remains completely secure.
              </p>
            </div>
            <div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                Medical-Grade Security & Privacy
              </h3>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#6b7280',
                marginBottom: '32px'
              }}>
                Your health data deserves the highest level of protection. K-hub employs 
                enterprise-grade security measures, including end-to-end encryption, 
                HIPAA compliance, and strict access controls.
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '16px',
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
                  AES-256 encryption for data at rest and in transit
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '16px',
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
                  HIPAA and GDPR compliance
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
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
                  Zero-trust security architecture
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
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
            fontSize: '40px',
            fontWeight: '700',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Experience the future of healthcare
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '32px',
            color: '#d1d5db'
          }}>
            Start your journey with K-hub today and discover what personalized health management can do for you.
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
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '16px',
              background: '#2563eb',
              color: 'white'
            }}>
              Start free trial
              <span>→</span>
            </a>
            <a href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '16px',
              background: 'transparent',
              color: 'white',
              border: '1px solid #374151'
            }}>
              Schedule demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#111827',
        color: '#d1d5db',
        padding: '48px 0 32px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <p>&copy; 2024 K-hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;