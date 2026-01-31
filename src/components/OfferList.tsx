import { Link } from 'react-router-dom';
import type { Offer, User } from '../types';

interface OfferListProps {
  offers: Offer[];
  offerers?: Record<string, User>;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  isCreator: boolean;
  acceptLoading?: string | null;
  rejectLoading?: string | null;
}

function StatusBadge({ status }: { status: Offer['status'] }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  const styles =
    status === 'pending'
      ? 'bg-amber-100 text-amber-800 border border-amber-200'
      : status === 'accepted'
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`${base} ${styles}`}>
      {status === 'accepted' ? '✓ ' : ''}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function OfferList({
  offers,
  offerers = {},
  onAccept,
  onReject,
  isCreator,
  acceptLoading,
  rejectLoading,
}: OfferListProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-2xl" aria-hidden>
          💬
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Offers</h3>
        <p className="text-gray-500 text-sm">No offers yet. Labourers can make an offer from this job page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="px-6 sm:px-8 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Offers <span className="text-gray-400 font-normal">({offers.length})</span>
        </h3>
      </div>
      <ul className="p-4 sm:p-6 space-y-4">
        {offers.map((offer) => {
          const creatorId = offer.createdBy ?? (offer as unknown as { userId?: string }).userId;
          const offerer = creatorId ? offerers[creatorId] : null;
          return (
            <li
              key={offer.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Row 1: offerer + price/status/date + actions — same height for every offer */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 border-b border-gray-100">
                {/* Offerer: fixed-size block */}
                <div className="flex items-center gap-3 shrink-0 min-w-0 sm:w-48">
                  {creatorId ? (
                    <Link
                      to={`/users/${creatorId}`}
                      className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial group"
                    >
                      {offerer?.avatarUrl ? (
                        <img
                          src={offerer.avatarUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-amber-200 transition-all shrink-0"
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 group-hover:from-amber-50 group-hover:to-amber-100 group-hover:text-amber-700 transition-all shrink-0 ring-2 ring-gray-100">
                          {offerer?.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-amber-600 truncate transition-colors text-sm sm:text-base">
                          {offerer?.name ?? 'Loading...'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">View profile →</p>
                      </div>
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>
                {/* Price + status + date: one line */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:border-l sm:border-gray-100 sm:pl-5">
                  <span className="text-xl font-bold text-amber-600 tracking-tight">${offer.proposedPrice}</span>
                  <StatusBadge status={offer.status} />
                  <span className="text-xs text-gray-400">
                    {new Date(offer.createdAt).toLocaleString()}
                  </span>
                </div>
                {/* Actions: fixed width */}
                {isCreator && offer.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAccept?.(offer.id)}
                      disabled={acceptLoading === offer.id}
                      className="min-h-[40px] px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {acceptLoading === offer.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject?.(offer.id)}
                      disabled={rejectLoading === offer.id}
                      className="min-h-[40px] px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {rejectLoading === offer.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
              {/* Row 2: message — same min-height so every card has consistent height */}
              <div className="min-h-[4rem] px-4 sm:px-5 py-3 bg-gray-50/50">
                {offer.message ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{offer.message}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No message</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
