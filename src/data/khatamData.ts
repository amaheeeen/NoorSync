import { KhatamPlan } from '../types';

export interface SurahMeta {
  number: number;
  name: string;
  arabic: string;
  startPage: number;
  juz: number;
  totalAyahs: number;
}

export const SURAH_DIRECTORY: SurahMeta[] = [
  { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', startPage: 1, juz: 1, totalAyahs: 7 },
  { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', startPage: 2, juz: 1, totalAyahs: 286 },
  { number: 3, name: 'Ali Imran', arabic: 'آل عمران', startPage: 50, juz: 3, totalAyahs: 200 },
  { number: 4, name: 'An-Nisa', arabic: 'النساء', startPage: 77, juz: 4, totalAyahs: 176 },
  { number: 5, name: 'Al-Maidah', arabic: 'المائدة', startPage: 106, juz: 6, totalAyahs: 120 },
  { number: 6, name: 'Al-Anam', arabic: 'الأنعام', startPage: 128, juz: 7, totalAyahs: 165 },
  { number: 7, name: 'Al-Araf', arabic: 'الأعراف', startPage: 151, juz: 8, totalAyahs: 206 },
  { number: 8, name: 'Al-Anfal', arabic: 'الأنفال', startPage: 177, juz: 9, totalAyahs: 75 },
  { number: 9, name: 'At-Tawbah', arabic: 'التوبة', startPage: 187, juz: 10, totalAyahs: 129 },
  { number: 10, name: 'Yunus', arabic: 'يونس', startPage: 208, juz: 11, totalAyahs: 109 },
  { number: 18, name: 'Al-Kahf', arabic: 'الكهف', startPage: 293, juz: 15, totalAyahs: 110 },
  { number: 19, name: 'Maryam', arabic: 'مريم', startPage: 305, juz: 16, totalAyahs: 98 },
  { number: 20, name: 'Taha', arabic: 'طه', startPage: 312, juz: 16, totalAyahs: 135 },
  { number: 36, name: 'Yasin', arabic: 'يس', startPage: 440, juz: 22, totalAyahs: 83 },
  { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', startPage: 531, juz: 27, totalAyahs: 78 },
  { number: 56, name: 'Al-Waqiah', arabic: 'الواقعة', startPage: 534, juz: 27, totalAyahs: 96 },
  { number: 67, name: 'Al-Mulk', arabic: 'الملك', startPage: 562, juz: 29, totalAyahs: 30 },
  { number: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', startPage: 604, juz: 30, totalAyahs: 4 },
  { number: 113, name: 'Al-Falaq', arabic: 'الفلق', startPage: 604, juz: 30, totalAyahs: 5 },
  { number: 114, name: 'An-Nas', arabic: 'الناس', startPage: 604, juz: 30, totalAyahs: 6 },
];

export function getSurahAndJuzForPage(page: number): { surah: string; juz: number } {
  const safePage = Math.min(604, Math.max(1, page));
  // Find largest startPage <= safePage
  let matched = SURAH_DIRECTORY[0];
  for (const s of SURAH_DIRECTORY) {
    if (s.startPage <= safePage) {
      matched = s;
    } else {
      break;
    }
  }
  // Standard Madinah Mushaf has 20 pages per Juz (Juz 1: 1-21, Juz 30: 582-604)
  const juz = Math.min(30, Math.max(1, Math.ceil(safePage / 20.13)));
  return {
    surah: matched.name,
    juz,
  };
}

export function getDefaultKhatamPlan(): KhatamPlan {
  const todayStr = new Date().toISOString().split('T')[0];
  return {
    id: 'default_khatam_plan',
    targetMode: 'pages_per_day',
    pagesPerDayTarget: 4, // 4 pages per day = 1 Juz every 5 days
    currentPage: 1,
    currentSurah: 'Al-Fatihah',
    currentAyah: 1,
    currentJuz: 1,
    lastReadDate: todayStr,
    dailyLog: { [todayStr]: 0 },
    streakDays: 1,
    startDate: todayStr,
    targetTotalPages: 604,
  };
}
