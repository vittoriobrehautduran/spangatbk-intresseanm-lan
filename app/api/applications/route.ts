import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applicationFormSchema } from '@/lib/validation';
import type { Application } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = applicationFormSchema.parse(body);

    const supabase = await createClient();

    const applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'status' | 'admin_notes'> = {
      status: 'new',
      sport_type: validatedData.sportType,
      tennis_levels: validatedData.tennisLevels || null,
      table_tennis_levels: validatedData.tableTennisLevels || null,
      interest_areas: validatedData.interestAreas || null,
      student_first_name: validatedData.studentFirstName,
      student_last_name: validatedData.studentLastName,
      student_personal_number: validatedData.studentPersonalNumber,
      student_phone: validatedData.studentPhone,
      student_address: validatedData.studentAddress,
      student_email: validatedData.studentEmail,
      student_age: validatedData.studentAge || null,
      has_guardian: validatedData.hasGuardian,
      guardian_1_name: validatedData.guardian1?.name || null,
      guardian_1_email: validatedData.guardian1?.email || null,
      guardian_1_phone: validatedData.guardian1?.phone || null,
      guardian_2_name: validatedData.guardian2?.name || null,
      guardian_2_email: validatedData.guardian2?.email || null,
      guardian_2_phone: validatedData.guardian2?.phone || null,
      group_photo_consent: validatedData.groupPhotoConsent,
      terms_confirmed: validatedData.termsConfirmed,
      preferred_times: validatedData.preferredTimes || null,
      other_wishes: validatedData.otherWishes || null,
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save application', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Validation or server error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

