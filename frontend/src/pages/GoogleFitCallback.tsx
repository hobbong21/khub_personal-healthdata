import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const GoogleFitCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Google Fit 인증을 처리하고 있습니다...');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const authCode = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      setStatus('error');
      setMessage(`Google Fit 인증이 취소되었습니다: ${error}`);
      return;
    }

    if (!authCode) {
      setStatus('error');
      setMessage('Google Fit 인증 코드를 받지 못했습니다.');
      return;
    }

    handleGoogleFitAuth(authCode);
  }, [user, searchParams, navigate]);

  const handleGoogleFitAuth = async (authCode: string) => {
    try {
      setStatus('processing');
      setMessage('Google Fit 토큰을 교환하고 있습니다...');

      // 1단계: 인증 코드를 토큰으로 교환
      const redirectUri = `${window.location.origin}/google-fit/callback`;
      const tokenResponse = await fetch('/api/google-fit/exchange-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authCode,
          redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.message || '토큰 교환에 실패했습니다.');
      }

      const tokenData = await tokenResponse.json();
      setMessage('Google Fit 기기를 등록하고 있습니다...');

      // 2단계: 웨어러블 기기로 등록
      const deviceResponse = await fetch('/api/wearable/authenticate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceType: 'google_fit',
          deviceName: 'Google Fit',
          authCode,
          redirectUri,
          syncSettings: {
            autoSync: true,
            syncInterval: 60, // 60분마다 자동 동기화
            dataTypes: [
              'heart_rate',
              'steps', 
              'calories',
              'sleep',
              'weight',
              'distance',
              'exercise_sessions'
            ],
          },
        }),
      });

      if (!deviceResponse.ok) {
        const errorData = await deviceResponse.json();
        throw new Error(errorData.message || '기기 등록에 실패했습니다.');
      }

      const deviceData = await deviceResponse.json();

      if (deviceData.success) {
        setStatus('success');
        setMessage('Google Fit이 성공적으로 연결되었습니다! 잠시 후 대시보드로 이동합니다.');
        
        // 3초 후 대시보드로 리다이렉트
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(deviceData.message || '기기 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google Fit 인증 처리 오류:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Google Fit 연결 중 오류가 발생했습니다.');
    }
  };

  const handleRetry = () => {
    navigate('/settings/wearable');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Google Fit 연동</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  대시보드로
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                지금 대시보드로 이동
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};