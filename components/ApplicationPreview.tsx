'use client';

import { UseFormReturn } from 'react-hook-form';
import type { ApplicationFormData } from '@/lib/validation';
import type { Language } from '@/lib/translations';
import { translations } from '@/lib/translations';
import { format } from 'date-fns';

interface ApplicationPreviewProps {
    form: UseFormReturn<ApplicationFormData>;
    language: Language;
    onBack: () => void;
    onSubmit: (data: ApplicationFormData) => void;
    isSubmitting: boolean;
    onLanguageChange: (lang: Language) => void;
}

export default function ApplicationPreview({
    form,
    language,
    onBack,
    onSubmit,
    isSubmitting,
    onLanguageChange,
}: ApplicationPreviewProps) {
    const t = translations[language];
    const data = form.getValues();

    const handleSubmit = () => {
        onSubmit(data);
    };

    // Calculate age from personal number (YYYYMMDD-XXXX format)
    const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
        if (!personalNumber) return null;
        // Remove dash and extract first 8 digits (YYYYMMDD)
        const cleaned = personalNumber.replace(/-/g, '');
        if (cleaned.length < 8) return null;

        const year = parseInt(cleaned.substring(0, 4), 10);
        const month = parseInt(cleaned.substring(4, 6), 10);
        const day = parseInt(cleaned.substring(6, 8), 10);

        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const studentAge = calculateAgeFromPersonalNumber(data.studentPersonalNumber || '');

    const getSportLevels = () => {
        if (data.sportType === 'tennis' && data.tennisLevels) {
            return data.tennisLevels.map((level: string) => t.levels.tennis[level as keyof typeof t.levels.tennis]).join(', ');
        } else if (data.sportType === 'table_tennis' && data.tableTennisLevels) {
            return data.tableTennisLevels.map((level: string) => t.levels.tableTennis[level as keyof typeof t.levels.tableTennis]).join(', ');
        }
        return '-';
    };

    return (
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-5 relative">
                {/* Language selector at top right corner */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => onLanguageChange('sv')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${language === 'sv' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            SV
                        </button>
                        <button
                            type="button"
                            onClick={() => onLanguageChange('en')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 pr-16">{t.form.preview}</h1>

                <div className="space-y-4 sm:space-y-5">
                    <div>
                        <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.sportInterest}</h2>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold mb-1">
                            {data.sportType === 'tennis' ? t.form.tennis : t.form.tableTennis}
                        </p>
                        <p className="text-sm sm:text-base text-gray-700">{getSportLevels()}</p>
                    </div>

                    {data.interestAreas && (
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.interestAreas}</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{data.interestAreas}</p>
                        </div>
                    )}

                    <div>
                        <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.studentInfo}</h2>
                        <div className="space-y-1 sm:space-y-1.5 text-sm sm:text-base text-gray-700">
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.studentName}:</span> {data.studentFirstName} {data.studentLastName}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.personalNumber}:</span> {data.studentPersonalNumber}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.phone}:</span> {data.studentPhone}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.address}:</span> {data.studentAddress}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.postalCode}:</span> {data.studentPostalCode}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.city}:</span> {data.studentCity}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-900">{t.form.email}:</span> {data.studentEmail}
                            </p>
                            {studentAge !== null && (
                                <p>
                                    <span className="font-semibold text-gray-900">{language === 'sv' ? 'Ålder' : 'Age'}:</span> {studentAge}
                                </p>
                            )}
                        </div>
                    </div>

                    {(data.guardian1 || data.guardian2) && (
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.guardianInfo}</h2>
                            <div className="space-y-2 sm:space-y-3">
                                {data.guardian1 && (
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-md border border-gray-200">
                                        <p className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">{t.form.guardianName} 1:</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian1.name}</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian1.email}</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian1.phone}</p>
                                    </div>
                                )}
                                {data.guardian2 && (
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-md border border-gray-200">
                                        <p className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">{t.form.guardianName} 2:</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian2.name}</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian2.email}</p>
                                        <p className="text-sm sm:text-base text-gray-700">{data.guardian2.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.groupPhotoConsent}</h2>
                        <p className="text-sm sm:text-base text-gray-700 font-medium">
                            {data.groupPhotoConsent ? t.form.yes : t.form.no}
                        </p>
                    </div>

                    {data.preferredTimes && data.preferredTimes.length > 0 && (
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.preferredTimes}</h2>
                            <div className="space-y-2">
                                {data.preferredTimes.map((time: { day: string; from: string; to: string }, index: number) => {
                                    const dayLabel = Object.entries({
                                        monday: t.form.monday,
                                        tuesday: t.form.tuesday,
                                        wednesday: t.form.wednesday,
                                        thursday: t.form.thursday,
                                        friday: t.form.friday,
                                        saturday: t.form.saturday,
                                        sunday: t.form.sunday,
                                    }).find(([key]) => key === time.day)?.[1] || time.day;

                                    // Format time as HH:00 for display (24-hour format, whole hours only)
                                    const formatHour = (hour: string) => {
                                        if (!hour) return '';
                                        // If hour is already in format "HH", add ":00"
                                        if (/^\d{1,2}$/.test(hour)) {
                                            return `${hour.padStart(2, '0')}:00`;
                                        }
                                        return hour;
                                    };

                                    return (
                                        <div key={index} className="p-2.5 sm:p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <p className="text-sm sm:text-base text-gray-700 font-medium">
                                                {dayLabel}: {formatHour(time.from)} - {formatHour(time.to)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {data.courtTimeSuggestion && (
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.courtTimeSuggestion}</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{data.courtTimeSuggestion}</p>
                        </div>
                    )}

                    {data.otherWishes && (
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2">{t.form.otherWishes}</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{data.otherWishes}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pb-4 sm:pb-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-400 font-semibold text-sm sm:text-base transition-colors"
                    disabled={isSubmitting}
                >
                    {t.form.back}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                    {isSubmitting
                        ? language === 'sv'
                            ? 'Skickar...'
                            : 'Submitting...'
                        : t.form.submit}
                </button>
            </div>
        </div>
    );
}

