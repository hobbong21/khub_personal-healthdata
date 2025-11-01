import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

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
            <a href="/features" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              Features
            </a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
              About
            </a>
            <a href="/contact" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
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
            Get in <span style={{ color: '#2563eb' }}>Touch</span>
          </h1>
          <p style={{
            fontSize: '24px',
            lineHeight: '1.6',
            marginBottom: '40px',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto 40px'
          }}>
            Have questions about K-hub? We're here to help.<br />
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
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
            alignItems: 'start'
          }}>
            {/* Contact Form */}
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#111827',
                lineHeight: '1.2'
              }}>
                Send us a message
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="demo">Request Demo</option>
                    <option value="enterprise">Enterprise Solutions</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="press">Press & Media</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    alignSelf: 'flex-start'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#111827',
                lineHeight: '1.2'
              }}>
                Contact Information
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '40px',
                lineHeight: '1.6'
              }}>
                Prefer to reach out directly? Here are other ways to get in touch with us.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#2563eb',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px'
                  }}>
                    📧
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    Email Us
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Send us an email and we'll respond within 24 hours
                  </p>
                  <a href="mailto:hello@k-hub.com" style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    hello@k-hub.com
                  </a>
                </div>

                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#2563eb',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px'
                  }}>
                    📞
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    Call Us
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Speak directly with our team
                  </p>
                  <a href="tel:+1-555-123-4567" style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    +1 (555) 123-4567
                  </a>
                </div>

                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#2563eb',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px'
                  }}>
                    📍
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    Visit Us
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Come visit our headquarters
                  </p>
                  <p style={{
                    color: '#374151',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    123 Innovation Drive<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>

                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#2563eb',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px'
                  }}>
                    💬
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    Live Chat
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Chat with our support team in real-time
                  </p>
                  <p style={{
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Available Monday - Friday, 9 AM - 6 PM PST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Quick answers to common questions about K-hub
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                How secure is my health data?
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Your data is protected with military-grade AES-256 encryption, HIPAA compliance, 
                and zero-trust security architecture. We never share your personal health information 
                without your explicit consent.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                What devices are compatible?
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                K-hub integrates with most popular wearable devices including Apple Watch, 
                Fitbit, Garmin, and many others. We also support manual data entry through 
                our mobile and web applications.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
              Can I try K-hub for free?
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Yes! We offer a 30-day free trial with full access to all features. 
                No credit card required to get started. You can upgrade to a paid plan 
                anytime during or after your trial.
              </p>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Do you offer enterprise solutions?
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                Absolutely! We provide comprehensive enterprise solutions for healthcare 
                organizations and large companies. Contact our sales team to discuss 
                custom pricing and implementation.
              </p>
            </div>
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

export default ContactPage;