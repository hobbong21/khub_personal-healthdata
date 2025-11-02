import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { Component } from 'lucide-react';

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
            <MedicationsTab />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab />
          )}

          {activeTab === 'reports' && (
            <ReportsTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab user={user} />
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
  const { t } = useLanguage();
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

// Medications Tab Component
const MedicationsTab: React.FC = () => {
  const { t } = useLanguage();
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: '아스피린',
      dosage: '100mg',
      frequency: '1일 1회',
      time: '08:00',
      taken: true,
      nextDose: '내일 08:00'
    },
    {
      id: 2,
      name: '메트포르민',
      dosage: '500mg',
      frequency: '1일 2회',
      time: '08:00, 20:00',
      taken: false,
      nextDose: '오늘 20:00'
    }
  ]);

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: ''
  });

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    const medication = {
      id: Date.now(),
      ...newMedication,
      taken: false,
      nextDose: `오늘 ${newMedication.time}`
    };
    setMedications([...medications, medication]);
    setNewMedication({ name: '', dosage: '', frequency: '', time: '' });
  };

  const toggleMedication = (id: number) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
          {t('dashboard.menu.medications')}
        </h2>
        <div style={{
          background: '#eff6ff',
          color: '#2563eb',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {medications.filter(m => m.taken).length}/{medications.length} 복용 완료
        </div>
      </div>

      {/* Today's Medications */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          오늘의 복약 일정
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {medications.map((med) => (
            <div key={med.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: med.taken ? '#f0fdf4' : '#fef3c7',
              border: `1px solid ${med.taken ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: med.taken ? '#10b981' : '#f59e0b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  💊
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                    {med.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>
                    {med.dosage} • {med.frequency}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    다음 복용: {med.nextDose}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleMedication(med.id)}
                style={{
                  background: med.taken ? '#10b981' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {med.taken ? '복용 완료' : '복용하기'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Medication */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          새 약물 추가
        </h3>
        <form onSubmit={handleAddMedication}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                약물명
              </label>
              <input
                type="text"
                value={newMedication.name}
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="예: 아스피린"
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                용량
              </label>
              <input
                type="text"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="예: 100mg"
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                복용 빈도
              </label>
              <select
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">선택하세요</option>
                <option value="1일 1회">1일 1회</option>
                <option value="1일 2회">1일 2회</option>
                <option value="1일 3회">1일 3회</option>
                <option value="필요시">필요시</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                복용 시간
              </label>
              <input
                type="time"
                value={newMedication.time}
                onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
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
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            약물 추가
          </button>
        </form>
      </div>
    </div>
  );
};
// Appointments Tab Component
const AppointmentsTab: React.FC = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: '김내과 의사',
      specialty: '내과',
      date: '2024-11-15',
      time: '14:00',
      status: 'confirmed',
      location: '서울대병원 내과 3층'
    },
    {
      id: 2,
      doctor: '이심장 의사',
      specialty: '심장내과',
      date: '2024-11-20',
      time: '10:30',
      status: 'pending',
      location: '삼성서울병원 심장센터'
    }
  ]);

  const [newAppointment, setNewAppointment] = useState({
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    location: ''
  });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const appointment = {
      id: Date.now(),
      ...newAppointment,
      status: 'pending'
    };
    setAppointments([...appointments, appointment]);
    setNewAppointment({ doctor: '', specialty: '', date: '', time: '', location: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' };
      case 'pending': return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
      case 'cancelled': return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' };
      default: return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '확정';
      case 'pending': return '대기중';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
          {t('dashboard.menu.appointments')}
        </h2>
        <div style={{
          background: '#eff6ff',
          color: '#2563eb',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {appointments.filter(a => a.status === 'confirmed').length}개 예약 확정
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          예정된 진료
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appointments.map((appointment) => {
            const statusStyle = getStatusColor(appointment.status);
            return (
              <div key={appointment.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#2563eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    👨‍⚕️
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                      {appointment.doctor}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                      {appointment.specialty} • {appointment.date} {appointment.time}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      📍 {appointment.location}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`,
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getStatusText(appointment.status)}
                  </div>
                  <button style={{
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    수정
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Appointment */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          새 진료 예약
        </h3>
        <form onSubmit={handleAddAppointment}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                의사명
              </label>
              <input
                type="text"
                value={newAppointment.doctor}
                onChange={(e) => setNewAppointment({...newAppointment, doctor: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="예: 김내과 의사"
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                진료과
              </label>
              <select
                value={newAppointment.specialty}
                onChange={(e) => setNewAppointment({...newAppointment, specialty: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">선택하세요</option>
                <option value="내과">내과</option>
                <option value="외과">외과</option>
                <option value="정형외과">정형외과</option>
                <option value="심장내과">심장내과</option>
                <option value="신경과">신경과</option>
                <option value="피부과">피부과</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                날짜
              </label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                시간
              </label>
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
              병원/위치
            </label>
            <input
              type="text"
              value={newAppointment.location}
              onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="예: 서울대병원 내과 3층"
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            예약 추가
          </button>
        </form>
      </div>
    </div>
  );
};

// Reports Tab Component
const ReportsTab: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px' }}>
        {t('dashboard.menu.reports')}
      </h2>
      
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          건강 리포트
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          상세한 건강 분석 리포트가 곧 제공될 예정입니다.
        </p>
        <button style={{
          background: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          리포트 생성하기
        </button>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC<{ user: User }> = ({ user }) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px' }}>
        {t('dashboard.menu.settings')}
      </h2>
      
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          프로필 정보
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
              이름
            </label>
            <input
              type="text"
              value={user.name}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
              이메일
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          알림 설정
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>복약 알림 받기</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>진료 예약 알림 받기</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>건강 리포트 알림 받기</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;