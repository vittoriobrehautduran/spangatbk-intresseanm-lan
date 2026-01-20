export type ApplicationStatus = 'new' | 'contacted' | 'queued' | 'placed' | 'aborted';
export type SportType = 'tennis' | 'table_tennis';

export type TennisLevel = 
  | 'boll-lekis'
  | 'minitennis'
  | 'juniortennis'
  | 'vuxentennis'
  | 'veterantennis_med_tranare';

export type TableTennisLevel =
  | 'boll-lekis'
  | 'juniorbordtennis'
  | 'seniorbordtennis_med_tranare'
  | 'veteranbordtennis_med_tranare';

export interface PreferredTime {
  day: string;
  from: string;
  to: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  sport_type: SportType;
  tennis_levels: TennisLevel[] | null;
  table_tennis_levels: TableTennisLevel[] | null;
  interest_areas: string | null;
  student_first_name: string;
  student_last_name: string;
  student_personal_number: string;
  student_phone: string;
  student_address: string;
  student_postal_code: string;
  student_city: string;
  student_email: string;
  student_age: number | null;
  has_guardian: boolean;
  guardian_1_name: string | null;
  guardian_1_email: string | null;
  guardian_1_phone: string | null;
  guardian_2_name: string | null;
  guardian_2_email: string | null;
  guardian_2_phone: string | null;
  group_photo_consent: boolean;
  terms_confirmed: boolean;
  preferred_times: PreferredTime[] | null;
  other_wishes: string | null;
  court_time_suggestion: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

