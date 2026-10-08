export interface Brand {
  name: string;
  tone: string;
  target: TargetAudience;
  url: string;
  play_store_url: string;
  fixed_hashtags: string[];
  rules: string[];
}

export interface SocialPlatforms {
  facebook: boolean;
  instagram: boolean;
  tiktok: boolean;
}

export interface TargetAudience {
  description: string;
  demographics: string;
  interests: string[];
}

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface PostDBItem {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  content: string;
  hashtags: string[];
  cta: string;
  image_url?: string;
  status: PostStatus;
  scheduled_at?: string;
  published_at?: string;
  external_id?: string;
  error?: string;
}

export interface PostItem {
  id: string;
  title: string;
  content: string;
  hashtags: string[];
  cta: string;
  imagePrompt?: string;
  imageUrl?: string; // Generated image URL from OpenRouter
}

export interface TikTokPostItem {
  id: string;
  title: string;
  hookVisual: string;
  scriptBody: string;
  onScreenText: string;
  audioSuggestion: string;
  hashtags: string[];
  cta: string;
}

export interface PostResult {
  facebookPosts: PostItem[];
  instagramPosts: PostItem[];
  tiktokPosts: TikTokPostItem[];
  researchSummary: string;
  marketingStrategy: string;
}
