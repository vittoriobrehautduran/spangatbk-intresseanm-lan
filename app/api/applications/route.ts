import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { applicationFormSchema } from '@/lib/validation';
import type { Application } from '@/types/database';
import type { ApplicationSubmitResponse } from '@/types/application-api';
import { checkIPRateLimit, recordIPRateLimit, getIPAddress } from '@/lib/rateLimit';
import { sendConfirmationEmail, sendGuardianConfirmationEmails, sendClubNotificationEmail } from '@/lib/email';
import { reportException, reportSubmissionFailure, reportSubmissionWarning } from '@/lib/monitoring';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured (used for both rate limiting and database operations)
    const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Extract IP address for rate limiting
    const ipAddress = getIPAddress(request);
    
    // Check rate limits before processing (only if Supabase is configured)
    if (supabaseConfigured) {
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
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimitCheck.resetTime).toISOString(),
            },
          }
        );
      }
    }

    const body = await request.json();
    
    const validatedData = applicationFormSchema.parse(body);

    // Create Supabase client if configured
    const supabase = supabaseConfigured ? createServiceClient() : null;

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
      student_postal_code: validatedData.studentPostalCode,
      student_city: validatedData.studentCity,
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
      court_time_suggestion: validatedData.courtTimeSuggestion || null,
    };

    // Create Application object for email sending (with defaults if DB fails)
    const now = new Date().toISOString();
    const applicationForEmail: Application = {
      id: 'temp-' + Date.now(),
      ...applicationData,
      created_at: now,
      updated_at: now,
      submitted_at: now,
      admin_notes: null,
    };

    let dbSaveSuccess = false;
    let savedApplication: Application | null = null;
    let dbError: Error | null = null;

    // Try to save to database (only if Supabase is configured)
    if (supabase) {
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        dbError = error;
        // Don't return yet - we'll send emails anyway
      } else {
        dbSaveSuccess = true;
        savedApplication = data;
        // Record successful request for rate limiting only if DB save succeeded
        await recordIPRateLimit(ipAddress);
      }
    } else {
      console.warn('Supabase not configured - skipping database save, but sending emails');
    }

    // Send confirmation emails regardless of database success/failure
    const emailApplication = savedApplication || applicationForEmail;
    const warnings: string[] = [];

    const studentEmailSent = await sendConfirmationEmail(emailApplication, 'sv');
    if (!studentEmailSent) {
      warnings.push('Bekräftelsemejl till eleven kunde inte skickas');
    }

    let guardiansEmailSent = true;
    if (emailApplication.has_guardian) {
      guardiansEmailSent = await sendGuardianConfirmationEmails(emailApplication, 'sv');
      if (!guardiansEmailSent) {
        warnings.push('Bekräftelsemejl till målsman kunde inte skickas');
      }
    }

    const clubEmailSent = await sendClubNotificationEmail(emailApplication);
    if (!clubEmailSent) {
      warnings.push('Notifieringsmejl till klubben kunde inte skickas');
    }

    const emailsSent = {
      student: studentEmailSent,
      club: clubEmailSent,
      guardians: guardiansEmailSent,
    };

    // Application counts as received if saved to DB or club was notified by email
    const applicationReceived = dbSaveSuccess || clubEmailSent;

    if (!dbSaveSuccess && supabaseConfigured) {
      warnings.unshift('Ansökan kunde inte sparas i databasen');
    }

    const responseBody: ApplicationSubmitResponse = {
      success: applicationReceived,
      dbSaved: dbSaveSuccess,
      emailsSent,
      warnings,
      ...(savedApplication ? { data: savedApplication } : {}),
    };

    if (!applicationReceived) {
      reportSubmissionFailure('Application submission failed completely', {
        dbSaved: dbSaveSuccess,
        emailsSent,
        warnings,
        dbError: dbError?.message || null,
        ipAddress,
      });

      return NextResponse.json(
        {
          ...responseBody,
          error: 'Failed to process application',
          details: dbError?.message || null,
        },
        { status: 500 }
      );
    }

    if (warnings.length > 0) {
      reportSubmissionWarning('Application submitted with warnings', {
        dbSaved: dbSaveSuccess,
        emailsSent,
        warnings,
        applicationId: savedApplication?.id || emailApplication.id,
      });
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error: any) {
    console.error('Validation or server error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    reportException(error, { area: 'applications-api' });

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

