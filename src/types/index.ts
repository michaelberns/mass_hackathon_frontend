// Core types for the application

export type UserRole = 'client' | 'labour';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  profileCompleted?: boolean;
  skills?: string[];
  yearsOfExperience?: number;
  companyName?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  images: string[];
  video?: string;
  createdAt: string;
  status: 'open' | 'reserved' | 'accepted' | 'completed' | 'closed';
  createdBy?: string;
  acceptedBy?: string;
  closeRequestedBy?: string;
  latitude?: number;
  longitude?: number;
}

export interface Offer {
  id: string;
  jobId: string;
  proposedPrice: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdBy?: string;
}

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  budget: number;
  images: string[];
  video?: string;
  latitude?: number;
  longitude?: number;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  jobId?: string;
  offerId?: string;
}

export interface UserJobsResponse {
  created?: Job[];
  workingOn?: Job[];
}

/** Job item returned by GET /api/jobs/map for map display */
export interface JobMapItem {
  id: string;
  title: string;
  budget: number;
  latitude: number;
  longitude: number;
  images: string[];
}

/** Job filters for search and filtering */
export interface JobFilters {
  minBudget?: number;
  maxBudget?: number;
  q?: string; // text search (title/description)
  location?: string;
  skills?: string[]; // array of skill tags
  status?: 'all' | 'open' | 'reserved' | 'closed';
}
