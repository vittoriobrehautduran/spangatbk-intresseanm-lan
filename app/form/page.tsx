'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createApplicationFormSchema, type ApplicationFormData } from '@/lib/validation';
import { translations, type Language } from '@/lib/translations';
import ApplicationForm from '@/components/ApplicationForm';
import ApplicationPreview from '@/components/ApplicationPreview';

export default function FormPage() {
  const [language, setLanguage] = useState<Language>('sv');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Create a resolver function that always uses current language
  const createResolver = (lang: Language) => {
    return zodResolver(createApplicationFormSchema(lang));
  };

  const form = useForm<ApplicationFormData>({
    resolver: createResolver(language),
    mode: 'onChange', // Validate on change to update isValid immediately
    reValidateMode: 'onChange', // Re-validate on change after first error
    defaultValues: {
      sportType: 'tennis',
      tennisLevels: [],
      tableTennisLevels: [],
      interestAreas: '',
      studentFirstName: '',
      studentLastName: '',
      studentPersonalNumber: '',
      studentPhone: '',
      studentAddress: '',
      studentEmail: '',
      hasGuardian: false,
      guardian1: undefined,
      guardian2: undefined,
      groupPhotoConsent: false,
      termsConfirmed: false,
      preferredTimes: [{ day: 'monday', from: '', to: '' }],
      otherWishes: '',
    },
  });

  const t = translations[language];

  // Update form resolver when language changes
  useEffect(() => {
    // Clear errors when language changes
    form.clearErrors();
  }, [language, form]);

  // Scroll to top when preview is shown
  useEffect(() => {
    if (showPreview) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [showPreview]);

  const handlePreview = async () => {
    // Trigger validation on all fields before showing preview
    const isValid = await form.trigger();
    if (isValid) {
      setShowPreview(true);
      // Scroll to top when showing preview
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSubmitSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Ett fel uppstod när ansökan skulle skickas. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
          <div className="mb-3 sm:mb-4">
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            {language === 'sv' ? 'Tack för din ansökan!' : 'Thank you for your application!'}
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6 font-medium">
            {language === 'sv'
              ? 'Din intresseanmälan har skickats in. Vi kommer att kontakta dig så snart som möjligt.'
              : 'Your interest application has been submitted. We will contact you as soon as possible.'}
          </p>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              form.reset();
              setShowPreview(false);
            }}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base shadow-sm transition-colors"
          >
            {language === 'sv' ? 'Skicka en ny ansökan' : 'Submit a new application'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPreview ? (
        <ApplicationPreview
          form={form}
          language={language}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onLanguageChange={setLanguage}
        />
      ) : (
        <ApplicationForm
          form={form}
          language={language}
          onLanguageChange={setLanguage}
          onPreview={handlePreview}
        />
      )}
    </div>
  );
}

