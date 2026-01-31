import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUser, type UserUpdateData } from '../services/api';
import type { User, UserRole } from '../types';
import { AppLayout } from '../components/AppLayout';
import { AvatarUploader } from '../components/AvatarUploader';
import { useUser } from '../context/UserContext';

const STEPS = 3;

export const Onboarding = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '');
  const [location, setLocation] = useState(currentUser?.location ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [skills, setSkills] = useState<string[]>(currentUser?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(
    currentUser?.yearsOfExperience ?? ''
  );
  const [companyName, setCompanyName] = useState(currentUser?.companyName ?? '');

  const role: UserRole = currentUser?.role ?? 'client';

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  }, [skillInput, skills]);

  const removeSkill = useCallback((s: string) => {
    setSkills((prev) => prev.filter((x) => x !== s));
  }, []);

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleStep1Next = () => {
    setError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    setError(null);
    if (role === 'labour') {
      const years = yearsOfExperience === '' ? undefined : Number(yearsOfExperience);
      if (years !== undefined && (Number.isNaN(years) || years < 0)) {
        setError('Years of experience must be 0 or more.');
        return;
      }
    }
    setStep(3);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: UserUpdateData = {
        avatarUrl: avatarUrl.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        profileCompleted: true,
      };
      if (role === 'labour') {
        payload.skills = skills.length ? skills : undefined;
        payload.yearsOfExperience =
          yearsOfExperience === '' ? undefined : Number(yearsOfExperience);
      } else {
        payload.companyName = companyName.trim() || undefined;
      }
      const updated = await updateUser(currentUser.id, payload);
      setCurrentUser(updated);
      navigate(`/users/${currentUser.id}`, {
        state: { message: 'Profile completed successfully.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-12">
          <p className="text-gray-600 mb-4">Please sign in to complete your profile.</p>
          <button
            onClick={() => navigate('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign in
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Complete your profile</h1>
          <span className="text-sm text-gray-500">
            Step {step} of {STEPS}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 md:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic info</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar (optional)
                </label>
                <AvatarUploader
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  placeholderLetter={currentUser?.name?.charAt(0)?.toUpperCase()}
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or region"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A short intro about you..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {role === 'labour' ? 'Your skills & experience' : 'Company info'}
              </h2>
              {role === 'labour' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (add with Enter or comma)
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={addSkill}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Plumbing, Electrical"
                    />
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSkill(s)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Remove ${s}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of experience *
                    </label>
                    <input
                      type="number"
                      id="years"
                      min={0}
                      value={yearsOfExperience === '' ? '' : yearsOfExperience}
                      onChange={(e) => {
                        const v = e.target.value;
                        setYearsOfExperience(v === '' ? '' : parseInt(v, 10));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company name (optional)
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Review & confirm</h2>
              <dl className="space-y-3 text-sm">
                {avatarUrl && (
                  <>
                    <dt className="text-gray-500">Avatar</dt>
                    <dd>
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </dd>
                  </>
                )}
                {location && (
                  <>
                    <dt className="text-gray-500">Location</dt>
                    <dd className="text-gray-900">{location}</dd>
                  </>
                )}
                {bio && (
                  <>
                    <dt className="text-gray-500">Bio</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{bio}</dd>
                  </>
                )}
                {role === 'labour' && (
                  <>
                    <dt className="text-gray-500">Skills</dt>
                    <dd className="text-gray-900">{skills.length ? skills.join(', ') : '—'}</dd>
                    <dt className="text-gray-500">Years of experience</dt>
                    <dd className="text-gray-900">
                      {yearsOfExperience === '' ? '—' : yearsOfExperience}
                    </dd>
                  </>
                )}
                {role === 'client' && companyName && (
                  <>
                    <dt className="text-gray-500">Company</dt>
                    <dd className="text-gray-900">{companyName}</dd>
                  </>
                )}
              </dl>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
