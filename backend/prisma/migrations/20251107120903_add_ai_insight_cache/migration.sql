/*
  Warnings:

  - You are about to drop the column `age_at_death` on the `family_history` table. All the data in the column will be lost.
  - You are about to drop the column `side_effects` on the `medications` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `family_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "family_history" DROP COLUMN "age_at_death",
ADD COLUMN     "birth_year" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "death_year" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "generation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_alive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "medications" DROP COLUMN "side_effects",
ADD COLUMN     "generic_name" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pharmacy" TEXT,
ADD COLUMN     "prescribed_by" TEXT,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "side_effects" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "effect_name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "side_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL,
    "drug1_name" TEXT NOT NULL,
    "drug2_name" TEXT NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clinical_effect" TEXT,
    "mechanism" TEXT,
    "management" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_schedules" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "time_of_day" TEXT NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snp_records" (
    "id" TEXT NOT NULL,
    "genomic_data_id" TEXT NOT NULL,
    "rsid" TEXT NOT NULL,
    "chromosome" TEXT NOT NULL,
    "position" BIGINT NOT NULL,
    "genotype" TEXT NOT NULL,
    "gene" TEXT,
    "consequence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snp_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genetic_conditions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icd10_code" TEXT,
    "category" TEXT NOT NULL,
    "inheritance_pattern" TEXT,
    "prevalence" DOUBLE PRECISION,
    "penetrance" DOUBLE PRECISION,
    "description" TEXT,
    "risk_factors" JSONB,
    "symptoms" JSONB,
    "is_hereditary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genetic_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_risk_assessments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "condition_name" TEXT NOT NULL,
    "family_risk_score" DOUBLE PRECISION NOT NULL,
    "affected_relatives" INTEGER NOT NULL,
    "risk_level" TEXT NOT NULL,
    "recommendations" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "doctor_name" TEXT,
    "appointment_type" TEXT NOT NULL,
    "purpose" TEXT,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "location" TEXT,
    "notes" TEXT,
    "hospital_phone" TEXT,
    "hospital_address" TEXT,
    "reminder_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_notifications" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nutrition" JSONB NOT NULL,
    "exercise" JSONB NOT NULL,
    "screening" JSONB NOT NULL,
    "lifestyle" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_effectiveness" (
    "recommendation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "implementation_date" TIMESTAMP(3),
    "adherence_score" INTEGER,
    "measured_outcome" JSONB,
    "user_feedback" JSONB,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_effectiveness_pkey" PRIMARY KEY ("recommendation_id","user_id")
);

-- CreateTable
CREATE TABLE "wearable_device_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "sync_settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wearable_device_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wearable_data_points" (
    "id" TEXT NOT NULL,
    "device_config_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "unit" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "source_app" TEXT,
    "metadata" JSONB,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wearable_data_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wearable_data_temp" (
    "id" TEXT NOT NULL,
    "device_config_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "metadata" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wearable_data_temp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insight_cache" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "insights_data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_insight_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "details" TEXT,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'patient',
    "granted_by" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_access_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "access_type" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hash" TEXT,
    "purpose" TEXT,

    CONSTRAINT "data_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryption_keys" (
    "id" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "key_version" INTEGER NOT NULL DEFAULT 1,
    "algorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "key_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" TEXT NOT NULL,
    "backup_type" TEXT NOT NULL,
    "table_name" TEXT,
    "backup_size" BIGINT,
    "backup_location" TEXT NOT NULL,
    "backup_hash" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "error_message" TEXT,
    "created_by" TEXT,

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "report_period_start" TIMESTAMP(3) NOT NULL,
    "report_period_end" TIMESTAMP(3) NOT NULL,
    "generated_by" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report_data" JSONB NOT NULL,
    "report_hash" TEXT NOT NULL,
    "file_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'generated',

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "consent_version" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "consent_text" TEXT NOT NULL,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "retention_period_days" INTEGER NOT NULL,
    "policy_type" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remote_monitoring_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "monitoring_devices" JSONB,
    "alert_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remote_monitoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "real_time_health_data" (
    "id" TEXT NOT NULL,
    "remote_monitoring_session_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "device_id" TEXT,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "real_time_health_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_alerts" (
    "id" TEXT NOT NULL,
    "remote_monitoring_session_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "trigger_data" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthcare_data_shares" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "data_types" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "healthcare_data_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telehealth_integrations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "integration_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telehealth_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telehealth_sessions" (
    "id" TEXT NOT NULL,
    "telehealth_integration_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "specialty" TEXT,
    "session_type" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "session_notes" TEXT,
    "diagnosis" TEXT,
    "prescriptions" JSONB,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telehealth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_participations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "study_title" TEXT NOT NULL,
    "study_type" TEXT NOT NULL,
    "participation_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "data_shared" JSONB,
    "incentives_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completion_date" TIMESTAMP(3),
    "withdrawal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_incentives" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "incentive_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points_earned" DOUBLE PRECISION NOT NULL,
    "points_redeemed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "earned_date" TIMESTAMP(3) NOT NULL,
    "redeemed_date" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_incentives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drug_interactions_drug1_name_drug2_name_idx" ON "drug_interactions"("drug1_name", "drug2_name");

-- CreateIndex
CREATE INDEX "drug_interactions_interaction_type_idx" ON "drug_interactions"("interaction_type");

-- CreateIndex
CREATE INDEX "snp_records_rsid_idx" ON "snp_records"("rsid");

-- CreateIndex
CREATE INDEX "snp_records_chromosome_position_idx" ON "snp_records"("chromosome", "position");

-- CreateIndex
CREATE INDEX "snp_records_gene_idx" ON "snp_records"("gene");

-- CreateIndex
CREATE UNIQUE INDEX "genetic_conditions_name_key" ON "genetic_conditions"("name");

-- CreateIndex
CREATE INDEX "genetic_conditions_category_idx" ON "genetic_conditions"("category");

-- CreateIndex
CREATE INDEX "genetic_conditions_is_hereditary_idx" ON "genetic_conditions"("is_hereditary");

-- CreateIndex
CREATE INDEX "family_risk_assessments_user_id_condition_name_idx" ON "family_risk_assessments"("user_id", "condition_name");

-- CreateIndex
CREATE INDEX "family_risk_assessments_risk_level_idx" ON "family_risk_assessments"("risk_level");

-- CreateIndex
CREATE INDEX "appointments_user_id_appointment_date_idx" ON "appointments"("user_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_department_idx" ON "appointments"("department");

-- CreateIndex
CREATE INDEX "appointment_notifications_scheduled_time_status_idx" ON "appointment_notifications"("scheduled_time", "status");

-- CreateIndex
CREATE INDEX "recommendations_user_id_generated_at_idx" ON "recommendations"("user_id", "generated_at");

-- CreateIndex
CREATE INDEX "recommendations_valid_until_idx" ON "recommendations"("valid_until");

-- CreateIndex
CREATE INDEX "recommendation_effectiveness_user_id_category_idx" ON "recommendation_effectiveness"("user_id", "category");

-- CreateIndex
CREATE INDEX "recommendation_effectiveness_implemented_idx" ON "recommendation_effectiveness"("implemented");

-- CreateIndex
CREATE INDEX "wearable_device_configs_user_id_device_type_idx" ON "wearable_device_configs"("user_id", "device_type");

-- CreateIndex
CREATE INDEX "wearable_device_configs_is_active_idx" ON "wearable_device_configs"("is_active");

-- CreateIndex
CREATE INDEX "wearable_data_points_data_type_start_time_idx" ON "wearable_data_points"("data_type", "start_time");

-- CreateIndex
CREATE INDEX "wearable_data_points_synced_at_idx" ON "wearable_data_points"("synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "wearable_data_points_device_config_id_data_type_start_time_key" ON "wearable_data_points"("device_config_id", "data_type", "start_time");

-- CreateIndex
CREATE INDEX "wearable_data_temp_device_config_id_processed_idx" ON "wearable_data_temp"("device_config_id", "processed");

-- CreateIndex
CREATE INDEX "wearable_data_temp_timestamp_idx" ON "wearable_data_temp"("timestamp");

-- CreateIndex
CREATE INDEX "ai_insight_cache_user_id_idx" ON "ai_insight_cache"("user_id");

-- CreateIndex
CREATE INDEX "ai_insight_cache_expires_at_idx" ON "ai_insight_cache"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_ip_idx" ON "audit_logs"("ip");

-- CreateIndex
CREATE INDEX "audit_logs_hash_idx" ON "audit_logs"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_session_token_idx" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "data_access_logs_user_id_idx" ON "data_access_logs"("user_id");

-- CreateIndex
CREATE INDEX "data_access_logs_resource_type_resource_id_idx" ON "data_access_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "data_access_logs_accessed_at_idx" ON "data_access_logs"("accessed_at");

-- CreateIndex
CREATE INDEX "security_events_event_type_idx" ON "security_events"("event_type");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "security_events"("resolved");

-- CreateIndex
CREATE INDEX "security_events_created_at_idx" ON "security_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "encryption_keys_key_name_key" ON "encryption_keys"("key_name");

-- CreateIndex
CREATE INDEX "encryption_keys_key_name_idx" ON "encryption_keys"("key_name");

-- CreateIndex
CREATE INDEX "encryption_keys_is_active_idx" ON "encryption_keys"("is_active");

-- CreateIndex
CREATE INDEX "backup_logs_backup_type_idx" ON "backup_logs"("backup_type");

-- CreateIndex
CREATE INDEX "backup_logs_status_idx" ON "backup_logs"("status");

-- CreateIndex
CREATE INDEX "backup_logs_started_at_idx" ON "backup_logs"("started_at");

-- CreateIndex
CREATE INDEX "compliance_reports_report_type_idx" ON "compliance_reports"("report_type");

-- CreateIndex
CREATE INDEX "compliance_reports_report_period_start_report_period_end_idx" ON "compliance_reports"("report_period_start", "report_period_end");

-- CreateIndex
CREATE INDEX "compliance_reports_generated_at_idx" ON "compliance_reports"("generated_at");

-- CreateIndex
CREATE INDEX "user_consents_user_id_idx" ON "user_consents"("user_id");

-- CreateIndex
CREATE INDEX "user_consents_consent_type_idx" ON "user_consents"("consent_type");

-- CreateIndex
CREATE INDEX "user_consents_granted_idx" ON "user_consents"("granted");

-- CreateIndex
CREATE UNIQUE INDEX "user_consents_user_id_consent_type_consent_version_key" ON "user_consents"("user_id", "consent_type", "consent_version");

-- CreateIndex
CREATE INDEX "data_retention_policies_table_name_idx" ON "data_retention_policies"("table_name");

-- CreateIndex
CREATE INDEX "data_retention_policies_is_active_idx" ON "data_retention_policies"("is_active");

-- CreateIndex
CREATE INDEX "remote_monitoring_sessions_user_id_status_idx" ON "remote_monitoring_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "real_time_health_data_remote_monitoring_session_id_timestam_idx" ON "real_time_health_data"("remote_monitoring_session_id", "timestamp");

-- CreateIndex
CREATE INDEX "real_time_health_data_data_type_timestamp_idx" ON "real_time_health_data"("data_type", "timestamp");

-- CreateIndex
CREATE INDEX "health_alerts_remote_monitoring_session_id_is_resolved_idx" ON "health_alerts"("remote_monitoring_session_id", "is_resolved");

-- CreateIndex
CREATE INDEX "health_alerts_severity_created_at_idx" ON "health_alerts"("severity", "created_at");

-- CreateIndex
CREATE INDEX "healthcare_data_shares_user_id_is_active_idx" ON "healthcare_data_shares"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "telehealth_integrations_user_id_platform_name_idx" ON "telehealth_integrations"("user_id", "platform_name");

-- CreateIndex
CREATE INDEX "telehealth_sessions_telehealth_integration_id_scheduled_tim_idx" ON "telehealth_sessions"("telehealth_integration_id", "scheduled_time");

-- CreateIndex
CREATE INDEX "telehealth_sessions_status_idx" ON "telehealth_sessions"("status");

-- CreateIndex
CREATE INDEX "research_participations_user_id_status_idx" ON "research_participations"("user_id", "status");

-- CreateIndex
CREATE INDEX "research_participations_study_id_idx" ON "research_participations"("study_id");

-- CreateIndex
CREATE INDEX "user_incentives_user_id_status_idx" ON "user_incentives"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_incentives_incentive_type_idx" ON "user_incentives"("incentive_type");

-- AddForeignKey
ALTER TABLE "side_effects" ADD CONSTRAINT "side_effects_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snp_records" ADD CONSTRAINT "snp_records_genomic_data_id_fkey" FOREIGN KEY ("genomic_data_id") REFERENCES "genomic_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_history" ADD CONSTRAINT "family_history_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "family_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_risk_assessments" ADD CONSTRAINT "family_risk_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_notifications" ADD CONSTRAINT "appointment_notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_effectiveness" ADD CONSTRAINT "recommendation_effectiveness_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wearable_device_configs" ADD CONSTRAINT "wearable_device_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wearable_data_points" ADD CONSTRAINT "wearable_data_points_device_config_id_fkey" FOREIGN KEY ("device_config_id") REFERENCES "wearable_device_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wearable_data_temp" ADD CONSTRAINT "wearable_data_temp_device_config_id_fkey" FOREIGN KEY ("device_config_id") REFERENCES "wearable_device_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insight_cache" ADD CONSTRAINT "ai_insight_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "real_time_health_data" ADD CONSTRAINT "real_time_health_data_remote_monitoring_session_id_fkey" FOREIGN KEY ("remote_monitoring_session_id") REFERENCES "remote_monitoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_alerts" ADD CONSTRAINT "health_alerts_remote_monitoring_session_id_fkey" FOREIGN KEY ("remote_monitoring_session_id") REFERENCES "remote_monitoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telehealth_sessions" ADD CONSTRAINT "telehealth_sessions_telehealth_integration_id_fkey" FOREIGN KEY ("telehealth_integration_id") REFERENCES "telehealth_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
