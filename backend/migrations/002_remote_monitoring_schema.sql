-- 원격 모니터링 및 텔레헬스 스키마
-- 생성일: 2024-11-01

-- 원격 모니터링 세션 테이블
CREATE TABLE remote_monitoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    healthcare_provider_id UUID, -- 의료진 ID (향후 확장)
    session_type VARCHAR(50) CHECK (session_type IN ('continuous', 'scheduled', 'emergency')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'paused', 'completed', 'terminated')) DEFAULT 'active',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    monitoring_parameters JSONB, -- 모니터링할 파라미터 설정
    alert_thresholds JSONB, -- 알림 임계값 설정
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 실시간 건강 데이터 테이블
CREATE TABLE real_time_health_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monitoring_session_id UUID REFERENCES remote_monitoring_sessions(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'heart_rate', 'blood_pressure', 'temperature', 'oxygen_saturation', etc.
    value JSONB NOT NULL,
    unit VARCHAR(20),
    device_source VARCHAR(100), -- 데이터 소스 (웨어러블, 수동 입력 등)
    is_critical BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 건강 알림 테이블
CREATE TABLE health_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monitoring_session_id UUID REFERENCES remote_monitoring_sessions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'threshold_exceeded', 'anomaly_detected', 'device_disconnected', etc.
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data_reference JSONB, -- 관련 데이터 참조
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 의료진 데이터 공유 테이블
CREATE TABLE healthcare_data_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    healthcare_provider_email VARCHAR(255) NOT NULL,
    healthcare_provider_name VARCHAR(100),
    shared_data_types JSONB NOT NULL, -- 공유할 데이터 타입들
    access_level VARCHAR(20) CHECK (access_level IN ('read_only', 'read_write')) DEFAULT 'read_only',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    access_token VARCHAR(255), -- 의료진 접근용 토큰
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 텔레헬스 연동 설정 테이블
CREATE TABLE telehealth_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_name VARCHAR(100) NOT NULL, -- 'zoom_healthcare', 'teladoc', 'amwell', etc.
    platform_user_id VARCHAR(255),
    integration_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 원격 진료 세션 테이블
CREATE TABLE telehealth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    telehealth_integration_id UUID REFERENCES telehealth_integrations(id) ON DELETE SET NULL,
    healthcare_provider_name VARCHAR(100) NOT NULL,
    session_type VARCHAR(50) CHECK (session_type IN ('consultation', 'follow_up', 'emergency')) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    session_url VARCHAR(500),
    session_notes TEXT,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 데이터 익명화 로그 테이블
CREATE TABLE data_anonymization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anonymized_user_id UUID NOT NULL, -- 익명화된 사용자 ID
    data_types JSONB NOT NULL, -- 익명화된 데이터 타입들
    anonymization_method VARCHAR(50) NOT NULL,
    purpose VARCHAR(100) NOT NULL, -- 'research', 'analytics', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 연구 참여 테이블
CREATE TABLE research_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    research_project_id VARCHAR(100) NOT NULL,
    research_title VARCHAR(200) NOT NULL,
    research_institution VARCHAR(200),
    participation_type VARCHAR(50) CHECK (participation_type IN ('data_sharing', 'clinical_trial', 'survey')) NOT NULL,
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    participation_start_date DATE,
    participation_end_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'active', 'completed', 'withdrawn')) DEFAULT 'pending',
    incentive_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인센티브 관리 테이블
CREATE TABLE user_incentives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incentive_type VARCHAR(50) NOT NULL, -- 'data_contribution', 'research_participation', 'platform_usage', etc.
    points_earned INTEGER NOT NULL,
    points_redeemed INTEGER DEFAULT 0,
    description TEXT,
    reference_id UUID, -- 관련 활동 참조 ID
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_remote_monitoring_sessions_user_id ON remote_monitoring_sessions(user_id);
CREATE INDEX idx_remote_monitoring_sessions_status ON remote_monitoring_sessions(status);
CREATE INDEX idx_real_time_health_data_user_id ON real_time_health_data(user_id);
CREATE INDEX idx_real_time_health_data_recorded_at ON real_time_health_data(recorded_at);
CREATE INDEX idx_real_time_health_data_type ON real_time_health_data(data_type);
CREATE INDEX idx_health_alerts_user_id ON health_alerts(user_id);
CREATE INDEX idx_health_alerts_severity ON health_alerts(severity);
CREATE INDEX idx_health_alerts_created_at ON health_alerts(created_at);
CREATE INDEX idx_healthcare_data_shares_user_id ON healthcare_data_shares(user_id);
CREATE INDEX idx_telehealth_sessions_user_id ON telehealth_sessions(user_id);
CREATE INDEX idx_telehealth_sessions_scheduled_time ON telehealth_sessions(scheduled_time);
CREATE INDEX idx_research_participations_user_id ON research_participations(user_id);
CREATE INDEX idx_user_incentives_user_id ON user_incentives(user_id);

-- 트리거 생성
CREATE TRIGGER update_remote_monitoring_sessions_updated_at BEFORE UPDATE ON remote_monitoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_healthcare_data_shares_updated_at BEFORE UPDATE ON healthcare_data_shares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telehealth_integrations_updated_at BEFORE UPDATE ON telehealth_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telehealth_sessions_updated_at BEFORE UPDATE ON telehealth_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_participations_updated_at BEFORE UPDATE ON research_participations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;