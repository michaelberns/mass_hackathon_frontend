import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, updateJob } from '../services/api';
import type { Job } from '../types';
import type { JobFormData } from '../types';
import { JobForm } from '../components/JobForm';
import { AppLayout } from '../components/AppLayout';
import { useUser } from '../context/UserContext';

export const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, canEditJob } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getJob(id)
      .then((j) => {
        if (!cancelled) setJob(j);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load job');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (data: JobFormData) => {
    if (!id || !currentUser) return;
    const updated = await updateJob(id, currentUser.id, data);
    setJob(updated);
    navigate(`/jobs/${id}`, { state: { message: 'Job updated successfully.' } });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading job...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!canEditJob(job)) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-12">
          <p className="text-red-600 mb-4">You can only edit jobs you created.</p>
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Job
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            onCancel={() => navigate(`/jobs/${id}`)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
