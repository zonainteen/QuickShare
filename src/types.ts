export type PlatformStyle = 'material' | 'cupertino';

export type ScreenName = 
  | 'splash'
  | 'camera'
  | 'filter_caption'
  | 'auto_status'
  | 'share_blast'
  | 'quickclip';

export type FilterId = 
  | 'coffee_glow'
  | 'nightlife_neon'
  | 'selfie_soft'
  | 'foodie_pop'
  | 'moment_retro'
  | 'sky_bright';

export interface FilterItem {
  id: FilterId;
  name: string;
  category: string;
  cssClass: string;
  iconName: string;
  description: string;
  defaultCaption: string;
  accentColor: string;
  sampleImg: string;
}

export type QuickClipEffect = 'blur_lembut' | 'slow_motion' | 'color_pop' | 'none';
export type ClipTransition = 'slide_fade' | 'cross_dissolve' | 'zoom_fade';

export type BeautyFilterStyle = 'natural' | 'rosy' | 'glam' | 'golden' | 'none';

export interface BeautyFilterConfig {
  enabled: boolean;
  style: BeautyFilterStyle;
  smoothing: number; // 0 to 100
  blush: number; // 0 to 100
  lipGloss: number; // 0 to 100
  sparkles: boolean;
}

export type CollageLayout = 'grid2x2' | 'splitVertical' | 'tripleStory' | 'heroInset';

export type ShutterTimer = 0 | 3 | 10;
export type NightModeState = 'off' | 'auto' | 'on';

export interface QuickClipEffectItem {
  id: QuickClipEffect;
  name: string;
  description: string;
  iconName: string;
  cssClass: string;
}

export interface CapturedMedia {
  type: 'photo' | 'video';
  url: string;
  filterId: FilterId;
  effectId?: QuickClipEffect;
  transitionEffect?: ClipTransition;
  caption: string;
  timestamp: Date;
  category?: string;
  duration?: number;
  isCollage?: boolean;
  collagePhotos?: string[];
  collageLayout?: CollageLayout;
  nightModeApplied?: boolean;
  beautyFilterApplied?: boolean;
}

export interface SharePlatform {
  id: 'whatsapp' | 'instagram' | 'tiktok' | 'telegram';
  name: string;
  label: string;
  icon: string;
  color: string;
  bgGradient: string;
  format: string;
  description: string;
}

export interface AdMobConfig {
  appIdAndroid: string;
  appIdIos: string;
  bannerIdAndroid: string;
  bannerIdIos: string;
  interstitialIdAndroid: string;
  interstitialIdIos: string;
  isTestMode: boolean;
}

export interface DraftItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  media: CapturedMedia;
  title?: string;
}

export interface ScheduledStatusItem {
  id: string;
  scheduledTime: string;
  createdAt: string;
  platform: 'whatsapp' | 'instagram' | 'tiktok' | 'telegram';
  media: CapturedMedia;
  notified: boolean;
}
