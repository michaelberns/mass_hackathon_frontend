import { useState } from 'react';
import type { Job, User } from '../types';
import { requestJobClose, approveJobClose, rejectJobClose } from '../services/api';

interface JobCloseActionsProps {
  job: Job;
  currentUser: User;
  onJobUpdate: (updatedJob: Job) => void;
}

interface ExtraButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
}

interface ExtendedJobCloseActionsProps extends JobCloseActionsProps {
  extraButtons?: ExtraButtonsProps;
}

export function JobCloseActions({ job, currentUser, onJobUpdate, extraButtons }: ExtendedJobCloseActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'close' | 'approve' | null>(null);

  const isClient = job.createdBy === currentUser.id;
  const isLabour = job.acceptedBy === currentUser.id;
  const closeRequested = !!job.closeRequestedBy;

  // Don't show anything if job is already closed
  if (job.status === 'closed') {
    return null;
  }

  // Only show for reserved jobs
  if (job.status !== 'reserved') {
    return null;
  }

  const handleRequestClose = async () => {
    setError(null);
    setLoading('request');
    try {
      const updated = await requestJobClose(job.id, currentUser.id);
      onJobUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request close');
    } finally {
      setLoading(null);
    }
  };

  const handleApproveClose = async () => {
    setShowConfirmModal(false);
    setError(null);
    setLoading('approve');
    try {
      const updated = await approveJobClose(job.id, currentUser.id);
      onJobUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close job');
    } finally {
      setLoading(null);
    }
  };

  const handleRejectClose = async () => {
    setError(null);
    setLoading('reject');
    try {
      const updated = await rejectJobClose(job.id, currentUser.id);
      onJobUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject close request');
    } finally {
      setLoading(null);
    }
  };

  const handleCloseJob = async () => {
    setShowConfirmModal(false);
    setError(null);
    setLoading('close');
    try {
      const updated = await approveJobClose(job.id, currentUser.id);
      onJobUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close job');
    } finally {
      setLoading(null);
    }
  };

  const openConfirmModal = (action: 'close' | 'approve') => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Client View */}
      {isClient && (
        <div className="space-y-4">
          {closeRequested && (
            <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">Job Completion Requested</h3>
                  <p className="text-sm text-amber-800">
                    The worker has requested to close this job. Please review the work and approve if completed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {extraButtons?.onEdit && (
              <button
                onClick={extraButtons.onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Edit Job
              </button>
            )}
            {closeRequested ? (
              <>
                <button
                  onClick={() => openConfirmModal('approve')}
                  disabled={loading !== null}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'approve' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve & Close Job
                    </>
                  )}
                </button>
                <button
                  onClick={handleRejectClose}
                  disabled={loading !== null}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'reject' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject Request
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => openConfirmModal('close')}
                disabled={loading !== null}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'close' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Close Job
                  </>
                )}
              </button>
            )}
            {extraButtons?.onDelete && (
              <button
                onClick={extraButtons.onDelete}
                disabled={extraButtons.deleteLoading || loading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {extraButtons.deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Job'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Labour View */}
      {isLabour && !isClient && (
        <div className="space-y-4">
          {closeRequested ? (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Completion Request Sent</h3>
                  <p className="text-sm text-blue-800">
                    Waiting for the client to approve and close this job.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleRequestClose}
              disabled={loading !== null}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'request' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Request Job Completion
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {confirmAction === 'approve' ? 'Approve & Close Job?' : 'Close Job?'}
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              {confirmAction === 'approve'
                ? 'This will mark the job as completed and close it. The worker will be notified.'
                : 'This will mark the job as completed and close it permanently. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === 'approve' ? handleApproveClose : handleCloseJob}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
