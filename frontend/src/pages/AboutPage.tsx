import React from 'react';

const AboutPage: React.FC = () => {
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
            <a href="/#platform" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              Platform
            </a>
            <a href="/about" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
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
            About <span style={{ color: '#2563eb' }}>K-hub</span>
          </h1>
          <p style={{
            fontSize: '24px',
            lineHeight: '1.6',
            marginBottom: '40px',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto 40px'
          }}>
            We're revolutionizing healthcare through AI-powered personalized health management,<br />
            making quality healthcare accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
        padding: '80px 0',
        background: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '40px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#111827',
                lineHeight: '1.2'
              }}>
                Our Mission
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#6b7280',
                marginBottom: '32px'
              }}>
                At K-hub, we believe that everyone deserves access to personalized, intelligent healthcare. 
                Our mission is to democratize health management through cutting-edge AI technology, 
                making it easier for individuals, healthcare providers, and organizations to make 
                informed decisions about health and wellness.
              </p>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#6b7280'
              }}>
                We're building the future of healthcare—one where data-driven insights, 
                predictive analytics, and personalized recommendations work together to 
                create better health outcomes for everyone.
              </p>
            </div>
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px'
              }}>
                🎯
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Vision 2030
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                To become the world's leading AI-powered health platform, 
                serving 100 million users globally and preventing 1 million 
                health complications through early detection and intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
              Our Values
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              The principles that guide everything we do at K-hub
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 24px'
              }}>
                🔒
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Privacy First
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                Your health data is sacred. We employ military-grade encryption and 
                HIPAA-compliant infrastructure to ensure your information remains private and secure.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 24px'
              }}>
                🤝
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Accessibility
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                Quality healthcare should be available to everyone, regardless of location, 
                income, or technical expertise. We design for inclusivity and ease of use.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 24px'
              }}>
                🚀
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                Innovation
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                We continuously push the boundaries of what's possible in healthcare technology, 
                leveraging the latest advances in AI, machine learning, and data science.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our Team
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              World-class experts in healthcare, AI, and technology working together to transform healthcare
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                margin: '0 auto 24px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                JK
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Dr. Jane Kim
              </h3>
              <p style={{
                color: '#2563eb',
                fontWeight: '500',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                CEO & Co-Founder
              </p>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Former Chief Medical Officer at Stanford Health. 15+ years in digital health innovation 
                and AI-powered diagnostics.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                margin: '0 auto 24px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                ML
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Michael Lee
              </h3>
              <p style={{
                color: '#2563eb',
                fontWeight: '500',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                CTO & Co-Founder
              </p>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Former Principal Engineer at Google Health. Expert in machine learning, 
                data infrastructure, and healthcare systems.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                margin: '0 auto 24px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                SP
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Dr. Sarah Park
              </h3>
              <p style={{
                color: '#2563eb',
                fontWeight: '500',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                Chief Medical Officer
              </p>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Board-certified physician and researcher specializing in preventive medicine 
                and population health management.
              </p>
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
            Ready to transform your health?
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '32px',
            color: '#d1d5db'
          }}>
            Join thousands of users who are already experiencing the future of healthcare.
          </p>
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
            Get started today
            <span>→</span>
          </a>
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

export default AboutPage;