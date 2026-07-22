export interface Campaign {
  id: string;
  title: string;
  party: string;
  partyLogo: string;
  candidate: string;
  candidateRole: string;
  state: string;
  year: number;
  description: string;
  achievements: string[];
  socialReach: {
    impressions: string;
    engagement: string;
    subscribers: string;
    views: string;
  };
  image: string;
  gallery: string[];
  videos: string[];
  creativeDesigns: string[];
  reels: string[];
  shorts: string[];
  advertisements: string[];
  beforeAfterAnalytics: {
    beforeMetric: string;
    afterMetric: string;
    label: string;
  }[];
  timeline: {
    date: string;
    event: string;
    icon: string;
  }[];
  testimonials: {
    quote: string;
    author: string;
    role: string;
  }[];
  isFeatured?: boolean;
}

export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  color: string;
  description: string;
  campaigns: string[];
  leaders: string[];
  achievements: string[];
  gallery: string[];
}

export interface Leader {
  id: string;
  name: string;
  party: string;
  role: string;
  photo: string;
  biography: string;
  achievements: string[];
  politicalJourney: {
    year: string;
    role: string;
  }[];
  speechGallery: {
    title: string;
    videoUrl: string;
    date: string;
  }[];
  videos: string[];
  events: string[];
  mediaCoverage: {
    title: string;
    source: string;
    date: string;
    link: string;
  }[];
  gallery: string[];
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  state: string;
  constituency: string;
  photo: string;
  biography: string;
  achievements: string[];
  campaignTimeline: {
    phase: string;
    date: string;
    description: string;
  }[];
  speeches: string[];
  gallery: string[];
  videos: string[];
  creativeDesigns: string[];
}

export interface EventItem {
  id: string;
  title: string;
  type: 'upcoming' | 'past';
  category: 'Press Conference' | 'Road Show' | 'Ground Meeting' | 'Digital Rally';
  date: string;
  time: string;
  location: string;
  description: string;
  gallery: string[];
  videos: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'images' | 'videos' | 'drone' | 'reels' | 'shorts';
  url: string;
  thumbnail?: string;
  party?: string;
  tags?: string[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  status: 'draft' | 'published';
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  experience: string;
  biography: string;
  campaignExperience: string[];
  linkedin: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  party?: string;
  constituency?: string;
  serviceType: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  metaTags: Record<string, string>;
}

export interface CorporateWork {
  id: string;
  title: string;
  client: string;
  industry: string;
  year: number;
  description: string;
  achievements: string[];
  impactMetrics: {
    label: string;
    value: string;
  }[];
  image: string;
  servicesProvided: string[];
  gallery?: string[];
  testimonials?: {
    quote: string;
    author: string;
    role: string;
  }[];
  isFeatured?: boolean;
}

export type LeaderCategory = 
  | 'Prime Minister'
  | 'Chief Minister'
  | 'Deputy Chief Minister'
  | 'Cabinet Minister'
  | 'Minister of State'
  | 'Lok Sabha MP'
  | 'Rajya Sabha MP'
  | 'Governor';

export interface SupabaseLeader {
  id: string;
  slug: string;
  name: string;
  designation: string;
  category: LeaderCategory;
  state: string;
  constituency: string;
  party: string;
  gender: string;
  dob: string;
  bio: string;
  education: string;
  profession: string;
  mobile: string;
  email: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  website: string;
  image: string;
  cover_image: string;
  gallery: string[];
  featured: boolean;
  status: 'Published' | 'Draft';
  created_at?: string;
  updated_at?: string;
  membership_status?: string;
  lok_sabha_terms?: string;
}

