-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "blood_type" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "lifestyle_habits" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "recorded_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL,
    "health_record_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "unit" TEXT NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "diagnosis_code" TEXT,
    "diagnosis_description" TEXT,
    "doctor_notes" TEXT,
    "cost" DOUBLE PRECISION,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "test_category" TEXT NOT NULL,
    "test_subcategory" TEXT,
    "test_name" TEXT NOT NULL,
    "test_items" JSONB NOT NULL,
    "overall_status" TEXT NOT NULL,
    "test_date" TIMESTAMP(3) NOT NULL,
    "laboratory_name" TEXT,
    "doctor_notes" TEXT,
    "image_files" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT,
    "instructions" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "side_effects" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosage_logs" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL,
    "dosage_taken" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "dosage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genomic_data" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_platform" TEXT NOT NULL,
    "file_path" TEXT,
    "snp_data" JSONB,
    "analysis_results" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "genomic_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "genomic_data_id" TEXT,
    "disease_type" TEXT NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION,
    "contributing_factors" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "name" TEXT,
    "conditions" JSONB,
    "age_at_death" INTEGER,
    "cause_of_death" TEXT,

    CONSTRAINT "family_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "category" TEXT,
    "ocr_text" TEXT,
    "metadata" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "parameters" JSONB,
    "accuracy" DOUBLE PRECISION,
    "trained_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ai_model_id" TEXT NOT NULL,
    "prediction_type" TEXT NOT NULL,
    "input_data" JSONB NOT NULL,
    "prediction_result" JSONB NOT NULL,
    "confidence_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_ranges" (
    "id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_category" TEXT NOT NULL,
    "unit" TEXT,
    "age_min" INTEGER,
    "age_max" INTEGER,
    "gender" TEXT,
    "min_value" DOUBLE PRECISION,
    "max_value" DOUBLE PRECISION,
    "text_range" TEXT,
    "source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "test_results_test_category_test_date_idx" ON "test_results"("test_category", "test_date");

-- CreateIndex
CREATE INDEX "test_results_test_name_test_date_idx" ON "test_results"("test_name", "test_date");

-- CreateIndex
CREATE INDEX "test_results_overall_status_idx" ON "test_results"("overall_status");

-- CreateIndex
CREATE INDEX "reference_ranges_test_name_test_category_idx" ON "reference_ranges"("test_name", "test_category");

-- CreateIndex
CREATE INDEX "reference_ranges_test_category_idx" ON "reference_ranges"("test_category");

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "health_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosage_logs" ADD CONSTRAINT "dosage_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genomic_data" ADD CONSTRAINT "genomic_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_genomic_data_id_fkey" FOREIGN KEY ("genomic_data_id") REFERENCES "genomic_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_history" ADD CONSTRAINT "family_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_fkey" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;