-- 보안 및 감사 로그 테이블 생성
-- HIPAA 준수를 위한 감사 추적 시스템

-- 감사 로그 테이블
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip VARCHAR(45) NOT NULL, -- IPv6 지원
    user_agent TEXT,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    details JSONB,
    hash VARCHAR(64) NOT NULL, -- SHA-256 해시
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 감사 로그 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_logs(hash);

-- 사용자 역할 및 권한 테이블
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- 사용자 세션 테이블 (세션 관리)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 세션 인덱스
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 데이터 접근 로그 테이블 (민감한 데이터 접근 추적)
CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'health_record', 'medical_record', 'genomic_data' 등
    resource_id UUID NOT NULL,
    access_type VARCHAR(20) NOT NULL, -- 'read', 'write', 'delete'
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_hash VARCHAR(64), -- 접근한 데이터의 해시 (무결성 검증용)
    purpose TEXT -- 접근 목적 (연구, 치료 등)
);

-- 데이터 접근 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_resource ON data_access_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_accessed_at ON data_access_logs(accessed_at);

-- 보안 이벤트 테이블 (보안 위반 사항 추적)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'login_failure', 'permission_denied', 'suspicious_activity' 등
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    description TEXT NOT NULL,
    details JSONB,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 보안 이벤트 인덱스
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- 데이터 암호화 키 관리 테이블
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_version INTEGER NOT NULL DEFAULT 1,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'aes-256-gcm',
    key_hash VARCHAR(64) NOT NULL, -- 키의 해시 (키 자체는 저장하지 않음)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 암호화 키 인덱스
CREATE INDEX IF NOT EXISTS idx_encryption_keys_name ON encryption_keys(key_name);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(is_active);

-- 데이터 백업 로그 테이블
CREATE TABLE IF NOT EXISTS backup_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'differential'
    table_name VARCHAR(100),
    backup_size BIGINT,
    backup_location TEXT NOT NULL,
    backup_hash VARCHAR(64) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    error_message TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 백업 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_started_at ON backup_logs(started_at);

-- 규정 준수 보고서 테이블
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL, -- 'hipaa', 'gdpr', 'audit' 등
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    report_data JSONB NOT NULL,
    report_hash VARCHAR(64) NOT NULL,
    file_path TEXT, -- 생성된 보고서 파일 경로
    status VARCHAR(20) DEFAULT 'generated' -- 'generated', 'reviewed', 'submitted'
);

-- 규정 준수 보고서 인덱스
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_at ON compliance_reports(generated_at);

-- 사용자 동의 관리 테이블 (GDPR 준수)
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'data_processing', 'research_participation', 'marketing' 등
    consent_version VARCHAR(20) NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    consent_text TEXT NOT NULL,
    UNIQUE(user_id, consent_type, consent_version)
);

-- 사용자 동의 인덱스
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON user_consents(granted);

-- 데이터 보존 정책 테이블
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    retention_period_days INTEGER NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- 'legal_requirement', 'business_rule', 'user_request'
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 데이터 보존 정책 인덱스
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_table ON data_retention_policies(table_name);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_active ON data_retention_policies(is_active);

-- 기본 사용자 역할 데이터 삽입
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'patient', id, CURRENT_TIMESTAMP
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = users.id
);

-- 기본 데이터 보존 정책 설정
INSERT INTO data_retention_policies (table_name, retention_period_days, policy_type, description, created_by)
VALUES 
    ('audit_logs', 2555, 'legal_requirement', 'HIPAA requires 7 years retention for audit logs', (SELECT id FROM users LIMIT 1)),
    ('medical_records', 2555, 'legal_requirement', 'Medical records must be retained for 7 years', (SELECT id FROM users LIMIT 1)),
    ('health_records', 1825, 'business_rule', 'Health tracking data retained for 5 years', (SELECT id FROM users LIMIT 1)),
    ('security_events', 1095, 'business_rule', 'Security events retained for 3 years', (SELECT id FROM users LIMIT 1))
ON CONFLICT DO NOTHING;

-- 뷰: 보안 대시보드용 요약 정보
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM security_events WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours') as security_events_24h,
    (SELECT COUNT(*) FROM audit_logs WHERE timestamp >= CURRENT_DATE - INTERVAL '24 hours') as audit_logs_24h,
    (SELECT COUNT(*) FROM user_sessions WHERE is_active = true) as active_sessions,
    (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE timestamp >= CURRENT_DATE - INTERVAL '24 hours') as active_users_24h,
    (SELECT COUNT(*) FROM security_events WHERE resolved = false) as unresolved_security_events;

-- 뷰: 데이터 접근 요약
CREATE OR REPLACE VIEW data_access_summary AS
SELECT 
    resource_type,
    access_type,
    COUNT(*) as access_count,
    COUNT(DISTINCT user_id) as unique_users,
    DATE(accessed_at) as access_date
FROM data_access_logs
WHERE accessed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY resource_type, access_type, DATE(accessed_at)
ORDER BY access_date DESC, access_count DESC;

-- 함수: 자동 감사 로그 정리
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < CURRENT_DATE - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO audit_logs (timestamp, action, user_id, ip, user_agent, path, method, details, hash)
    VALUES (
        CURRENT_TIMESTAMP,
        'AUDIT_LOG_CLEANUP',
        NULL,
        '127.0.0.1',
        'system',
        '/system/cleanup',
        'SYSTEM',
        jsonb_build_object('deleted_count', deleted_count),
        encode(sha256(('AUDIT_LOG_CLEANUP:system:' || CURRENT_TIMESTAMP::text)::bytea), 'hex')
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 민감한 데이터 변경 시 자동 로깅
CREATE OR REPLACE FUNCTION log_sensitive_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO data_access_logs (user_id, resource_type, resource_id, access_type, ip_address, user_agent, data_hash)
    VALUES (
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'write'
            WHEN 'UPDATE' THEN 'write'
            WHEN 'DELETE' THEN 'delete'
        END,
        COALESCE(current_setting('app.client_ip', true), '127.0.0.1'),
        COALESCE(current_setting('app.user_agent', true), 'unknown'),
        encode(sha256(COALESCE(NEW::text, OLD::text)::bytea), 'hex')
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 민감한 테이블에 트리거 적용
DROP TRIGGER IF EXISTS log_health_records_changes ON health_records;
CREATE TRIGGER log_health_records_changes
    AFTER INSERT OR UPDATE OR DELETE ON health_records
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_changes();

DROP TRIGGER IF EXISTS log_medical_records_changes ON medical_records;
CREATE TRIGGER log_medical_records_changes
    AFTER INSERT OR UPDATE OR DELETE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_changes();

DROP TRIGGER IF EXISTS log_genomic_data_changes ON genomic_data;
CREATE TRIGGER log_genomic_data_changes
    AFTER INSERT OR UPDATE OR DELETE ON genomic_data
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_changes();

-- 권한 설정 (실제 환경에서는 더 세밀한 권한 관리 필요)
-- GRANT SELECT, INSERT ON audit_logs TO health_platform_app;
-- GRANT SELECT, INSERT, UPDATE ON user_sessions TO health_platform_app;
-- GRANT SELECT, INSERT ON data_access_logs TO health_platform_app;
-- GRANT SELECT, INSERT, UPDATE ON security_events TO health_platform_app;