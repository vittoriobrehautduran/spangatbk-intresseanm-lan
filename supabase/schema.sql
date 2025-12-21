-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE application_status AS ENUM ('new', 'contacted', 'placed', 'rejected', 'cancelled');
CREATE TYPE sport_type AS ENUM ('tennis', 'table_tennis');

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status application_status NOT NULL DEFAULT 'new',
  
  -- Sport and level
  sport_type sport_type NOT NULL,
  tennis_levels TEXT[], -- Array of: 'boll-lekis', 'minitennis', 'juniortennis', 'vuxentennis', 'veterantennis_med_tranare'
  table_tennis_levels TEXT[], -- Array of: 'boll-lekis', 'juniorbordtennis', 'seniorbordtennis_med_tranare', 'veteranbordtennis_med_tranare'
  interest_areas TEXT,
  
  -- Student information
  student_first_name TEXT NOT NULL,
  student_last_name TEXT NOT NULL,
  student_personal_number TEXT NOT NULL, -- Full personal number
  student_phone TEXT NOT NULL,
  student_address TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_age INTEGER, -- Calculated or entered age
  
  -- Guardian information
  has_guardian BOOLEAN NOT NULL DEFAULT false,
  guardian_1_name TEXT,
  guardian_1_email TEXT,
  guardian_1_phone TEXT,
  guardian_2_name TEXT,
  guardian_2_email TEXT,
  guardian_2_phone TEXT,
  
  -- Consents
  group_photo_consent BOOLEAN NOT NULL,
  terms_confirmed BOOLEAN NOT NULL,
  
  -- Training preferences
  preferred_times JSONB, -- Array of {day: string, from: string, to: string}
  
  -- Other
  other_wishes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (links to Supabase Auth users)
-- Note: Admin users are created in Supabase Auth, then added here
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_sport_type ON applications(sport_type);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_student_email ON applications(student_email);
CREATE INDEX idx_applications_student_name ON applications(student_first_name, student_last_name);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
-- Public can only insert (submit applications)
CREATE POLICY "Public can insert applications"
  ON applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admin users can read applications
CREATE POLICY "Admins can read applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Only authenticated admin users can update applications
CREATE POLICY "Admins can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for admin_users
-- Users can only see their own admin record
CREATE POLICY "Users can read own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

