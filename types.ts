
export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr'
}

export interface PlatformContent {
  title?: string;
  description?: string;
  caption?: string;
  tags?: string[];
  hashtags?: string[];
  statusText?: string;
  channelText?: string;
}

export interface PostingData {
  videoFile: File | null;
  primaryKeyword: string;
  eventName?: string;
  location?: string;
  date?: string;
  language: Language;
}

export interface GeneratedContent {
  youtube: PlatformContent;
  facebook: PlatformContent;
  instagram: PlatformContent;
  whatsapp: PlatformContent;
}

export interface FBPage {
  id: string;
  name: string;
}

export interface AppSettings {
  selectedFBPage: FBPage | null;
  defaultFooter: string;
  theme: 'dark' | 'light';
  savedHashtags: string[];
}

export enum AppStep {
  INPUT = 'input',
  GENERATING = 'generating',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  REPORT = 'report',
  SETTINGS = 'settings'
}

export interface PostingReport {
  id: string;
  date: string;
  keyword: string;
  title: string;
  fbPage: string;
  status: {
    youtube: boolean;
    facebook: boolean;
    instagram: boolean;
    whatsapp: boolean;
  }
}
