// Shared types for the VoiceLocal application

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'rejected';
  upvotes: number;
  downvotes: number;
  userVotes: { [userId: string]: 'up' | 'down' }; // Track individual user votes
  comments: Comment[];
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location?: string;
}
