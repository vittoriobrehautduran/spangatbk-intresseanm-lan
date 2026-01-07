'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Application, ApplicationStatus, SportType } from '@/types/database';
import { translations } from '@/lib/translations';
import ApplicationList from '@/components/admin/ApplicationList';
import ApplicationDetail from '@/components/admin/ApplicationDetail';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportType | 'all'>('all');
  const router = useRouter();
  const t = translations.sv;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (applications.length > 0 || !isLoading) {
      loadApplications();
    }
  }, [statusFilter, sportFilter]);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (!adminUser) {
      await supabase.auth.signOut();
      router.push('/admin/login');
      return;
    }

    await loadApplications();
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('applications')
        .select('*');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (sportFilter !== 'all') {
        query = query.eq('sport_type', sportFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading applications:', error);
        return;
      }

      // Order applications: ny → kontaktad → köad → placerad → avbruten
      const statusOrder: Record<ApplicationStatus, number> = {
        new: 1,
        contacted: 2,
        queued: 3,
        placed: 4,
        aborted: 5,
      };

      const sortedApplications = (data || []).sort((a: Application, b: Application) => {
        const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        if (statusDiff !== 0) {
          return statusDiff;
        }
        // If same status, sort by created_at descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setApplications(sortedApplications);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleUpdateStatus = async (id: string, status: ApplicationStatus, notes?: string) => {
    try {
      const supabase = createClient();
      
      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating application:', error);
        return;
      }

      await loadApplications();
      if (selectedApplication?.id === id) {
        const updated = applications.find((app) => app.id === id);
        if (updated) {
          setSelectedApplication({ ...updated, status, admin_notes: notes || updated.admin_notes });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Get auth token for API request
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Du är inte inloggad. Logga in igen.');
        router.push('/admin/login');
        return;
      }

      // Call API endpoint to delete
      const response = await fetch(`/api/applications?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error deleting application:', errorData);
        alert(errorData.error || 'Ett fel uppstod när ansökan skulle tas bort.');
        throw new Error(errorData.error || 'Failed to delete');
      }

      // If deleted application was selected, go back to list
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }

      // Remove from local state immediately for better UX
      setApplications(applications.filter((app) => app.id !== id));

      // Reload applications to ensure sync
      await loadApplications();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.student_first_name.toLowerCase().includes(query) ||
      app.student_last_name.toLowerCase().includes(query) ||
      app.student_email.toLowerCase().includes(query) ||
      app.student_phone.includes(query)
    );
  });

  if (selectedApplication) {
    return (
      <ApplicationDetail
        application={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
        onRefresh={loadApplications}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{t.admin.applications}</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {t.admin.logout}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.admin.search}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.admin.search}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.admin.status}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Alla</option>
                <option value="new">{t.status.new}</option>
                <option value="contacted">{t.status.contacted}</option>
                <option value="queued">{t.status.queued}</option>
                <option value="placed">{t.status.placed}</option>
                <option value="aborted">{t.status.aborted}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.admin.sport}
              </label>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value as SportType | 'all')}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Alla</option>
                <option value="tennis">{t.form.tennis}</option>
                <option value="table_tennis">{t.form.tableTennis}</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Laddar ansökningar...</p>
          </div>
        ) : (
          <ApplicationList
            applications={filteredApplications}
            onSelectApplication={setSelectedApplication}
          />
        )}
      </div>
    </div>
  );
}

