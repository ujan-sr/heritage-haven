export type Mood = 'joyful' | 'romantic' | 'adventurous' | 'peaceful' | 'nostalgic';

export interface FriendMemory {
  id: string;
  friendName: string;
  friendPhoto?: string | null;
  title: string;
  description: string;
  mood: Mood;
  photos: string[];
  createdAt: number;
  isPlaceholder?: boolean;
}

export interface FriendSummary {
  name: string;
  photo?: string | null;
  count: number;
}