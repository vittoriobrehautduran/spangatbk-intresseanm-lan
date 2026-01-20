import { z } from 'zod';
import type { TennisLevel, TableTennisLevel } from '@/types/database';
import type { Language } from './translations';
import { translations } from './translations';

export const createApplicationFormSchema = (language: Language = 'sv') => {
  const t = translations[language];

  const preferredTimeSchema = z.object({
    day: z.string().min(1, t.form.required),
    from: z.string().min(1, language === 'sv' ? 'Välj en timme (07-22)' : 'Select an hour (07-22)').regex(/^(0[7-9]|1[0-9]|2[0-2])$/, language === 'sv' ? 'Välj en timme (07-22)' : 'Select an hour (07-22)'),
    to: z.string().min(1, language === 'sv' ? 'Välj en timme (07-22)' : 'Select an hour (07-22)').regex(/^(0[7-9]|1[0-9]|2[0-2])$/, language === 'sv' ? 'Välj en timme (07-22)' : 'Select an hour (07-22)'),
  });

  const guardianSchema = z.object({
    name: z.string().min(1, t.form.required),
    email: z.string().email(t.form.invalidEmail),
    phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, t.form.invalidPhone).min(7, t.form.invalidPhone),
  });

  // Swedish personal number: YYYYMMDD-XXXX (12 digits total, with optional dash)
  const personalNumberRegex = /^(\d{8})-?(\d{4})$/;

  // Phone number: allows digits, spaces, dashes, plus, parentheses
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;

  // Address: must contain at least 5 characters and include letters/numbers
  const addressRegex = /^[\w\s\-\.,#åäöÅÄÖ]+$/;

  return z
    .object({
      sportType: z.enum(['tennis', 'table_tennis']),
      tennisLevels: z.array(z.enum(['boll-lekis', 'minitennis', 'juniortennis', 'vuxentennis', 'veterantennis_med_tranare'])).optional(),
      tableTennisLevels: z.array(z.enum(['boll-lekis', 'juniorbordtennis', 'seniorbordtennis_med_tranare', 'veteranbordtennis_med_tranare'])).optional(),
      interestAreas: z.string().optional(),
      studentFirstName: z.string().min(1, t.form.required),
      studentLastName: z.string().min(1, t.form.required),
      studentPersonalNumber: z
        .string()
        .regex(personalNumberRegex, t.form.invalidPersonalNumber)
        .refine((val) => {
          const cleaned = val.replace(/-/g, '');
          return cleaned.length === 12 && /^\d{12}$/.test(cleaned);
        }, {
          message: t.form.invalidPersonalNumber,
        }),
      studentPhone: z.string().regex(phoneRegex, t.form.invalidPhone).min(7, t.form.invalidPhone),
      studentAddress: z
        .string()
        .min(1, t.form.required)
        .regex(addressRegex, language === 'sv' ? 'Ogiltig adress' : 'Invalid address'),
      studentPostalCode: z
        .string()
        .min(1, t.form.required)
        .regex(/^\d{3}\s\d{2}$/, language === 'sv' ? 'Postnummer måste vara i formatet XXX XX (t.ex. 163 70)' : 'Postal code must be in format XXX XX (e.g. 163 70)'),
      studentCity: z
        .string()
        .min(1, t.form.required)
        .regex(/^[a-zA-Z\s\-åäöÅÄÖ]+$/, language === 'sv' ? 'Ogiltig ort' : 'Invalid city'),
      studentEmail: z.string().email(t.form.invalidEmail),
      hasGuardian: z.boolean(),
      guardian1: guardianSchema.optional(),
      guardian2: guardianSchema.optional(),
      groupPhotoConsent: z.boolean(),
      termsConfirmed: z.boolean().refine((val) => val === true, {
        message: language === 'sv'
          ? 'Du måste bekräfta att du tagit del av informationen'
          : 'You must confirm that you have read the information',
      }),
      preferredTimes: z.array(preferredTimeSchema).min(1, t.form.atLeastOneTime),
      otherWishes: z.string().optional(),
      courtTimeSuggestion: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.sportType === 'tennis') {
          return data.tennisLevels && data.tennisLevels.length > 0;
        } else {
          return data.tableTennisLevels && data.tableTennisLevels.length > 0;
        }
      },
      {
        message: language === 'sv'
          ? 'Välj minst en nivå för vald sport'
          : 'Select at least one level for the chosen sport',
        path: ['sportType'],
      }
    )
    .refine(
      (data) => {
        // Calculate age from personal number
        const personalNumber = data.studentPersonalNumber || '';
        const cleaned = personalNumber.replace(/-/g, '');
        if (cleaned.length < 8) return true; // Can't calculate age, skip validation
        
        const year = parseInt(cleaned.substring(0, 4), 10);
        const month = parseInt(cleaned.substring(4, 6), 10);
        const day = parseInt(cleaned.substring(6, 8), 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return true;
        
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // If under 18, guardian is required
        if (age < 18) {
          return data.guardian1 !== undefined;
        }
        return true;
      },
      {
        message: t.form.atLeastOneGuardian,
        path: ['guardian1'],
      }
    );
};

// Default schema for backwards compatibility
export const applicationFormSchema = createApplicationFormSchema('sv');

export type ApplicationFormData = z.infer<ReturnType<typeof createApplicationFormSchema>>;

