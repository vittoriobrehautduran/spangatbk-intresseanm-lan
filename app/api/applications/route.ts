import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { applicationFormSchema } from '@/lib/validation';
import type { Application } from '@/types/database';
import { checkIPRateLimit, recordIPRateLimit, getIPAddress } from '@/lib/rateLimit';
import { sendConfirmationEmail, sendGuardianConfirmationEmails, sendClubNotificationEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Extract IP address for rate limiting
    const ipAddress = getIPAddress(request);
    
    // Check rate limits before processing
    const rateLimitCheck = await checkIPRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      const retryAfter = rateLimitCheck.retryAfter || 3600;
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitCheck.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    
    const validatedData = applicationFormSchema.parse(body);

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();

    // Calculate age from personal number (format: YYYYMMDD-XXXX)
    let calculatedAge: number | null = null;
    const personalNumber = validatedData.studentPersonalNumber.replace(/-/g, '');
    if (personalNumber.length >= 8) {
      const year = parseInt(personalNumber.substring(0, 4), 10);
      const month = parseInt(personalNumber.substring(4, 6), 10);
      const day = parseInt(personalNumber.substring(6, 8), 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        calculatedAge = age;
      }
    }

    const applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'admin_notes'> = {
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
      student_age: calculatedAge,
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

    // Record successful request for rate limiting
    await recordIPRateLimit(ipAddress);

    // Send confirmation emails (non-blocking - don't fail request if email fails)
    // Default to Swedish for now - can be enhanced later to detect language from form
    try {
      // Send confirmation to student
      await sendConfirmationEmail(data, 'sv');
      
      // Send emails to guardians if they exist
      if (data.has_guardian) {
        await sendGuardianConfirmationEmails(data, 'sv');
      }

      // Send notification to tennis club with all form details
      await sendClubNotificationEmail(data);
    } catch (emailError) {
      // Log email error but don't fail the request
      // Application was successfully saved, email is just a notification
      console.error('Email sending failed (application was saved):', emailError);
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

// Delete application (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user session from cookies
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is admin using service client to bypass RLS
    const serviceClient = createServiceClient();
    const { data: adminUser, error: adminError } = await serviceClient
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get application ID from query parameters
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Use service client to delete (bypasses RLS)
    const { error: deleteError } = await serviceClient
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error('Error deleting application:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete application', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

