/**
 * API service layer - all HTTP calls to the backend.
 *
 * Base URL (configurable via VITE_API_BASE_URL in .env):
 *   Default: http://localhost:3000/api
 *
 * Exact requests we send (for saving/fetching data):
 *   Create user:  POST  {BASE_URL}/users     body: { name, email, role }
 *   Get user:     GET   {BASE_URL}/users/:id
 *   Update user:  PUT   {BASE_URL}/users/:id body: { name?, email?, role? }
 *   Get jobs:     GET   {BASE_URL}/jobs
 *   Create job:   POST  {BASE_URL}/jobs      body: { title, description, location, budget, images, video?, createdBy }
 *   Get job:      GET   {BASE_URL}/jobs/:id
 *   Update job:   PUT   {BASE_URL}/jobs/:id  header: X-User-Id, body: updates
 *   Delete job:   DELETE {BASE_URL}/jobs/:id header: X-User-Id
 *   Get offers:   GET   {BASE_URL}/jobs/:id/offers
 *   Create offer: POST  {BASE_URL}/jobs/:id/offers body: { userId, proposedPrice, message }
 *   Accept offer: POST {BASE_URL}/offers/:id/accept header: X-User-Id
 *   Reject offer: POST {BASE_URL}/offers/:id/reject header: X-User-Id
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

import type { User, Job, Offer, Notification, UserJobsResponse, JobMapItem, JobFilters } from '../types';

function getHeaders(userId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

/** Normalize API response to User (handles { user }, { data }, or direct user object) */
function normalizeUser(raw: unknown, fallback: { name: string; email: string; role: 'client' | 'labour' }): User {
  const obj = raw != null && typeof raw === 'object' ? raw as Record<string, unknown> : null;
  if (!obj) throw new Error('Invalid response from server');

  let user = obj as Record<string, unknown>;
  if (obj.user != null && typeof obj.user === 'object') user = obj.user as Record<string, unknown>;
  else if (obj.data != null && typeof obj.data === 'object') user = obj.data as Record<string, unknown>;

  const id = user.id != null ? String(user.id) : null;
  if (!id) throw new Error('Server did not return a user id. Check that the API is running and returns the created user.');

  const base: User = {
    id,
    name: user.name != null ? String(user.name) : fallback.name,
    email: user.email != null ? String(user.email) : fallback.email,
    role: (user.role === 'client' || user.role === 'labour') ? user.role : fallback.role,
  };
  if (user.avatarUrl != null && typeof user.avatarUrl === 'string') base.avatarUrl = user.avatarUrl;
  if (user.location != null && typeof user.location === 'string') base.location = user.location;
  if (user.bio != null && typeof user.bio === 'string') base.bio = user.bio;
  if (user.profileCompleted === true) base.profileCompleted = true;
  if (user.profileCompleted === false) base.profileCompleted = false;
  if (Array.isArray(user.skills)) base.skills = user.skills.filter((s): s is string => typeof s === 'string');
  if (typeof user.yearsOfExperience === 'number') base.yearsOfExperience = user.yearsOfExperience;
  if (user.companyName != null && typeof user.companyName === 'string') base.companyName = user.companyName;
  return base;
}

// --- Users ---

export async function createUser(data: {
  name: string;
  email: string;
  role: 'client' | 'labour';
}): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot reach the API: ${msg}. Is the backend running at ${BASE_URL}? Check CORS if the app is on a different origin.`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!text || !text.trim()) {
    const location = res.headers.get('Location');
    const id = location ? location.replace(/\/+$/, '').split('/').pop() : null;
    if (id) {
      return getUser(id);
    }
    throw new Error('Server returned no user data. Check that POST /users returns the created user (or a Location header with the new user id).');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }

  return normalizeUser(parsed, data);
}

/** Sign in with name and email only. Returns the user or throws on invalid credentials. */
export async function signIn(name: string, email: string): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/users/sign-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot reach the API: ${msg}. Is the backend running at ${BASE_URL}?`);
  }
  const text = await res.text();
  if (!res.ok) {
    const msg = text || `HTTP ${res.status}`;
    try {
      const json = text ? JSON.parse(text) : null;
      throw new Error(json?.error ?? msg);
    } catch (e) {
      if (e instanceof Error && e.message !== msg) throw e;
      throw new Error(msg);
    }
  }
  if (!text || !text.trim()) throw new Error('Invalid name or email');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }
  return normalizeUser(parsed, { name: name.trim(), email: email.trim(), role: 'client' });
}

export async function getUser(id: string): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/users/${id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot reach the API: ${msg}. Is the backend running at ${BASE_URL}?`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!text || !text.trim()) {
    throw new Error('User not found or server returned no data.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }

  return normalizeUser(parsed, { name: '', email: '', role: 'client' });
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: 'client' | 'labour';
  avatarUrl?: string;
  location?: string;
  bio?: string;
  profileCompleted?: boolean;
  skills?: string[];
  yearsOfExperience?: number;
  companyName?: string;
}

export async function updateUser(id: string, data: UserUpdateData): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot reach the API: ${msg}. Is the backend running at ${BASE_URL}?`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!text || !text.trim()) {
    return getUser(id);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }

  return normalizeUser(parsed, { name: '', email: '', role: 'client' });
}

// --- Jobs ---

/** Build query string from filters */
function buildFilterQuery(filters?: JobFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.minBudget != null) params.set('minBudget', String(filters.minBudget));
  if (filters.maxBudget != null) params.set('maxBudget', String(filters.maxBudget));
  if (filters.q) params.set('q', filters.q);
  if (filters.location) params.set('location', filters.location);
  if (filters.skills?.length) params.set('skills', filters.skills.join(','));
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getJobs(filters?: JobFilters): Promise<Job[]> {
  const query = buildFilterQuery(filters);
  const res = await fetch(`${BASE_URL}/jobs${query}`);
  return handleResponse<Job[]>(res);
}

/** Jobs with lat/lng for map. GET /api/jobs/map */
export async function getJobsForMap(filters?: JobFilters): Promise<JobMapItem[]> {
  const query = buildFilterQuery(filters);
  const res = await fetch(`${BASE_URL}/jobs/map${query}`);
  const data = await handleResponse<JobMapItem[]>(res);
  const list = Array.isArray(data) ? data : [];
  return list.map((job) => ({
    ...job,
    images: Array.isArray(job.images) ? job.images : [],
  }));
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`);
  return handleResponse<Job>(res);
}

export async function createJob(data: {
  title: string;
  description: string;
  location: string;
  budget: number;
  images: string[];
  video?: string;
  createdBy: string;
  latitude?: number;
  longitude?: number;
}): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Job>(res);
}

export async function updateJob(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    budget: number;
    images: string[];
    video: string;
    latitude: number;
    longitude: number;
  }>
): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  return handleResponse<Job>(res);
}

export async function deleteJob(id: string, userId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/** Request job close (labour). POST /api/jobs/:id/request-close */
export async function requestJobClose(jobId: string, userId: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/request-close`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  return handleResponse<Job>(res);
}

/** Approve and close job (client). POST /api/jobs/:id/close */
export async function approveJobClose(jobId: string, userId: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/close`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  return handleResponse<Job>(res);
}

/** Reject close request (client). POST /api/jobs/:id/reject-close */
export async function rejectJobClose(jobId: string, userId: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/reject-close`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  return handleResponse<Job>(res);
}

// --- Offers ---

export async function getOffersForJob(jobId: string): Promise<Offer[]> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/offers`);
  return handleResponse<Offer[]>(res);
}

export async function createOffer(
  jobId: string,
  data: { userId: string; proposedPrice: number; message: string }
): Promise<Offer> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/offers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Offer>(res);
}

export async function acceptOffer(offerId: string, userId: string): Promise<Offer> {
  const res = await fetch(`${BASE_URL}/offers/${offerId}/accept`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  return handleResponse<Offer>(res);
}

export async function rejectOffer(offerId: string, userId: string): Promise<Offer> {
  const res = await fetch(`${BASE_URL}/offers/${offerId}/reject`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  return handleResponse<Offer>(res);
}

// --- Notifications ---

export interface NotificationsResponse {
  unreadCount: number;
  notifications: Notification[];
}

export async function getUserNotifications(userId: string): Promise<NotificationsResponse> {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`);
  const data = await handleResponse<{ unreadCount?: number; notifications?: Notification[] }>(res);
  if (data && typeof data === 'object') {
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    const unreadCount = typeof data.unreadCount === 'number' ? data.unreadCount : notifications.filter((n) => !n.read).length;
    return { unreadCount, notifications };
  }
  return { unreadCount: 0, notifications: [] };
}

/** Mark a notification as read. Requires current user id for X-User-Id header (owner only). */
export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// --- User Jobs ---

export async function getUserJobs(userId: string): Promise<UserJobsResponse> {
  const res = await fetch(`${BASE_URL}/users/${userId}/jobs`);
  const data = await handleResponse<UserJobsResponse>(res);
  if (data && typeof data === 'object') {
    return {
      created: Array.isArray((data as UserJobsResponse).created) ? (data as UserJobsResponse).created : [],
      workingOn: Array.isArray((data as UserJobsResponse).workingOn) ? (data as UserJobsResponse).workingOn : [],
    };
  }
  return { created: [], workingOn: [] };
}

// --- Upload ---

export interface UploadMediaResult {
  images: string[];
  video?: string;
}

/**
 * Upload images and optional video. POST /api/upload with multipart/form-data.
 * Returns URLs to use in job create/update.
 */
export async function uploadMedia(files: {
  images?: File[];
  video?: File;
}): Promise<UploadMediaResult> {
  const formData = new FormData();
  if (files.images?.length) {
    files.images.forEach((file) => formData.append('images', file));
  }
  if (files.video) {
    formData.append('video', files.video);
  }

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Do not set Content-Type; browser sets multipart/form-data with boundary
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Upload failed: HTTP ${res.status}`);
  }

  if (!text?.trim()) {
    return { images: [] };
  }

  try {
    const data = JSON.parse(text) as unknown;
    const obj = data != null && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    if (!obj) throw new Error('Invalid upload response');
    const images = Array.isArray(obj.images) ? (obj.images as string[]) : [];
    const video = typeof obj.video === 'string' ? obj.video : undefined;
    return { images, video };
  } catch (e) {
    if (e instanceof SyntaxError) throw new Error('Invalid upload response');
    throw e;
  }
}
