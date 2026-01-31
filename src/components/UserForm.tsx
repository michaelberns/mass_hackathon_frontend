import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import type { User, UserRole } from '../types';
import { AvatarUploader } from './AvatarUploader';

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience?: number;
  companyName?: string;
}

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}

export function UserForm({
  initialData,
  onSubmit,
  submitLabel,
  onCancel,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [role, setRole] = useState<UserRole>(initialData?.role ?? 'client');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(
    initialData?.yearsOfExperience ?? ''
  );
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (role === 'labour') {
      const years = yearsOfExperience === '' ? undefined : Number(yearsOfExperience);
      if (years !== undefined && (Number.isNaN(years) || years < 0)) {
        setError('Years of experience must be 0 or more.');
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const data: UserFormData = { name, email, role };
      if (initialData != null) {
        data.avatarUrl = avatarUrl.trim() || undefined;
        data.location = location.trim() || undefined;
        data.bio = bio.trim() || undefined;
        if (role === 'labour') {
          data.skills = skills.length ? skills : undefined;
          data.yearsOfExperience =
            yearsOfExperience === '' ? undefined : Number(yearsOfExperience);
        } else {
          data.companyName = companyName.trim() || undefined;
        }
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = initialData != null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="client">Client</option>
          <option value="labour">Labour</option>
        </select>
      </div>

      {isEditMode && (
        <>
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Profile</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar (optional)
              </label>
              <AvatarUploader
                value={avatarUrl}
                onChange={setAvatarUrl}
                placeholderLetter={initialData?.name?.charAt(0)?.toUpperCase()}
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
            {role === 'labour' && (
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
                    Years of experience
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
            )}
            {role === 'client' && (
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
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
