import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { GoogleFitIntegration } from '../components/wearable/GoogleFitIntegration';
import { Smartphone, Watch, Activity } from 'lucide-react';

export const WearableSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('google-fit');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">웨어러블 기기 설정</h1>
        <p className="text-gray-600">
          웨어러블 기기와 건강 앱을 연결하여 자동으로 건강 데이터를 동기화하세요.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="google-fit" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Google Fit
          </TabsTrigger>
          <TabsTrigger value="apple-health" className="flex items-center gap-2">
            <Watch className="h-4 w-4" />
            Apple Health
          </TabsTrigger>
          <TabsTrigger value="fitbit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Fitbit
          </TabsTrigger>
          <TabsTrigger value="samsung-health" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Samsung Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google-fit">
          <GoogleFitIntegration />
        </TabsContent>

        <TabsContent value="apple-health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="h-5 w-5" />
                Apple Health 연동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Watch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Apple Health 연동 준비 중
                </h3>
                <p className="text-gray-500">
                  Apple Health 연동 기능은 곧 제공될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitbit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Fitbit 연동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Fitbit 연동 준비 중
                </h3>
                <p className="text-gray-500">
                  Fitbit 연동 기능은 곧 제공될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samsung-health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Samsung Health 연동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Samsung Health 연동 준비 중
                </h3>
                <p className="text-gray-500">
                  Samsung Health 연동 기능은 곧 제공될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>웨어러블 기기 연동 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">지원되는 데이터 타입</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 심박수 (bpm)</li>
                  <li>• 걸음 수 (걸음)</li>
                  <li>• 소모 칼로리 (kcal)</li>
                  <li>• 수면 시간 (분)</li>
                  <li>• 체중 (kg)</li>
                  <li>• 이동 거리 (km)</li>
                  <li>• 운동 세션 (분)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">동기화 설정</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 자동 동기화: 1시간마다</li>
                  <li>• 수동 동기화: 언제든지 가능</li>
                  <li>• 데이터 보관: 무제한</li>
                  <li>• 개인정보 보호: 암호화 저장</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">주의사항</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 웨어러블 기기 연동 시 해당 플랫폼의 개인정보 처리방침이 적용됩니다.</li>
                <li>• 데이터 동기화는 인터넷 연결이 필요합니다.</li>
                <li>• 일부 데이터는 기기나 앱의 설정에 따라 제한될 수 있습니다.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};