'use client';

import { useState, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { ApplicationFormData } from '@/lib/validation';
import type { Language } from '@/lib/translations';
import { translations } from '@/lib/translations';
import { format } from 'date-fns';

interface ApplicationFormProps {
    form: UseFormReturn<ApplicationFormData>;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    onPreview: () => void;
}

export default function ApplicationForm({ form, language, onLanguageChange, onPreview }: ApplicationFormProps) {
    const t = translations[language];
    const { register, watch, setValue, formState: { errors, touchedFields, isValid } } = form;
    const [formValid, setFormValid] = useState(false);
    const [ageLevelError, setAgeLevelError] = useState<string | null>(null);
    const [visibleTooltip, setVisibleTooltip] = useState<string | null>(null);
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Trigger validation when form values change to update isValid state
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const triggerValidation = async () => {
            const result = await form.trigger(undefined, { shouldFocus: false });
            setFormValid(result);
        };

        // Debounce validation to avoid too frequent checks
        const debouncedValidation = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                triggerValidation();
            }, 300);
        };

        // Initial validation
        triggerValidation();

        const subscription = form.watch(() => {
            debouncedValidation();
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [form]);

    // Cleanup tooltip timeout on unmount
    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
        };
    }, []);

    const sportType = watch('sportType');
    const studentPersonalNumber = watch('studentPersonalNumber');
    const guardian1 = watch('guardian1');
    const guardian2 = watch('guardian2');
    const preferredTimes = watch('preferredTimes') || [];
    const tennisLevelsSelected = watch('tennisLevels') || [];
    const tableTennisLevelsSelected = watch('tableTennisLevels') || [];

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

    const studentAge = calculateAgeFromPersonalNumber(studentPersonalNumber || '');
    const isUnder18 = studentAge !== null && studentAge < 18;

    // Automatically set hasGuardian based on age
    useEffect(() => {
        if (isUnder18) {
            setValue('hasGuardian', true, { shouldValidate: true });
        } else {
            setValue('hasGuardian', false, { shouldValidate: true });
        }
    }, [isUnder18, setValue]);

    const daysOfWeek = [
        { key: 'monday', label: t.form.monday },
        { key: 'tuesday', label: t.form.tuesday },
        { key: 'wednesday', label: t.form.wednesday },
        { key: 'thursday', label: t.form.thursday },
        { key: 'friday', label: t.form.friday },
        { key: 'saturday', label: t.form.saturday },
        { key: 'sunday', label: t.form.sunday },
    ];

    // Generate hours 07:00-22:00
    const hours = Array.from({ length: 16 }, (_, i) => {
        const hour = (i + 7).toString().padStart(2, '0');
        return { value: hour, label: `${hour}:00` };
    });

    const tennisLevels = [
        { value: 'boll-lekis', label: t.levels.tennis['boll-lekis'] },
        { value: 'minitennis', label: t.levels.tennis['minitennis'] },
        { value: 'juniortennis', label: t.levels.tennis['juniortennis'] },
        { value: 'vuxentennis', label: t.levels.tennis['vuxentennis'] },
        { value: 'veterantennis_med_tranare', label: t.levels.tennis['veterantennis_med_tranare'] },
    ];

    const tableTennisLevels = [
        { value: 'boll-lekis', label: t.levels.tableTennis['boll-lekis'] },
        { value: 'juniorbordtennis', label: t.levels.tableTennis['juniorbordtennis'] },
        { value: 'seniorbordtennis_med_tranare', label: t.levels.tableTennis['seniorbordtennis_med_tranare'] },
        { value: 'veteranbordtennis_med_tranare', label: t.levels.tableTennis['veteranbordtennis_med_tranare'] },
    ];

    const validateAgeLevel = (level: string, type: 'tennis' | 'table_tennis'): boolean => {
        if (studentAge === null) return true; // Can't validate without age
        
        // Check if 10-17 years old selecting vuxentennis or boll-lekis
        if (studentAge >= 10 && studentAge <= 17) {
            if (level === 'vuxentennis' || level === 'boll-lekis') {
                setAgeLevelError(t.form.inappropriateAgeLevel);
                return false;
            }
        }
        
        // Check if 18+ years old selecting boll-lekis
        if (studentAge >= 18) {
            if (level === 'boll-lekis') {
                setAgeLevelError(t.form.inappropriateAgeLevel);
                return false;
            }
        }
        
        // Check if 30+ years old selecting juniortennis or boll-lekis
        if (studentAge >= 30) {
            if (level === 'juniortennis' || level === 'boll-lekis') {
                setAgeLevelError(t.form.inappropriateAgeLevel);
                return false;
            }
        }
        
        setAgeLevelError(null);
        return true;
    };

    const handleTooltipClick = (tooltipId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear existing timeout
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        
        // Toggle tooltip - if same tooltip is clicked, close it
        if (visibleTooltip === tooltipId) {
            setVisibleTooltip(null);
        } else {
            // Show tooltip
            setVisibleTooltip(tooltipId);
            
            // Hide after 5 seconds
            tooltipTimeoutRef.current = setTimeout(() => {
                setVisibleTooltip(null);
            }, 5000);
        }
    };

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking on tooltip icon or tooltip content
            if (target.closest('[data-tooltip-icon]') || target.closest('[data-tooltip-content]')) {
                return;
            }
            
            if (visibleTooltip) {
                setVisibleTooltip(null);
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                }
            }
        };

        if (visibleTooltip) {
            // Use a small delay to avoid immediate closure when opening
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [visibleTooltip]);

    const handleLevelChange = (level: string, checked: boolean, type: 'tennis' | 'table_tennis') => {
        const currentLevels = watch(type === 'tennis' ? 'tennisLevels' : 'tableTennisLevels') || [];
        
        if (checked) {
            // Validate age before adding
            if (!validateAgeLevel(level, type)) {
                return; // Don't add if validation fails
            }
            setValue(type === 'tennis' ? 'tennisLevels' : 'tableTennisLevels', [...currentLevels, level] as any);
        } else {
            setValue(
                type === 'tennis' ? 'tennisLevels' : 'tableTennisLevels',
                currentLevels.filter((l: string) => l !== level) as any
            );
            // Clear error if unchecking
            setAgeLevelError(null);
        }
    };

    const handleAddGuardian = () => {
        if (!guardian1) {
            setValue('guardian1', { name: '', email: '', phone: '' });
            setValue('hasGuardian', true);
        } else if (!guardian2) {
            setValue('guardian2', { name: '', email: '', phone: '' });
        }
    };

    const handleRemoveGuardian = (guardianNumber: 1 | 2) => {
        if (guardianNumber === 1) {
            setValue('guardian1', undefined);
            if (!guardian2) {
                setValue('hasGuardian', false);
            } else {
                setValue('guardian1', guardian2);
                setValue('guardian2', undefined);
            }
        } else {
            setValue('guardian2', undefined);
        }
    };

    const handleAddTime = () => {
        const current = preferredTimes || [];
        // If no times exist, add first one, otherwise add new one
        if (current.length === 0) {
            setValue('preferredTimes', [{ day: 'monday', from: '', to: '' }]);
        } else {
            setValue('preferredTimes', [...current, { day: 'monday', from: '', to: '' }]);
        }
    };

    const handleRemoveTime = (index: number) => {
        const current = preferredTimes || [];
        setValue('preferredTimes', current.filter((_: any, i: number) => i !== index));
    };

    const handleTimeChange = (index: number, field: 'day' | 'from' | 'to', value: string) => {
        const current = preferredTimes || [];
        const updated = [...current];
        // Ensure the index exists in the array
        if (!updated[index]) {
            updated[index] = { day: 'monday', from: '', to: '' };
        }
        updated[index] = { ...updated[index], [field]: value };
        // Don't filter - let validation handle incomplete entries
        // This allows users to add multiple days and fill them in any order
        setValue('preferredTimes', updated, { shouldValidate: true });
    };

    // Auto-format personal number: YYYYMMDD-XXXX
    const handlePersonalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^\d]/g, ''); // Remove all non-digits

        // Limit to 12 digits
        if (value.length > 12) {
            value = value.slice(0, 12);
        }

        // Add dash after 8 digits
        if (value.length > 8) {
            value = value.slice(0, 8) + '-' + value.slice(8);
        }

        setValue('studentPersonalNumber', value, { shouldValidate: true });
        // Clear age level error when personal number changes
        setAgeLevelError(null);
    };

    // Re-validate selected levels when age changes
    useEffect(() => {
        if (studentAge !== null) {
            const levelsToCheck = sportType === 'tennis' ? tennisLevelsSelected : tableTennisLevelsSelected;
            let hasError = false;
            
            for (const level of levelsToCheck) {
                if (!validateAgeLevel(level, sportType)) {
                    hasError = true;
                    break;
                }
            }
            
            if (!hasError) {
                setAgeLevelError(null);
            }
        }
    }, [studentAge, sportType, tennisLevelsSelected, tableTennisLevelsSelected]);

    // Format phone number (allow digits, spaces, dashes, plus, parentheses)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'studentPhone' | 'guardian1.phone' | 'guardian2.phone') => {
        const value = e.target.value;
        // Allow digits, spaces, dashes, plus, parentheses
        const cleaned = value.replace(/[^\d\s\-\+\(\)]/g, '');
        setValue(field as any, cleaned, { shouldValidate: true });
    };


    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 overflow-x-hidden">
            <form className="space-y-4 sm:space-y-5">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 relative overflow-x-hidden overflow-y-visible">
                    {/* Language selector at top right corner */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
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

                    {/* Logo inside form box */}
                    <div className="mb-4 sm:mb-5">
                        <img
                            src="/images/logo.jpg"
                            alt="Spånga TBK Logo"
                            className="h-16 sm:h-20 w-auto object-contain"
                        />
                    </div>
                    <div className="mb-2">
                        <h2 className="text-lg sm:text-xl font-bold text-red-600">{t.form.bindingRegistration}</h2>
                    </div>
                    <p className="text-base sm:text-lg font-medium text-gray-600 mb-3 sm:mb-4">
                        {t.form.date}: {format(new Date(), 'yyyy-MM-dd')}
                    </p>

                    <div className="mb-4 sm:mb-5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                            {t.form.sportInterest}
                        </label>
                        <div className="space-y-2 sm:space-y-2.5">
                            <label className="flex items-center cursor-pointer py-1.5 sm:py-2">
                                <input
                                    type="radio"
                                    value="tennis"
                                    {...register('sportType')}
                                    className="mr-3 sm:mr-4"
                                />
                                <span className="text-base sm:text-lg text-gray-900 font-medium">{t.form.tennis}</span>
                            </label>
                            <label className="flex items-center cursor-pointer py-1.5 sm:py-2">
                                <input
                                    type="radio"
                                    value="table_tennis"
                                    {...register('sportType')}
                                    className="mr-3 sm:mr-4"
                                />
                                <span className="text-base sm:text-lg text-gray-900 font-medium">{t.form.tableTennis}</span>
                            </label>
                        </div>
                        {errors.sportType && touchedFields.sportType && (
                            <p className="text-red-600 text-base sm:text-lg font-medium mt-1 sm:mt-2">{errors.sportType.message}</p>
                        )}
                    </div>

                    {sportType === 'tennis' && (
                        <div className="mb-4 sm:mb-5">
                            <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                {t.form.tennis}
                            </label>
                            <div className="space-y-1.5 sm:space-y-2">
                                {tennisLevels.map((level) => (
                                    <label key={level.value} className="flex items-center cursor-pointer py-1.5 sm:py-2">
                                        <input
                                            type="checkbox"
                                            checked={(watch('tennisLevels') || []).includes(level.value as any)}
                                            onChange={(e) => handleLevelChange(level.value, e.target.checked, 'tennis')}
                                            className="mr-3 sm:mr-4"
                                        />
                                        <span className="text-base sm:text-lg text-gray-900">{level.label}</span>
                                        <div className="relative ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <svg
                                                data-tooltip-icon
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 cursor-help"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                onClick={(e) => handleTooltipClick(`tennis-${level.value}`, e)}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div 
                                                data-tooltip-content
                                                className={`fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-80 sm:w-96 p-4 bg-gray-900 text-white text-sm sm:text-base rounded-lg transition-opacity duration-300 z-50 shadow-xl ${
                                                    visibleTooltip === `tennis-${level.value}` ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                                style={{ maxWidth: 'calc(100vw - 2rem)' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {t.levelDescriptions.tennis[level.value]}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {ageLevelError && (
                                <p className="text-red-600 text-base sm:text-lg font-medium mt-1 sm:mt-2">{ageLevelError}</p>
                            )}
                        </div>
                    )}

                    {sportType === 'table_tennis' && (
                        <div className="mb-4 sm:mb-5">
                            <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                                {t.form.tableTennis}
                            </label>
                            <div className="space-y-1.5 sm:space-y-2">
                                {tableTennisLevels.map((level) => (
                                    <label key={level.value} className="flex items-center cursor-pointer py-1.5 sm:py-2">
                                        <input
                                            type="checkbox"
                                            checked={(watch('tableTennisLevels') || []).includes(level.value as any)}
                                            onChange={(e) => handleLevelChange(level.value, e.target.checked, 'table_tennis')}
                                            className="mr-3 sm:mr-4"
                                        />
                                        <span className="text-base sm:text-lg text-gray-900">{level.label}</span>
                                        <div className="relative ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <svg
                                                data-tooltip-icon
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 cursor-help"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                onClick={(e) => handleTooltipClick(`tabletennis-${level.value}`, e)}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div 
                                                data-tooltip-content
                                                className={`fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-80 sm:w-96 p-4 bg-gray-900 text-white text-sm sm:text-base rounded-lg transition-opacity duration-300 z-50 shadow-xl ${
                                                    visibleTooltip === `tabletennis-${level.value}` ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                                style={{ maxWidth: 'calc(100vw - 2rem)' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {t.levelDescriptions.tableTennis[level.value]}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {ageLevelError && (
                                <p className="text-red-600 text-base sm:text-lg font-medium mt-1 sm:mt-2">{ageLevelError}</p>
                            )}
                        </div>
                    )}

                    <div className="mb-4 sm:mb-5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                            {t.form.interestAreas} <span className="text-gray-500 font-normal">{t.form.optional}</span>
                        </label>
                        <p className="text-base sm:text-lg text-gray-700 mb-2 sm:mb-2.5 font-medium">{t.form.writeInterest}</p>
                        <textarea
                            {...register('interestAreas')}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-visible">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t.form.studentInfo}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mb-3 sm:mb-3.5">
                        <div>
                            <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                                {t.form.studentFirstName} <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('studentFirstName')}
                                placeholder={language === 'sv' ? 'Förnamn' : 'First name'}
                                className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentFirstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.studentFirstName && touchedFields.studentFirstName && (
                                <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentFirstName.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                                {t.form.studentLastName} <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('studentLastName')}
                                placeholder={language === 'sv' ? 'Efternamn' : 'Last name'}
                                className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentLastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.studentLastName && touchedFields.studentLastName && (
                                <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentLastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-3 sm:mb-3.5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                            {t.form.personalNumber} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('studentPersonalNumber')}
                            onChange={handlePersonalNumberChange}
                            placeholder="YYYYMMDD-XXXX"
                            maxLength={13}
                            className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentPersonalNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.studentPersonalNumber && touchedFields.studentPersonalNumber && (
                            <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentPersonalNumber.message}</p>
                        )}
                    </div>

                    <div className="mb-3 sm:mb-3.5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                            {t.form.phone} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="tel"
                            {...register('studentPhone')}
                            onChange={(e) => handlePhoneChange(e, 'studentPhone')}
                            placeholder="+46 70 123 45 67"
                            className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentPhone ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.studentPhone && touchedFields.studentPhone && (
                            <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentPhone.message}</p>
                        )}
                    </div>

                    <div className="mb-3 sm:mb-3.5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                            {t.form.address} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('studentAddress')}
                            placeholder={language === 'sv' ? 'Gatunamn 123, Postnummer Stad' : 'Street Name 123, Postal Code City'}
                            className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentAddress ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.studentAddress && touchedFields.studentAddress && (
                            <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentAddress.message}</p>
                        )}
                    </div>

                    <div className="mb-3 sm:mb-3.5">
                        <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
                            {t.form.email} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('studentEmail')}
                            className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.studentEmail ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.studentEmail && touchedFields.studentEmail && (
                            <p className="text-red-600 text-base sm:text-lg font-medium mt-1">{errors.studentEmail.message}</p>
                        )}
                    </div>

                </div>

                {isUnder18 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {t.form.guardianInfo} {isUnder18 && <span className="text-base sm:text-lg font-normal text-gray-600">({t.form.guardianInfoNote})</span>}
                        </h2>
                        {isUnder18 && (
                            <p className="text-base sm:text-lg font-semibold text-red-600 mb-3 sm:mb-4">
                                {t.form.atLeastOneGuardian}
                            </p>
                        )}

                        {!guardian1 && (
                            <button
                                type="button"
                                onClick={handleAddGuardian}
                                className="mb-3 text-blue-600 hover:text-blue-800 text-base sm:text-lg font-semibold"
                            >
                                + {t.form.addGuardian}
                            </button>
                        )}

                        {guardian1 && (
                            <div className="mb-3 p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-md">
                                <div className="flex justify-between items-center mb-2 sm:mb-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t.form.guardianName} 1 <span className="text-red-600">*</span></h3>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGuardian(1)}
                                        className="text-red-600 hover:text-red-800 text-base sm:text-lg font-medium"
                                    >
                                        {language === 'sv' ? 'Ta bort' : 'Remove'}
                                    </button>
                                </div>
                                <div className="space-y-2 sm:space-y-2.5">
                                    <input
                                        type="text"
                                        {...register('guardian1.name')}
                                        placeholder={t.form.guardianName}
                                        className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.guardian1?.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.guardian1?.name && touchedFields.guardian1?.name && (
                                        <p className="text-red-600 text-base sm:text-lg font-medium">{errors.guardian1.name.message}</p>
                                    )}
                                    <input
                                        type="email"
                                        {...register('guardian1.email')}
                                        placeholder={t.form.email}
                                        className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.guardian1?.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.guardian1?.email && touchedFields.guardian1?.email && (
                                        <p className="text-red-600 text-base sm:text-lg font-medium">{errors.guardian1.email.message}</p>
                                    )}
                                    <input
                                        type="tel"
                                        {...register('guardian1.phone')}
                                        onChange={(e) => handlePhoneChange(e, 'guardian1.phone')}
                                        placeholder={t.form.phone}
                                        className={`w-full border rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg ${errors.guardian1?.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.guardian1?.phone && touchedFields.guardian1?.phone && (
                                        <p className="text-red-600 text-base sm:text-lg font-medium">{errors.guardian1.phone.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {guardian1 && !guardian2 && (
                            <button
                                type="button"
                                onClick={handleAddGuardian}
                                className="mb-3 text-blue-600 hover:text-blue-800 text-base sm:text-lg font-semibold"
                            >
                                + {t.form.addGuardian}
                            </button>
                        )}

                        {guardian2 && (
                            <div className="mb-3 p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-md">
                                <div className="flex justify-between items-center mb-2 sm:mb-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t.form.guardianName} 2</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGuardian(2)}
                                        className="text-red-600 hover:text-red-800 text-base sm:text-lg font-medium"
                                    >
                                        {language === 'sv' ? 'Ta bort' : 'Remove'}
                                    </button>
                                </div>
                                <div className="space-y-2 sm:space-y-2.5">
                                    <input
                                        type="text"
                                        {...register('guardian2.name')}
                                        placeholder={t.form.guardianName}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                    />
                                    <input
                                        type="email"
                                        {...register('guardian2.email')}
                                        placeholder={t.form.email}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                    />
                                    <input
                                        type="tel"
                                        {...register('guardian2.phone')}
                                        onChange={(e) => handlePhoneChange(e, 'guardian2.phone')}
                                        placeholder={t.form.phone}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t.form.groupPhotoConsent}</h2>
                    <p className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">{t.form.groupPhotoQuestion}</p>
                    <div className="flex gap-3 sm:gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                checked={watch('groupPhotoConsent') === true}
                                onChange={() => setValue('groupPhotoConsent', true)}
                                className="mr-2 sm:mr-3"
                            />
                            <span className="text-base sm:text-lg text-gray-900 font-medium">{t.form.yes}</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                checked={watch('groupPhotoConsent') === false}
                                onChange={() => setValue('groupPhotoConsent', false)}
                                className="mr-2 sm:mr-3"
                            />
                            <span className="text-base sm:text-lg text-gray-900 font-medium">{t.form.no}</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6" id="preferred-times-section">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {t.form.preferredTimes} <span className="text-red-600">*</span>
                    </h2>
                    <p className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">{t.form.preferredTimesNote}</p>

                    {preferredTimes.length === 0 ? (
                        <div className="mb-3 p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-md">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                        {language === 'sv' ? 'Dag' : 'Day'}
                                    </label>
                                    <select
                                        value="monday"
                                        onChange={(e) => {
                                            handleAddTime();
                                            setTimeout(() => {
                                                handleTimeChange(0, 'day', e.target.value);
                                            }, 0);
                                        }}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                    >
                                        {daysOfWeek.map((day) => (
                                            <option key={day.key} value={day.key}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                            {language === 'sv' ? 'Från' : 'From'}
                                        </label>
                                        <select
                                            onChange={(e) => {
                                                if (preferredTimes.length === 0) {
                                                    handleAddTime();
                                                }
                                                setTimeout(() => {
                                                    handleTimeChange(0, 'from', e.target.value);
                                                }, 0);
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                        >
                                            <option value="">{language === 'sv' ? 'Välj timme' : 'Select hour'}</option>
                                            {hours.map((hour) => (
                                                <option key={hour.value} value={hour.value}>
                                                    {hour.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                            {language === 'sv' ? 'Till' : 'To'}
                                        </label>
                                        <select
                                            onChange={(e) => {
                                                if (preferredTimes.length === 0) {
                                                    handleAddTime();
                                                }
                                                setTimeout(() => {
                                                    handleTimeChange(0, 'to', e.target.value);
                                                }, 0);
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                        >
                                            <option value="">{language === 'sv' ? 'Välj timme' : 'Select hour'}</option>
                                            {hours.map((hour) => (
                                                <option key={hour.value} value={hour.value}>
                                                    {hour.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        preferredTimes.map((time, index) => (
                            <div key={index} className="mb-3 p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-md">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                        {language === 'sv' ? 'Träningsdag' : 'Training day'} {index + 1}
                                    </h3>
                                    {preferredTimes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTime(index)}
                                            className="text-red-600 hover:text-red-800 text-base sm:text-lg font-medium"
                                        >
                                            {language === 'sv' ? 'Ta bort' : 'Remove'}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                            {language === 'sv' ? 'Dag' : 'Day'}
                                        </label>
                                        <select
                                            value={time.day}
                                            onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                        >
                                            {daysOfWeek.map((day) => (
                                                <option key={day.key} value={day.key}>
                                                    {day.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                                {language === 'sv' ? 'Från' : 'From'}
                                            </label>
                                            <select
                                                value={time.from}
                                                onChange={(e) => handleTimeChange(index, 'from', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                            >
                                                <option value="">{language === 'sv' ? 'Välj timme' : 'Select hour'}</option>
                                                {hours.map((hour) => (
                                                    <option key={hour.value} value={hour.value}>
                                                        {hour.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1.5">
                                                {language === 'sv' ? 'Till' : 'To'}
                                            </label>
                                            <select
                                                value={time.to}
                                                onChange={(e) => handleTimeChange(index, 'to', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                                            >
                                                <option value="">{language === 'sv' ? 'Välj timme' : 'Select hour'}</option>
                                                {hours.map((hour) => (
                                                    <option key={hour.value} value={hour.value}>
                                                        {hour.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {errors.preferredTimes && index === 0 && touchedFields.preferredTimes && (
                                    <p className="text-red-600 text-base sm:text-lg font-medium mt-2">{errors.preferredTimes.message}</p>
                                )}
                            </div>
                        ))
                    )}

                    <button
                        type="button"
                        onClick={handleAddTime}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-base sm:text-lg font-semibold"
                    >
                        + {language === 'sv' ? 'Lägg till träningsdag' : 'Add training day'}
                    </button>
                    {errors.preferredTimes && touchedFields.preferredTimes && preferredTimes.length === 0 && (
                        <p className="text-red-600 text-base sm:text-lg font-medium mt-2">{errors.preferredTimes.message}</p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                        {t.form.otherWishes} <span className="text-gray-500 font-normal">{t.form.optional}</span>
                    </label>
                    <textarea
                        {...register('otherWishes')}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-2.5 text-base sm:text-lg"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{t.form.importantInfo}</h2>
                    <div className="space-y-1.5 sm:space-y-2 text-base sm:text-lg text-gray-800 leading-relaxed">
                        <p className="font-medium">{t.form.importantInfo1}</p>
                        <p className="font-medium">{t.form.importantInfo2}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{t.form.confirmation}</h2>
                    <label className="flex items-start cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('termsConfirmed')}
                            className={`mt-1 mr-2 sm:mr-3 ${errors.termsConfirmed ? 'border-red-500' : ''
                                }`}
                        />
                        <span className={`text-base sm:text-lg font-medium ${errors.termsConfirmed ? 'text-red-600' : 'text-gray-900'
                            }`}>
                            {t.form.confirmText} <span className="text-red-600">*</span>
                        </span>
                    </label>
                    {errors.termsConfirmed && touchedFields.termsConfirmed && (
                        <p className="text-red-600 text-base sm:text-lg font-medium mt-1 sm:mt-2">{errors.termsConfirmed.message}</p>
                    )}
                </div>

                <div className="flex justify-end pb-4 sm:pb-6">
                    <button
                        type="button"
                        onClick={async () => {
                            const isValid = await form.trigger();
                            if (isValid) {
                                onPreview();
                            } else {
                                // Find first error field and scroll to it
                                const errors = form.formState.errors;
                                const errorFields = Object.keys(errors);
                                
                                if (errorFields.length > 0) {
                                    const firstErrorField = errorFields[0];
                                
                                    // Special handling for preferredTimes error - scroll to the section
                                    if (firstErrorField === 'preferredTimes') {
                                        const preferredTimesSection = document.getElementById('preferred-times-section');
                                        if (preferredTimesSection) {
                                            preferredTimesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            // Try to focus the first select element in the section
                                            setTimeout(() => {
                                                const firstSelect = preferredTimesSection.querySelector('select');
                                                if (firstSelect) {
                                                    firstSelect.focus();
                                                }
                                            }, 300);
                                            return;
                                        }
                                    }
                                
                                    // Try to find the input element by name attribute (React Hook Form sets this)
                                    let inputElement: HTMLElement | null = document.querySelector(
                                        `input[name="${firstErrorField}"], textarea[name="${firstErrorField}"], select[name="${firstErrorField}"]`
                                    ) as HTMLElement;
                                    
                                    // If not found, try nested fields (e.g., guardian1.name)
                                    if (!inputElement && firstErrorField.includes('.')) {
                                        const parts = firstErrorField.split('.');
                                        const nestedName = parts.join('.');
                                        inputElement = document.querySelector(
                                            `input[name="${nestedName}"], textarea[name="${nestedName}"], select[name="${nestedName}"]`
                                        ) as HTMLElement;
                                    }
                                    
                                    if (inputElement) {
                                        // Scroll to the input element
                                        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Focus the input for better UX
                                        setTimeout(() => {
                                            if (inputElement && 'focus' in inputElement) {
                                                (inputElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).focus();
                                            }
                                        }, 300);
                                    } else {
                                        // Fallback: scroll to top of form
                                        const formElement = document.querySelector('form');
                                        if (formElement) {
                                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        } else {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }
                                }
                            }
                        }}
                        title={formValid ? '' : (language === 'sv' ? 'Fyll i alla obligatoriska fält' : 'Fill in all required fields')}
                        className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-base sm:text-lg shadow-sm transition-colors ${formValid
                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-pointer hover:bg-gray-400'
                            }`}
                    >
                        {t.form.preview}
                    </button>
                </div>
            </form>
        </div>
    );
}

