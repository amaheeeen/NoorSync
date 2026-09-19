export type TabType =
  | 'dashboard'
  | 'khatam'
  | 'reflections'
  | 'audio'
  | 'istikharah'
  | 'tasbih'
  | 'vault'
  | 'settings';

export type CalculationMethod = 'kemenag' | 'mwl' | 'egypt' | 'makkah' | 'karachi';
export type Madhab = 'shafi' | 'hanafi';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export type SholatSlot = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type SholatStatusType = 'jamaah' | 'munfarid' | 'masbuq' | 'udzur';

export interface SholatEntry {
  completed: boolean;
  timestamp?: string;
  type: SholatStatusType;
}

export type DaySholatLog = Record<SholatSlot, SholatEntry>;

export interface SholatDailyLog {
  date: string; // YYYY-MM-DD
  slots: DaySholatLog;
  savedAt?: number;
}

export type PrayerClockStatus = 'normal' | 'adzan' | 'iqamah_dnd';

export interface CityLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezoneOffset: number;
}

export interface TasbihItem {
  name: string;
  arabic: string;
  target: number;
}

export interface AdhkarItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  count: string;
  category: 'pagi' | 'petang' | 'sholat' | 'harian';
}

export interface IstikharahStep {
  title: string;
  subtitle: string;
  iconName: string;
  niyyah?: string;
  surahRecommendation?: string;
  body: string[];
  tip?: string;
}

export type VerseTimeSlot = 'morning' | 'afternoon' | 'night';

export interface CuratedVerse {
  id: string;
  slot: VerseTimeSlot;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabic: string;
  transliteration: string;
  translation: string;
  tadabbur: string;
  theme: string;
  durationSeconds: number;
}

export interface SedekahRecord {
  id: string;
  date: string;
  amount: number;
}

export interface FastingPlan {
  id: string;
  name: string;
  hijriDay: string;
  gregorianDate: string;
  daysAway: number;
  imsakTime: string;
  fajrTime: string;
  niatArabic: string;
  niatLatin: string;
  sahurAlarmEnabled: boolean;
}

// 1. Quranly-inspired Khatam & Reading Habit Model
export type KhatamTargetMode = 'pages_per_day' | 'target_date' | 'juz_per_week';

export interface KhatamPlan {
  id: string;
  targetMode: KhatamTargetMode;
  pagesPerDayTarget: number;
  targetDate?: string; // YYYY-MM-DD
  currentPage: number; // 1 to 604
  currentSurah: string;
  currentAyah: number;
  currentJuz: number;
  lastReadDate: string;
  dailyLog: Record<string, number>; // date -> pages read today
  streakDays: number;
  startDate: string;
  targetTotalPages: number; // default 604
}

// 2. Personal Dua & Istikharah Reflection Vault
export type ReflectionStatus = 'active' | 'granted' | 'reflecting';
export type ReflectionCategory = 'istikharah' | 'hajat' | 'syukur' | 'kehidupan' | 'keluarga';

export interface ReflectionItem {
  id: string;
  title: string;
  decisionOrDua: string;
  notes: string;
  category: ReflectionCategory;
  status: ReflectionStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  sentimentScore?: number; // 1 to 5
  linkedPrayer?: SholatSlot | 'Tahajjud' | 'Istikharah' | 'Hajat';
}

// 3. Suhoor & Imsak Engine
export interface SuhoorConfig {
  imsakLeadMinutes: number; // default 10 minutes before Fajr
  wakeLeadMinutes: number; // e.g. 45 or 60 minutes before Imsak
  gentleChimeEnabled: boolean;
  recitationAudioEnabled: boolean;
  activeFastingDays: ('senin' | 'kamis' | 'ayyamul_bidh' | 'ramadan' | 'custom')[];
}

// 4. High-Fidelity Audio Track Model
export interface AudioTrack {
  id: string;
  title: string;
  arabicTitle: string;
  surahNumber?: number;
  category: 'surah' | 'adhkar' | 'recitation';
  durationText: string;
  durationSeconds: number;
  description: string;
  virtue: string;
  audioUrl?: string;
  qari?: string;
}


