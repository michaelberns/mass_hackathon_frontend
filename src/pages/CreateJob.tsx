import { useNavigate } from 'react-router-dom';
import { JobForm } from '../components/JobForm';
import type { JobFormData } from '../types';
import { createJob } from '../services/api';
import { useUser } from '../context/UserContext';
import { AppLayout } from '../components/AppLayout';

export const CreateJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const handleSubmit = async (data: JobFormData) => {
    if (!currentUser) {
      throw new Error('You must be signed in to create a job. Create or select a user first.');
    }
    const job = await createJob({
      ...data,
      createdBy: currentUser.id,
    });
    navigate(`/jobs/${job.id}`, { state: { message: 'Job created successfully.' } });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a Job</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {!currentUser && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Create or select a user first to create jobs.
            </div>
          )}
          <JobForm
            onSubmit={handleSubmit}
            submitLabel="Create Job"
            onCancel={() => navigate('/jobs')}
          />
        </div>
      </div>
    </AppLayout>
  );
}
