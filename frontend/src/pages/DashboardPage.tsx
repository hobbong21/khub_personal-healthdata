import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

interface User {
  email: string;
  name: string;
}

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState({
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    weight: 70,
    steps: 8500,
    sleep: 7.5
  });

  const handleHealthDataUpdate = (field: string, value: any) => {
    setHealthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
            {t('dashboard.title')}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageToggle />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              {user.name}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            {t('common.signout')}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '280px',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          minHeight: 'calc(100vh - 72px)',
          padding: '24px 0'
        }}>
          <nav>
            {[
              { id: 'overview', labelKey: 'dashboard.menu.overview', icon: '📊' },
              { id: 'health-data', labelKey: 'dashboard.menu.healthdata', icon: '💓' },
              { id: 'medications', labelKey: 'dashboard.menu.medications', icon: '💊' },
              { id: 'appointments', labelKey: 'dashboard.menu.appointments', icon: '📅' },
              { id: 'reports', labelKey: 'dashboard.menu.reports', icon: '📋' },
              { id: 'settings', labelKey: 'dashboard.menu.settings', icon: '⚙️' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  background: activeTab === item.id ? '#eff6ff' : 'transparent',
                  color: activeTab === item.id ? '#2563eb' : '#6b7280',
                  border: 'none',
                  borderRight: activeTab === item.id ? '2px solid #2563eb' : '2px solid transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {t(item.labelKey)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          maxWidth: 'calc(100vw - 280px)'
        }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {t('dashboard.welcome', { name: user.name })}
                </h1>
                <p style={{
                  color: '#6b7280',
                  fontSize: '16px'
                }}>
                  {t('dashboard.subtitle')}
                </p>
              </div>

              {/* Health Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {t('dashboard.health.bloodpressure')}
                    </h3>
                    <span style={{ fontSize: '20px' }}>🩺</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    ↗ {t('dashboard.health.normal')}
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {t('dashboard.health.heartrate')}
                    </h3>
                    <span style={{ fontSize: '20px' }}>💓</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {healthData.heartRate} bpm
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    → {t('dashboard.health.resting')}
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {t('dashboard.health.steps')}
                    </h3>
                    <span style={{ fontSize: '20px' }}>👟</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {healthData.steps.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#f59e0b',
                    fontWeight: '500'
                  }}>
                    85% {t('dashboard.health.goal')} (10,000)
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {t('dashboard.health.sleep')}
                    </h3>
                    <span style={{ fontSize: '20px' }}>😴</span>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {healthData.sleep}h
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    ↗ {t('dashboard.health.quality')}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '20px'
                }}>
                  {t('dashboard.quickactions.title')}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => setActiveTab('health-data')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {t('dashboard.quickactions.logdata')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {t('dashboard.quickactions.logdata.desc')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('medications')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>💊</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {t('dashboard.quickactions.medications')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {t('dashboard.quickactions.medications.desc')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('appointments')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📅</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {t('dashboard.quickactions.appointments')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {t('dashboard.quickactions.appointments.desc')}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health-data' && (
            <HealthDataTab 
              healthData={healthData} 
              onUpdate={handleHealthDataUpdate} 
            />
          )}

          {activeTab === 'medications' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Medications
              </h2>
              <div style={{
                background: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Medication Management
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Track your medications, set reminders, and monitor adherence.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Appointments
              </h2>
              <div style={{
                background: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Appointment Scheduling
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Schedule and manage your healthcare appointments.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Health Reports
              </h2>
              <div style={{
                background: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Health Analytics
                </h3>
                <p style={{ color: '#6b7280' }}>
                  View detailed reports and trends of your health data.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Settings
              </h2>
              <div style={{
                background: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Account Settings
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Manage your profile, privacy settings, and preferences.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Health Data Input Component
const HealthDataTab: React.FC<{
  healthData: any;
  onUpdate: (field: string, value: any) => void;
}> = ({ healthData, onUpdate }) => {
  const [formData, setFormData] = useState({
    systolic: healthData.bloodPressure.systolic,
    diastolic: healthData.bloodPressure.diastolic,
    heartRate: healthData.heartRate,
    weight: healthData.weight,
    steps: healthData.steps,
    sleep: healthData.sleep
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('bloodPressure', { systolic: formData.systolic, diastolic: formData.diastolic });
    onUpdate('heartRate', formData.heartRate);
    onUpdate('weight', formData.weight);
    onUpdate('steps', formData.steps);
    onUpdate('sleep', formData.sleep);
    alert(t('healthdata.success'));
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
        {t('healthdata.title')}
      </h2>
      
      <div style={{
        background: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Blood Pressure */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                🩺 {t('healthdata.bloodpressure.label')}
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    {t('healthdata.bloodpressure.systolic')}
                  </label>
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => handleInputChange('systolic', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    {t('healthdata.bloodpressure.diastolic')}
                  </label>
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => handleInputChange('diastolic', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                💓 {t('healthdata.heartrate.label')}
              </label>
              <input
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Weight */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                ⚖️ {t('healthdata.weight.label')}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Steps */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                👟 {t('healthdata.steps.label')}
              </label>
              <input
                type="number"
                value={formData.steps}
                onChange={(e) => handleInputChange('steps', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Sleep */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                😴 {t('healthdata.sleep.label')}
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.sleep}
                onChange={(e) => handleInputChange('sleep', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            {t('healthdata.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;