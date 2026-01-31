// Mock data service to simulate backend API
import type { Job, Offer } from '../types';

// In-memory storage (simulates database)
let jobs: Job[] = [
  {
    id: '1',
    title: 'Garden Cleanup and Landscaping',
    description: 'Need help cleaning up my backyard garden. Includes removing weeds, trimming bushes, and general landscaping work.',
    location: '123 Main St, Springfield, IL',
    budget: 250,
    images: [],
    createdAt: new Date().toISOString(),
    status: 'open',
  },
  {
    id: '2',
    title: 'Kitchen Cabinet Installation',
    description: 'Looking for experienced carpenter to install new kitchen cabinets. All materials provided.',
    location: '456 Oak Ave, Chicago, IL',
    budget: 500,
    images: [],
    createdAt: new Date().toISOString(),
    status: 'open',
  },
  {
    id: '3',
    title: 'Deck Repair and Staining',
    description: 'Deck needs some boards replaced and then stained. Approximately 200 sq ft.',
    location: '789 Pine Rd, Naperville, IL',
    budget: 400,
    images: [],
    createdAt: new Date().toISOString(),
    status: 'open',
  },
];

let offers: Offer[] = [];

// Convert File to base64 string for storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const mockDataService = {
  // Job operations
  getAllJobs: async (): Promise<Job[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...jobs];
  },

  getJobById: async (id: string): Promise<Job | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return jobs.find(job => job.id === id) || null;
  },

  createJob: async (jobData: {
    title: string;
    description: string;
    location: string;
    budget: number;
    images: File[];
    video?: File;
  }): Promise<Job> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Convert images to base64
    const imagePromises = jobData.images.map(fileToBase64);
    const images = await Promise.all(imagePromises);
    
    // Convert video to base64 if provided
    let video: string | undefined;
    if (jobData.video) {
      video = await fileToBase64(jobData.video);
    }

    const newJob: Job = {
      id: Date.now().toString(),
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      budget: jobData.budget,
      images,
      video,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    jobs.push(newJob);
    return newJob;
  },

  acceptJob: async (jobId: string, workerId: string): Promise<Job> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    job.status = 'accepted';
    job.acceptedBy = workerId;
    return job;
  },

  // Offer operations
  createOffer: async (offerData: {
    jobId: string;
    proposedPrice: number;
    message: string;
  }): Promise<Offer> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newOffer: Offer = {
      id: Date.now().toString(),
      jobId: offerData.jobId,
      proposedPrice: offerData.proposedPrice,
      message: offerData.message,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    offers.push(newOffer);
    return newOffer;
  },

  getOffersByJobId: async (jobId: string): Promise<Offer[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return offers.filter(offer => offer.jobId === jobId);
  },
};
