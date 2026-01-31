interface ProfileCompleteModalProps {
  onYes: () => void;
  onLater: () => void;
}

export function ProfileCompleteModal({ onYes, onLater }: ProfileCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        <h2 id="profile-modal-title" className="text-xl font-semibold text-gray-900 mb-2">
          Complete your profile
        </h2>
        <p className="text-gray-600 mb-6">
          Do you want to complete your profile now? It only takes a minute and helps others trust you.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onLater}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onYes}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
