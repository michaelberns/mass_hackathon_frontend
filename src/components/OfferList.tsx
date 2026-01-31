import { Link } from 'react-router-dom';
import type { Offer } from '../types';

interface OfferListProps {
  offers: Offer[];
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  isCreator: boolean;
  acceptLoading?: string | null;
  rejectLoading?: string | null;
}

export function OfferList({
  offers,
  onAccept,
  onReject,
  isCreator,
  acceptLoading,
  rejectLoading,
}: OfferListProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Offers</h3>
        <p className="text-gray-500 text-sm">No offers yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Offers ({offers.length})
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {offers.map((offer) => (
          <li key={offer.id} className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium">
                  ${offer.proposedPrice}
                  {offer.createdBy && (
                    <span className="text-gray-500 font-normal text-sm ml-2">
                      {' · '}
                      <Link
                        to={`/users/${offer.createdBy}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View offer author&apos;s profile
                      </Link>
                    </span>
                  )}
                </p>
                <p className="text-gray-600 text-sm mt-1">{offer.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(offer.createdAt).toLocaleString()} ·{' '}
                  <span
                    className={
                      offer.status === 'pending'
                        ? 'text-amber-600'
                        : offer.status === 'accepted'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {offer.status}
                  </span>
                </p>
              </div>
              {isCreator && offer.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAccept?.(offer.id)}
                    disabled={acceptLoading === offer.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acceptLoading === offer.id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject?.(offer.id)}
                    disabled={rejectLoading === offer.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectLoading === offer.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
