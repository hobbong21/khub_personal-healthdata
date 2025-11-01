import React from 'react';
import WearableDeviceManager from '../components/wearable/WearableDeviceManager';
import './WearablePage.css';

const WearablePage: React.FC = () => {
  return (
    <div className="wearable-page">
      <div className="page-header">
        <h1>웨어러블 기기 연동</h1>
        <p className="page-description">
          Apple Health, Google Fit, Fitbit 등의 웨어러블 기기와 연동하여 
          건강 데이터를 자동으로 수집하고 관리하세요.
        </p>
      </div>

      <WearableDeviceManager />

      <div className="wearable-info">
        <div className="info-section">
          <h3>지원되는 기기</h3>
          <div className="supported-devices">
            <div className="device-info">
              <div className="device-logo">🍎</div>
              <div>
                <h4>Apple Health</h4>
                <p>iPhone의 건강 앱과 연동하여 걸음 수, 심박수, 체중 등의 데이터를 자동으로 수집합니다.</p>
              </div>
            </div>
            <div className="device-info">
              <div className="device-logo">🏃‍♂️</div>
              <div>
                <h4>Google Fit</h4>
                <p>Android 기기의 Google Fit 앱과 연동하여 활동량, 운동 기록 등을 추적합니다.</p>
              </div>
            </div>
            <div className="device-info">
              <div className="device-logo">⌚</div>
              <div>
                <h4>Fitbit</h4>
                <p>Fitbit 웨어러블 기기의 상세한 건강 및 피트니스 데이터를 연동합니다.</p>
              </div>
            </div>
            <div className="device-info">
              <div className="device-logo">📱</div>
              <div>
                <h4>Samsung Health</h4>
                <p>Samsung Health 앱의 건강 데이터와 Galaxy Watch 데이터를 연동합니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>수집되는 데이터</h3>
          <div className="data-types">
            <div className="data-category">
              <h4>바이탈 사인</h4>
              <ul>
                <li>❤️ 심박수</li>
                <li>🩸 혈압</li>
                <li>🫁 혈중 산소</li>
                <li>🌡️ 체온</li>
              </ul>
            </div>
            <div className="data-category">
              <h4>활동량</h4>
              <ul>
                <li>👣 걸음 수</li>
                <li>🔥 칼로리</li>
                <li>📏 이동 거리</li>
                <li>🏢 오른 층수</li>
              </ul>
            </div>
            <div className="data-category">
              <h4>웰니스</h4>
              <ul>
                <li>😴 수면 패턴</li>
                <li>💪 운동 세션</li>
                <li>⚖️ 체중</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>개인정보 보호</h3>
          <div className="privacy-info">
            <div className="privacy-item">
              <div className="privacy-icon">🔒</div>
              <div>
                <h4>암호화된 저장</h4>
                <p>모든 건강 데이터는 암호화되어 안전하게 저장됩니다.</p>
              </div>
            </div>
            <div className="privacy-item">
              <div className="privacy-icon">👤</div>
              <div>
                <h4>개인 전용</h4>
                <p>귀하의 데이터는 오직 귀하만 접근할 수 있으며, 제3자와 공유되지 않습니다.</p>
              </div>
            </div>
            <div className="privacy-item">
              <div className="privacy-icon">🛡️</div>
              <div>
                <h4>HIPAA 준수</h4>
                <p>의료 정보 보호법(HIPAA) 기준에 따라 데이터를 보호합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearablePage;