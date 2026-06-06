-- Legacy MongoDB collections migrated to Supabase
-- Run: npm run db:legacy-store

-- Excel upload data (was students_data, faculty_data, rooms_data collections)
CREATE TABLE IF NOT EXISTS uploaded_data_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('students', 'faculty', 'rooms')),
    payload JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (data_type, record_id)
);

CREATE INDEX IF NOT EXISTS idx_uploaded_data_type ON uploaded_data_records(data_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_data_order ON uploaded_data_records(data_type, sort_order);

-- Generated timetables (was generated_timetables collection)
CREATE TABLE IF NOT EXISTS generated_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(255) NOT NULL UNIQUE,
    mode VARCHAR(50) NOT NULL DEFAULT 'single',
    timetable_data JSONB,
    scenarios JSONB,
    best_scenario_id VARCHAR(255),
    constraints JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    semester VARCHAR(100),
    department VARCHAR(255),
    program VARCHAR(255),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_timetables_generated_at ON generated_timetables(generated_at DESC);

-- Published timetables (was published_timetables collection)
CREATE TABLE IF NOT EXISTS published_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publish_id VARCHAR(255) NOT NULL UNIQUE,
    timetable_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'published',
    semester VARCHAR(100),
    program VARCHAR(255),
    year INTEGER,
    published_by VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deactivated_reason TEXT,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_published_timetables_active ON published_timetables(is_active, semester, program);

-- Admin settings (was settings collection)
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope VARCHAR(100) NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE uploaded_data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service can manage uploaded_data_records" ON uploaded_data_records FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can manage generated_timetables" ON generated_timetables FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can manage published_timetables" ON published_timetables FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can manage app_settings" ON app_settings FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
