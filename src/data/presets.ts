import { FilterItem, QuickClipEffectItem, SharePlatform, AdMobConfig } from '../types';

export const FILTERS: FilterItem[] = [
  {
    id: 'coffee_glow',
    name: 'Coffee Glow',
    category: 'Coffee & Cafe',
    cssClass: 'filter-coffee-glow',
    iconName: 'Coffee',
    description: 'Warm golden amber tone dengan sentuhan cafe aesthetic',
    defaultCaption: 'Coffee break time ☕ Menyeduh semangat hari ini.',
    accentColor: '#D97706',
    sampleImg: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'nightlife_neon',
    name: 'Nightlife Neon',
    category: 'Party & City',
    cssClass: 'filter-nightlife-neon',
    iconName: 'Sparkles',
    description: 'Cyber neon glow berenergi tinggi untuk tongkrongan malam',
    defaultCaption: 'Friday night vibe on point! ✨🍸 City lights & good times.',
    accentColor: '#EC4899',
    sampleImg: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'selfie_soft',
    name: 'Selfie Soft',
    category: 'Portrait & Glow',
    cssClass: 'filter-selfie-soft',
    iconName: 'Smile',
    description: 'Kulit lebih halus dengan pencahayaan lembut natural',
    defaultCaption: 'Just me, glowing differently today ✨💛',
    accentColor: '#F59E0B',
    sampleImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'foodie_pop',
    name: 'Foodie Pop',
    category: 'Food & Culinary',
    cssClass: 'filter-foodie-pop',
    iconName: 'Utensils',
    description: 'Warna hidangan lebih segar, gurih, dan menggugah selera',
    defaultCaption: 'Food is my genuine love language 🍕🤤 Enak parah!',
    accentColor: '#EF4444',
    sampleImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'moment_retro',
    name: 'Moment Retro',
    category: 'Vintage Film',
    cssClass: 'filter-moment-retro',
    iconName: 'Film',
    description: 'Nuansa kamera analog 90-an dengan grain klasik',
    defaultCaption: 'Living in the golden hour memories 🎞️✨',
    accentColor: '#B45309',
    sampleImg: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'sky_bright',
    name: 'SkyBright',
    category: 'Travel & Nature',
    cssClass: 'filter-sky-bright',
    iconName: 'Sun',
    description: 'Biru langit jernih & pencahayaan outdoor maksimal',
    defaultCaption: 'Sunny skies and high hopes ☀️🌊 Exploring somewhere new.',
    accentColor: '#0EA5E9',
    sampleImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
  }
];

export const QUICKCLIP_EFFECTS: QuickClipEffectItem[] = [
  {
    id: 'blur_lembut',
    name: 'Blur Lembut',
    description: 'Dreamy soft focus dengan kedalaman bokeh',
    iconName: 'Eye',
    cssClass: 'effect-soft-blur',
  },
  {
    id: 'slow_motion',
    name: 'Slow Motion',
    description: 'Perlambat gerakan 0.5x cinematic',
    iconName: 'Clock',
    cssClass: '',
  },
  {
    id: 'color_pop',
    name: 'Color Pop',
    description: 'Saturasi tinggi dan kontras dinamis',
    iconName: 'Zap',
    cssClass: 'effect-color-pop',
  }
];

export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    label: 'WhatsApp Status',
    icon: 'MessageCircle',
    color: '#25D366',
    bgGradient: 'from-emerald-600 to-green-500',
    format: 'Status 24 Jam • 1080x1920',
    description: 'Langsung update ke kontak tersimpan kamu',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    label: 'Instagram Story',
    icon: 'Instagram',
    color: '#E1306C',
    bgGradient: 'from-purple-600 via-pink-500 to-amber-500',
    format: 'Story Reels • 9:16 Full HD',
    description: 'Posting instan dengan audio & stiker',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    label: 'TikTok Post / Story',
    icon: 'Music2',
    color: '#00F2FE',
    bgGradient: 'from-neutral-900 via-cyan-600 to-rose-600',
    format: 'Short Video / Quick Story',
    description: 'Langsung masuk FYP komunitas kamu',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    label: 'Telegram Story',
    icon: 'Send',
    color: '#229ED9',
    bgGradient: 'from-sky-600 to-blue-500',
    format: 'Channel & Personal Story',
    description: 'Share ke channel atau teman telegram',
  }
];

export const SAMPLE_PRESET_SCENES = [
  {
    id: 'cafe',
    title: 'Cafe Aesthetic',
    category: 'Coffee',
    filterId: 'coffee_glow' as const,
    caption: 'Coffee break time ☕ Menyeduh semangat hari ini.',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barista-making-a-latte-art-coffee-43282-large.mp4',
  },
  {
    id: 'nightlife',
    title: 'Night Hangout',
    category: 'Nightlife',
    filterId: 'nightlife_neon' as const,
    caption: 'Friday night vibe on point! ✨🍸 City lights & good times.',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-friends-toasting-with-glasses-of-beer-in-a-bar-42999-large.mp4',
  },
  {
    id: 'food',
    title: 'Delicious Dinner',
    category: 'Foodie',
    filterId: 'foodie_pop' as const,
    caption: 'Food is my genuine love language 🍕🤤 Enak parah!',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-putting-cheese-on-a-homemade-pizza-43075-large.mp4',
  },
  {
    id: 'travel',
    title: 'Sunset Beach',
    category: 'Travel',
    filterId: 'sky_bright' as const,
    caption: 'Chasing sunsets and coastal breeze 🌅🌊 Never want to leave.',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
  },
  {
    id: 'selfie',
    title: 'Golden Hour Selfie',
    category: 'Selfie',
    filterId: 'selfie_soft' as const,
    caption: 'Good lighting and positive thoughts only ✨💛',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-smiling-at-the-camera-in-a-park-42416-large.mp4',
  },
  {
    id: 'vintage',
    title: 'Retro Moment',
    category: 'Retro',
    filterId: 'moment_retro' as const,
    caption: 'Living in the golden hour memories 🎞️✨ Throwback vibes.',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-driving-down-a-coastal-road-at-sunset-41484-large.mp4',
  }
];

export const SMART_CAPTIONS_BY_CATEGORY: Record<string, string[]> = {
  'Coffee Glow': [
    'Coffee break time ☕ Menyeduh semangat hari ini.',
    'Life happens, coffee helps 🤎✨',
    'A cup of warm coffee and deep thoughts ☕',
    'Ngopi dulu biar ga panik 😌☕',
    'Caffeine & good vibes only 🥐☕'
  ],
  'Nightlife Neon': [
    'Friday night vibe on point! ✨🍸 City lights & good times.',
    'Malam masih muda, energi tetap membara! ⚡🌙',
    'Neon lights and midnight talks 🌆✨',
    'Weekend mood: Activated 🕺🎶',
    'Tongkrongan malam asik bareng squad 💫🔥'
  ],
  'Selfie Soft': [
    'Just me, glowing differently today ✨💛',
    'Self-love isn\'t selfish 🌸✨',
    'Golden hour hits different today ☀️✨',
    'Smile bright, stay humble 💛',
    'No filter needed when the heart is happy 💫'
  ],
  'Foodie Pop': [
    'Food is my genuine love language 🍕🤤 Enak parah!',
    'Diet starts tomorrow, makan enak starts now 🍔😋',
    'Good food = Good mood 🍜🔥',
    'Kulineran sore ini juara banget! ⭐⭐⭐⭐⭐',
    'Tiap gigitan penuh kebahagiaan 🍰✨'
  ],
  'Moment Retro': [
    'Living in the golden hour memories 🎞️✨',
    'Vintage souls in a modern world 📽️🤎',
    'Nostalgia rasa 90-an yang ga pernah pudar 📻',
    'Every moment is a collectible memory 📷',
    'Old vibes, timeless feeling 🍂'
  ],
  'SkyBright': [
    'Sunny skies and high hopes ☀️🌊 Exploring somewhere new.',
    'Langit cerah pertanda hari penuh berkah 🌤️',
    'Catch flights, not feelings ✈️🌍',
    'Vitamin Sea dan udara segar 🏝️💙',
    'Selalu ada alasan untuk tersenyum di bawah langit biru 🌈'
  ]
};

// Standard AdMob Test IDs specified by Google
export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
  appIdIos: 'ca-app-pub-3940256099942544~1458695512',
  bannerIdAndroid: 'ca-app-pub-3940256099942544/6300978111',
  bannerIdIos: 'ca-app-pub-3940256099942544/2934735716',
  interstitialIdAndroid: 'ca-app-pub-3940256099942544/1033173712',
  interstitialIdIos: 'ca-app-pub-3940256099942544/4411468910',
  isTestMode: true,
};
