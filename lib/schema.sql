-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
CREATE TYPE room_type AS ENUM ('classroom', 'lab', 'seminar_hall');
CREATE TYPE availability_status AS ENUM ('available', 'occupied', 'maintenance');

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (admin, faculty, student roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type room_type NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    building VARCHAR(100),
    availability_status availability_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    credit_hours DECIMAL(3, 1) NOT NULL DEFAULT 3.0,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Faculty availability table
CREATE TABLE faculty_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timetable slots table
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_sections_department ON sections(department_id);
CREATE INDEX idx_sections_semester ON sections(semester);
CREATE INDEX idx_faculty_availability_faculty ON faculty_availability(faculty_id);
CREATE INDEX idx_faculty_availability_day ON faculty_availability(day_of_week);
CREATE INDEX idx_timetable_slots_section ON timetable_slots(section_id);
CREATE INDEX idx_timetable_slots_subject ON timetable_slots(subject_id);
CREATE INDEX idx_timetable_slots_faculty ON timetable_slots(faculty_id);
CREATE INDEX idx_timetable_slots_room ON timetable_slots(room_id);
CREATE INDEX idx_timetable_slots_day ON timetable_slots(day_of_week);
CREATE INDEX idx_timetable_slots_semester ON timetable_slots(semester);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_status ON rooms(availability_status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR true);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
        ) OR true
    );

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid()::uuid);

-- RLS Policies for faculty_availability
CREATE POLICY "Faculty can view all availability" ON faculty_availability
    FOR SELECT USING (true);

-- RLS Policies for timetable_slots
CREATE POLICY "Everyone can view timetable slots" ON timetable_slots
    FOR SELECT USING (true);

-- RLS Policies for departments, rooms, subjects, sections
CREATE POLICY "Everyone can view departments" ON departments
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view rooms" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view sections" ON sections
    FOR SELECT USING (true);

-- Student portal tables
CREATE TYPE constraint_request_status AS ENUM ('pending', 'approved', 'ready', 'selected', 'error', 'rejected', 'expired');

CREATE TABLE student_profiles (
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

CREATE TABLE student_constraint_requests (
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

CREATE TABLE student_timetable_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES student_constraint_requests(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_selected_timetables (
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

CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_student_constraint_requests_user ON student_constraint_requests(user_id);
CREATE INDEX idx_student_constraint_requests_status ON student_constraint_requests(status);
CREATE INDEX idx_student_timetable_options_user ON student_timetable_options(user_id);
CREATE INDEX idx_student_selected_timetables_user ON student_selected_timetables(user_id);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_constraint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_timetable_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_selected_timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage student profiles" ON student_profiles FOR ALL USING (true);
CREATE POLICY "Service can manage constraint requests" ON student_constraint_requests FOR ALL USING (true);
CREATE POLICY "Service can manage timetable options" ON student_timetable_options FOR ALL USING (true);
CREATE POLICY "Service can manage selected timetables" ON student_selected_timetables FOR ALL USING (true);

-- Faculty availability request flow
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
CREATE POLICY "Service can manage faculty availability requests" ON faculty_availability_requests FOR ALL USING (true);

-- Legacy MongoDB collections migrated to Supabase
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

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope VARCHAR(100) NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_data_type ON uploaded_data_records(data_type);
CREATE INDEX IF NOT EXISTS idx_generated_timetables_generated_at ON generated_timetables(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_timetables_active ON published_timetables(is_active, semester, program);

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
