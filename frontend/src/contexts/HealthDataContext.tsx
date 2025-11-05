import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HealthData {
  vitals: {
    bloodPressure: { systolic: number; diastolic: number; timestamp: string }[];
    heartRate: { value: number; timestamp: string }[];
    weight: { value: number; timestamp: string }[];
    bloodSugar: { value: number; timestamp: string }[];
  };
  medications: any[];
  appointments: any[];
  testResults: any[];
}

interface HealthDataContextType {
  healthData: HealthData;
  updateHealthData: (data: Partial<HealthData>) => void;
  loading: boolean;
  error: string | null;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

interface HealthDataProviderProps {
  children: ReactNode;
}

export const HealthDataProvider: React.FC<HealthDataProviderProps> = ({ children }) => {
  const [healthData, setHealthData] = useState<HealthData>({
    vitals: {
      bloodPressure: [],
      heartRate: [],
      weight: [],
      bloodSugar: []
    },
    medications: [],
    appointments: [],
    testResults: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHealthData = (data: Partial<HealthData>) => {
    setHealthData(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    // 초기 데이터 로드
    setLoading(true);
    // Mock data for testing
    setTimeout(() => {
      setHealthData({
        vitals: {
          bloodPressure: [
            { systolic: 120, diastolic: 80, timestamp: new Date().toISOString() }
          ],
          heartRate: [
            { value: 72, timestamp: new Date().toISOString() }
          ],
          weight: [
            { value: 68.5, timestamp: new Date().toISOString() }
          ],
          bloodSugar: [
            { value: 95, timestamp: new Date().toISOString() }
          ]
        },
        medications: [],
        appointments: [],
        testResults: []
      });
      setLoading(false);
    }, 1000);
  }, []);

  const value = {
    healthData,
    updateHealthData,
    loading,
    error
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};