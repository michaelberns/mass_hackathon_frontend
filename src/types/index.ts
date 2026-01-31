// Core types for the application

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  images: string[]; // URLs or base64 strings
  video?: string; // Optional video URL
  createdAt: string;
  status: 'open' | 'accepted' | 'completed';
  acceptedBy?: string;
}

export interface Offer {
  id: string;
  jobId: string;
  proposedPrice: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  budget: number;
  images: File[];
  video?: File;
}
