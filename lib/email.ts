import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Application } from '@/types/database';
import { translations } from './translations';

// Initialize SES client with credentials from environment variables
const sesClient = new SESClient({
  region: process.env.SES_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY || '',
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || '',
  },
});

// Build HTML email template for application confirmation
function buildConfirmationEmailHtml(
  studentName: string,
  sportType: string,
  language: 'sv' | 'en'
): string {
  const isSwedish = language === 'sv';
  const sportName = sportType === 'tennis' 
    ? (isSwedish ? 'Tennis' : 'Tennis')
    : (isSwedish ? 'Bordtennis' : 'Table Tennis');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${isSwedish ? 'Intresseanmälan mottagen' : 'Application Received'}</h1>
  </div>
  <div class="content">
    <p>${isSwedish ? 'Hej' : 'Hello'} ${studentName},</p>
    <p>
      ${isSwedish 
        ? 'Tack för din intresseanmälan till Spånga TBK! Vi har mottagit din ansökan för' 
        : 'Thank you for your interest application to Spånga TBK! We have received your application for'}
      <strong>${sportName}</strong>.
    </p>
    <p>
      ${isSwedish
        ? 'Vi kommer att granska din ansökan och återkommer till dig så snart som möjligt.'
        : 'We will review your application and get back to you as soon as possible.'}
    </p>
    <p>
      ${isSwedish
        ? 'Om du har några frågor, tveka inte att kontakta oss.'
        : 'If you have any questions, please do not hesitate to contact us.'}
    </p>
    <p>
      ${isSwedish ? 'Med vänliga hälsningar,' : 'Best regards,'}<br>
      Spånga TBK
    </p>
  </div>
  <div class="footer">
    <p>${isSwedish ? 'Detta är ett automatiskt meddelande. Vänligen svara inte på detta e-postmeddelande.' : 'This is an automated message. Please do not reply to this email.'}</p>
  </div>
</body>
</html>
  `.trim();
}

// Build plain text version of confirmation email
function buildConfirmationEmailText(
  studentName: string,
  sportType: string,
  language: 'sv' | 'en'
): string {
  const isSwedish = language === 'sv';
  const sportName = sportType === 'tennis' 
    ? (isSwedish ? 'Tennis' : 'Tennis')
    : (isSwedish ? 'Bordtennis' : 'Table Tennis');

  return `
${isSwedish ? 'Hej' : 'Hello'} ${studentName},

${isSwedish 
  ? 'Tack för din intresseanmälan till Spånga TBK! Vi har mottagit din ansökan för' 
  : 'Thank you for your interest application to Spånga TBK! We have received your application for'} ${sportName}.

${isSwedish
  ? 'Vi kommer att granska din ansökan och återkommer till dig så snart som möjligt.'
  : 'We will review your application and get back to you as soon as possible.'}

${isSwedish
  ? 'Om du har några frågor, tveka inte att kontakta oss.'
  : 'If you have any questions, please do not hesitate to contact us.'}

${isSwedish ? 'Med vänliga hälsningar,' : 'Best regards,'}
Spånga TBK

---
${isSwedish ? 'Detta är ett automatiskt meddelande. Vänligen svara inte på detta e-postmeddelande.' : 'This is an automated message. Please do not reply to this email.'}
  `.trim();
}

// Send confirmation email to student
export async function sendConfirmationEmail(
  application: Application,
  language: 'sv' | 'en' = 'sv'
): Promise<void> {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    console.warn('AWS_SES_FROM_EMAIL not configured, skipping email send');
    return;
  }

  const studentName = `${application.student_first_name} ${application.student_last_name}`;
  const sportType = application.sport_type;

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [application.student_email],
    },
    Message: {
      Subject: {
        Data: language === 'sv' 
          ? 'Intresseanmälan mottagen - Spånga TBK'
          : 'Application Received - Spånga TBK',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: buildConfirmationEmailHtml(studentName, sportType, language),
          Charset: 'UTF-8',
        },
        Text: {
          Data: buildConfirmationEmailText(studentName, sportType, language),
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Confirmation email sent to ${application.student_email}`);
  } catch (error) {
    // Log error but don't fail the request if email fails
    console.error('Failed to send confirmation email:', error);
  }
}

// Send confirmation email to guardians if they exist
export async function sendGuardianConfirmationEmails(
  application: Application,
  language: 'sv' | 'en' = 'sv'
): Promise<void> {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    console.warn('AWS_SES_FROM_EMAIL not configured, skipping guardian emails');
    return;
  }

  const studentName = `${application.student_first_name} ${application.student_last_name}`;
  const sportType = application.sport_type;
  const isSwedish = language === 'sv';

  const guardianEmails: string[] = [];
  if (application.guardian_1_email) {
    guardianEmails.push(application.guardian_1_email);
  }
  if (application.guardian_2_email) {
    guardianEmails.push(application.guardian_2_email);
  }

  // Remove guardian emails that match the student email to avoid duplicates
  const uniqueGuardianEmails = guardianEmails.filter(
    (email) => email.toLowerCase() !== application.student_email.toLowerCase()
  );

  if (uniqueGuardianEmails.length === 0) {
    return;
  }

  const guardianHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${isSwedish ? 'Intresseanmälan mottagen' : 'Application Received'}</h1>
  </div>
  <div class="content">
    <p>${isSwedish ? 'Hej' : 'Hello'},</p>
    <p>
      ${isSwedish 
        ? `Vi vill informera dig om att en intresseanmälan har skickats in för ${studentName} till Spånga TBK för`
        : `We would like to inform you that an interest application has been submitted for ${studentName} to Spånga TBK for`}
      <strong>${sportType === 'tennis' ? (isSwedish ? 'Tennis' : 'Tennis') : (isSwedish ? 'Bordtennis' : 'Table Tennis')}</strong>.
    </p>
    <p>
      ${isSwedish
        ? 'Vi kommer att granska ansökan och återkommer så snart som möjligt.'
        : 'We will review the application and get back to you as soon as possible.'}
    </p>
    <p>
      ${isSwedish
        ? 'Om du har några frågor, tveka inte att kontakta oss.'
        : 'If you have any questions, please do not hesitate to contact us.'}
    </p>
    <p>
      ${isSwedish ? 'Med vänliga hälsningar,' : 'Best regards,'}<br>
      Spånga TBK
    </p>
  </div>
  <div class="footer">
    <p>${isSwedish ? 'Detta är ett automatiskt meddelande. Vänligen svara inte på detta e-postmeddelande.' : 'This is an automated message. Please do not reply to this email.'}</p>
  </div>
</body>
</html>
  `.trim();

  const guardianText = `
${isSwedish ? 'Hej' : 'Hello'},

${isSwedish 
  ? `Vi vill informera dig om att en intresseanmälan har skickats in för ${studentName} till Spånga TBK för`
  : `We would like to inform you that an interest application has been submitted for ${studentName} to Spånga TBK for`} ${sportType === 'tennis' ? (isSwedish ? 'Tennis' : 'Tennis') : (isSwedish ? 'Bordtennis' : 'Table Tennis')}.

${isSwedish
  ? 'Vi kommer att granska ansökan och återkommer så snart som möjligt.'
  : 'We will review the application and get back to you as soon as possible.'}

${isSwedish
  ? 'Om du har några frågor, tveka inte att kontakta oss.'
  : 'If you have any questions, please do not hesitate to contact us.'}

${isSwedish ? 'Med vänliga hälsningar,' : 'Best regards,'}
Spånga TBK

---
${isSwedish ? 'Detta är ett automatiskt meddelande. Vänligen svara inte på detta e-postmeddelande.' : 'This is an automated message. Please do not reply to this email.'}
  `.trim();

  // Send email to all unique guardian emails (excluding student email)
  for (const email of uniqueGuardianEmails) {
    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: isSwedish
            ? `Intresseanmälan mottagen för ${studentName} - Spånga TBK`
            : `Application Received for ${studentName} - Spånga TBK`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: guardianHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: guardianText,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await sesClient.send(command);
      console.log(`Guardian confirmation email sent to ${email}`);
    } catch (error) {
      // Log error but don't fail the request if email fails
      console.error(`Failed to send guardian email to ${email}:`, error);
    }
  }
}

// Format preferred times for display
function formatPreferredTimes(times: Array<{ day: string; from: string; to: string }> | null): string {
  if (!times || times.length === 0) {
    return 'Inga önskemål angivna';
  }

  const dayNames: Record<string, string> = {
    monday: 'Måndag',
    tuesday: 'Tisdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lördag',
    sunday: 'Söndag',
  };

  return times
    .map((time) => {
      const dayName = dayNames[time.day] || time.day;
      return `${dayName}: ${time.from}:00 - ${time.to}:00`;
    })
    .join('<br>');
}

// Format levels for display
function formatLevels(
  sportType: string,
  tennisLevels: string[] | null,
  tableTennisLevels: string[] | null
): string {
  const t = translations.sv;
  
  if (sportType === 'tennis' && tennisLevels && tennisLevels.length > 0) {
    return tennisLevels.map((level) => t.levels.tennis[level as keyof typeof t.levels.tennis] || level).join(', ');
  }
  
  if (sportType === 'table_tennis' && tableTennisLevels && tableTennisLevels.length > 0) {
    return tableTennisLevels.map((level) => t.levels.tableTennis[level as keyof typeof t.levels.tableTennis] || level).join(', ');
  }
  
  return 'Inga nivåer valda';
}

// Build HTML email template for club notification
function buildClubNotificationEmailHtml(application: Application): string {
  const studentName = `${application.student_first_name} ${application.student_last_name}`;
  const sportName = application.sport_type === 'tennis' ? 'Tennis' : 'Bordtennis';
  const levels = formatLevels(application.sport_type, application.tennis_levels, application.table_tennis_levels);
  const preferredTimes = formatPreferredTimes(application.preferred_times);
  const submittedDate = new Date(application.submitted_at || application.created_at).toLocaleString('sv-SE');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 12px;
    }
    .info-row {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #4b5563;
      display: inline-block;
      min-width: 180px;
    }
    .info-value {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ny intresseanmälan - Spånga TBK</h1>
  </div>
  <div class="content">
    <div class="info-section">
      <div class="section-title">Sport & Nivåer</div>
      <div class="info-row">
        <span class="info-label">Sport:</span>
        <span class="info-value">${sportName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Nivåer:</span>
        <span class="info-value">${levels}</span>
      </div>
      ${application.interest_areas ? `
      <div class="info-row">
        <span class="info-label">Intresseområden:</span>
        <span class="info-value">${application.interest_areas}</span>
      </div>
      ` : ''}
    </div>

    <div class="info-section">
      <div class="section-title">Elevinformation</div>
      <div class="info-row">
        <span class="info-label">Namn:</span>
        <span class="info-value">${studentName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Personnummer:</span>
        <span class="info-value">${application.student_personal_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ålder:</span>
        <span class="info-value">${application.student_age ? `${application.student_age} år` : 'Okänt'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Telefon:</span>
        <span class="info-value">${application.student_phone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">E-post:</span>
        <span class="info-value">${application.student_email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Adress:</span>
        <span class="info-value">${application.student_address}</span>
      </div>
    </div>

    ${application.has_guardian ? `
    <div class="info-section">
      <div class="section-title">Målsmansinformation</div>
      ${application.guardian_1_name ? `
      <div class="info-row">
        <span class="info-label">Målsman 1 - Namn:</span>
        <span class="info-value">${application.guardian_1_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Målsman 1 - E-post:</span>
        <span class="info-value">${application.guardian_1_email || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Målsman 1 - Telefon:</span>
        <span class="info-value">${application.guardian_1_phone || '-'}</span>
      </div>
      ` : ''}
      ${application.guardian_2_name ? `
      <div class="info-row" style="margin-top: 15px;">
        <span class="info-label">Målsman 2 - Namn:</span>
        <span class="info-value">${application.guardian_2_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Målsman 2 - E-post:</span>
        <span class="info-value">${application.guardian_2_email || '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Målsman 2 - Telefon:</span>
        <span class="info-value">${application.guardian_2_phone || '-'}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <div class="info-section">
      <div class="section-title">Önskade träningsdagar och tider</div>
      <div class="info-value" style="margin-top: 8px;">${preferredTimes}</div>
    </div>

    ${application.other_wishes ? `
    <div class="info-section">
      <div class="section-title">Övriga önskemål</div>
      <div class="info-value" style="margin-top: 8px;">${application.other_wishes}</div>
    </div>
    ` : ''}

    <div class="info-section">
      <div class="section-title">Samtycken</div>
      <div class="info-row">
        <span class="info-label">Gruppfotografering:</span>
        <span class="info-value">${application.group_photo_consent ? 'Ja' : 'Nej'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Villkor bekräftade:</span>
        <span class="info-value">${application.terms_confirmed ? 'Ja' : 'Nej'}</span>
      </div>
    </div>

    <div class="info-section">
      <div class="section-title">Systeminformation</div>
      <div class="info-row">
        <span class="info-label">Ansöknings-ID:</span>
        <span class="info-value">${application.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Inskickad:</span>
        <span class="info-value">${submittedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">${translations.sv.status[application.status] || application.status}</span>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>Detta är ett automatiskt meddelande från intresseanmälan-systemet.</p>
    <p>Logga in på adminpanelen för att hantera denna ansökan.</p>
  </div>
</body>
</html>
  `.trim();
}

// Build plain text version of club notification email
function buildClubNotificationEmailText(application: Application): string {
  const studentName = `${application.student_first_name} ${application.student_last_name}`;
  const sportName = application.sport_type === 'tennis' ? 'Tennis' : 'Bordtennis';
  const levels = formatLevels(application.sport_type, application.tennis_levels, application.table_tennis_levels);
  const submittedDate = new Date(application.submitted_at || application.created_at).toLocaleString('sv-SE');

  const preferredTimesText = application.preferred_times && application.preferred_times.length > 0
    ? application.preferred_times
        .map((time) => {
          const dayNames: Record<string, string> = {
            monday: 'Måndag',
            tuesday: 'Tisdag',
            wednesday: 'Onsdag',
            thursday: 'Torsdag',
            friday: 'Fredag',
            saturday: 'Lördag',
            sunday: 'Söndag',
          };
          const dayName = dayNames[time.day] || time.day;
          return `${dayName}: ${time.from}:00 - ${time.to}:00`;
        })
        .join('\n')
    : 'Inga önskemål angivna';

  return `
NY INTRESSEANMÄLAN - SPÅNGA TBK

SPORT & NIVÅER
Sport: ${sportName}
Nivåer: ${levels}
${application.interest_areas ? `Intresseområden: ${application.interest_areas}` : ''}

ELEVINFORMATION
Namn: ${studentName}
Personnummer: ${application.student_personal_number}
Ålder: ${application.student_age ? `${application.student_age} år` : 'Okänt'}
Telefon: ${application.student_phone}
E-post: ${application.student_email}
Adress: ${application.student_address}

${application.has_guardian ? `
MÅLSMANSINFORMATION
${application.guardian_1_name ? `
Målsman 1 - Namn: ${application.guardian_1_name}
Målsman 1 - E-post: ${application.guardian_1_email || '-'}
Målsman 1 - Telefon: ${application.guardian_1_phone || '-'}
` : ''}
${application.guardian_2_name ? `
Målsman 2 - Namn: ${application.guardian_2_name}
Målsman 2 - E-post: ${application.guardian_2_email || '-'}
Målsman 2 - Telefon: ${application.guardian_2_phone || '-'}
` : ''}
` : ''}

ÖNSKADE TRÄNINGSDAGAR OCH TIDER
${preferredTimesText}

${application.other_wishes ? `
ÖVRIGA ÖNSKEMÅL
${application.other_wishes}
` : ''}

SAMTYCCEN
Gruppfotografering: ${application.group_photo_consent ? 'Ja' : 'Nej'}
Villkor bekräftade: ${application.terms_confirmed ? 'Ja' : 'Nej'}

SYSTEMINFORMATION
Ansöknings-ID: ${application.id}
Inskickad: ${submittedDate}
Status: ${translations.sv.status[application.status] || application.status}

---
Detta är ett automatiskt meddelande från intresseanmälan-systemet.
Logga in på adminpanelen för att hantera denna ansökan.
  `.trim();
}

// Send notification email to tennis club
export async function sendClubNotificationEmail(application: Application): Promise<void> {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  const clubEmail = process.env.AWS_SES_CLUB_EMAIL;
  
  if (!fromEmail) {
    console.warn('AWS_SES_FROM_EMAIL not configured, skipping club notification email');
    return;
  }

  if (!clubEmail) {
    console.warn('AWS_SES_CLUB_EMAIL not configured, skipping club notification email');
    return;
  }

  const studentName = `${application.student_first_name} ${application.student_last_name}`;

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [clubEmail],
    },
    Message: {
      Subject: {
        Data: `Ny intresseanmälan: ${studentName} - Spånga TBK`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: buildClubNotificationEmailHtml(application),
          Charset: 'UTF-8',
        },
        Text: {
          Data: buildClubNotificationEmailText(application),
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Club notification email sent to ${clubEmail}`);
  } catch (error) {
    // Log error but don't fail the request if email fails
    console.error('Failed to send club notification email:', error);
  }
}

