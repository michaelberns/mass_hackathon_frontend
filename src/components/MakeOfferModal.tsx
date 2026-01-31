import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Job } from '../types';

interface MakeOfferModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposedPrice: number, message: string) => void;
}

export const MakeOfferModal = ({
  job,
  isOpen,
  onClose,
  onSubmit,
}: MakeOfferModalProps) => {
  const [proposedPrice, setProposedPrice] = useState(job.budget.toString());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(parseFloat(proposedPrice), message);
      setProposedPrice(job.budget.toString());
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 pb-6">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate min-w-0">Make an Offer</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Job: {job.title}</p>
          <p className="text-sm font-medium text-gray-900">
            Original Budget: ${job.budget}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proposedPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Proposed Price ($)
            </label>
            <input
              type="number"
              id="proposedPrice"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message / Explanation
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder="Explain your offer, timeline, or any additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 pb-4 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-h-[44px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
