-- Faculty availability request flow (run via: npm run db:faculty-portal)

DO $$ BEGIN
  CREATE TYPE faculty_availability_status AS ENUM ('requested', 'submitted', 'approved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS faculty_availability_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(255),
    semester INTEGER NOT NULL,
    availability JSONB NOT NULL DEFAULT '{}',
    status faculty_availability_status DEFAULT 'requested',
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_faculty_availability_requests_user ON faculty_availability_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_availability_requests_status ON faculty_availability_requests(status);
CREATE INDEX IF NOT EXISTS idx_faculty_availability_requests_dept_sem ON faculty_availability_requests(department_id, semester);

ALTER TABLE faculty_availability_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can manage faculty availability requests" ON faculty_availability_requests;
CREATE POLICY "Service can manage faculty availability requests" ON faculty_availability_requests FOR ALL USING (true);
