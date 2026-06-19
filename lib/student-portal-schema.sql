-- Student portal tables (run via: npm run db:student-portal)

DO $$ BEGIN
  CREATE TYPE constraint_request_status AS ENUM ('pending', 'approved', 'ready', 'selected', 'error', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    name VARCHAR(255),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(255),
    department_code VARCHAR(50),
    semester INTEGER,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_constraint_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(255),
    semester INTEGER NOT NULL,
    constraints JSONB NOT NULL DEFAULT '{}',
    status constraint_request_status DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS student_timetable_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES student_constraint_requests(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_selected_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES student_constraint_requests(id) ON DELETE SET NULL,
    options_id UUID REFERENCES student_timetable_options(id) ON DELETE SET NULL,
    option_index INTEGER NOT NULL,
    timetable JSONB NOT NULL,
    summary JSONB,
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_constraint_requests_user ON student_constraint_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_student_constraint_requests_status ON student_constraint_requests(status);
CREATE INDEX IF NOT EXISTS idx_student_timetable_options_user ON student_timetable_options(user_id);
CREATE INDEX IF NOT EXISTS idx_student_selected_timetables_user ON student_selected_timetables(user_id);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_constraint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timetable_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_selected_timetables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can manage student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Service can manage constraint requests" ON student_constraint_requests;
DROP POLICY IF EXISTS "Service can manage timetable options" ON student_timetable_options;
DROP POLICY IF EXISTS "Service can manage selected timetables" ON student_selected_timetables;

CREATE POLICY "Service can manage student profiles" ON student_profiles FOR ALL USING (true);
CREATE POLICY "Service can manage constraint requests" ON student_constraint_requests FOR ALL USING (true);
CREATE POLICY "Service can manage timetable options" ON student_timetable_options FOR ALL USING (true);
CREATE POLICY "Service can manage selected timetables" ON student_selected_timetables FOR ALL USING (true);
