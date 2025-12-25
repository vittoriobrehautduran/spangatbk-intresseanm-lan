'use client';

import { useState } from 'react';
import type { Application, ApplicationStatus } from '@/types/database';
import { translations } from '@/lib/translations';
import { format } from 'date-fns';

interface ApplicationDetailProps {
  application: Application;
  onBack: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ApplicationDetail({
  application,
  onBack,
  onUpdateStatus,
  onRefresh,
}: ApplicationDetailProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const t = translations.sv;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(application.id, status, adminNotes);
      await onRefresh();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getSportLevels = () => {
    if (application.sport_type === 'tennis' && application.tennis_levels) {
      return application.tennis_levels
        .map((level) => t.levels.tennis[level as keyof typeof t.levels.tennis])
        .join(', ');
    } else if (application.sport_type === 'table_tennis' && application.table_tennis_levels) {
      return application.table_tennis_levels
        .map((level) => t.levels.tableTennis[level as keyof typeof t.levels.tableTennis])
        .join(', ');
    }
    return '-';
  };

  const preferredTimes = application.preferred_times as Array<{ day: string; from: string; to: string }> | null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Tillbaka till lista
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {application.student_first_name} {application.student_last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Ansökan skickad: {format(new Date(application.created_at), 'yyyy-MM-dd HH:mm')}
            </p>
          </div>
          <div className="text-right">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="border border-gray-300 rounded-md px-3 py-2 mb-2"
            >
              <option value="new">{t.status.new}</option>
              <option value="contacted">{t.status.contacted}</option>
              <option value="queued">{t.status.queued}</option>
              <option value="placed">{t.status.placed}</option>
              <option value="aborted">{t.status.aborted}</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">Sport och nivå</h2>
            <div className="space-y-1 text-gray-700">
              <p>
                <strong>Sport:</strong>{' '}
                {application.sport_type === 'tennis' ? t.form.tennis : t.form.tableTennis}
              </p>
              <p>
                <strong>Nivå:</strong> {getSportLevels()}
              </p>
              {application.interest_areas && (
                <p>
                  <strong>Intresseområden:</strong> {application.interest_areas}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">{t.form.studentInfo}</h2>
            <div className="space-y-1 text-gray-700">
              <p>
                <strong>Namn:</strong> {application.student_first_name} {application.student_last_name}
              </p>
              <p>
                <strong>Personnummer:</strong> {application.student_personal_number}
              </p>
              <p>
                <strong>Telefon:</strong> {application.student_phone}
              </p>
              <p>
                <strong>Adress:</strong> {application.student_address}
              </p>
              <p>
                <strong>E-post:</strong> {application.student_email}
              </p>
              {application.student_age && (
                <p>
                  <strong>Ålder:</strong> {application.student_age}
                </p>
              )}
            </div>
          </div>

          {application.has_guardian && (
            <div>
              <h2 className="font-semibold text-lg mb-2">{t.form.guardianInfo}</h2>
              <div className="space-y-3">
                {application.guardian_1_name && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium mb-1">Målsman 1:</p>
                    <p className="text-gray-700">{application.guardian_1_name}</p>
                    <p className="text-gray-700">{application.guardian_1_email}</p>
                    <p className="text-gray-700">{application.guardian_1_phone}</p>
                  </div>
                )}
                {application.guardian_2_name && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium mb-1">Målsman 2:</p>
                    <p className="text-gray-700">{application.guardian_2_name}</p>
                    <p className="text-gray-700">{application.guardian_2_email}</p>
                    <p className="text-gray-700">{application.guardian_2_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-lg mb-2">{t.form.groupPhotoConsent}</h2>
            <p className="text-gray-700">
              {application.group_photo_consent ? t.form.yes : t.form.no}
            </p>
          </div>

          {preferredTimes && preferredTimes.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-2">{t.form.preferredTimes}</h2>
              <div className="space-y-2">
                {preferredTimes.map((time, index) => {
                  const dayLabels: Record<string, string> = {
                    monday: t.form.monday,
                    tuesday: t.form.tuesday,
                    wednesday: t.form.wednesday,
                    thursday: t.form.thursday,
                    friday: t.form.friday,
                    saturday: t.form.saturday,
                    sunday: t.form.sunday,
                  };
                  const dayLabel = dayLabels[time.day] || time.day;

                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-700">
                        {dayLabel}: {time.from} - {time.to}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {application.other_wishes && (
            <div>
              <h2 className="font-semibold text-lg mb-2">{t.form.otherWishes}</h2>
              <p className="text-gray-700">{application.other_wishes}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-lg mb-2">{t.admin.adminNotes}</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Lägg till anteckningar här..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            {t.admin.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sparar...' : t.admin.save}
          </button>
        </div>
      </div>
    </div>
  );
}

