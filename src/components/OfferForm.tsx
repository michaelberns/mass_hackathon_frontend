import { useState, type FormEvent } from 'react';
import type { Job } from '../types';

interface OfferFormProps {
  job: Job;
  onSubmit: (proposedPrice: number, message: string) => Promise<void>;
  onSuccess?: () => void;
}

export function OfferForm({ job, onSubmit, onSuccess }: OfferFormProps) {
  const [proposedPrice, setProposedPrice] = useState(job.budget.toString());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(parseFloat(proposedPrice), message);
      setProposedPrice(job.budget.toString());
      setMessage('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Make an Offer</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
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
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
            placeholder="Explain your offer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Offer'}
        </button>
      </form>
    </div>
  );
}
