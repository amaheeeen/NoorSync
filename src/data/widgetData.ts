import { CuratedVerse, FastingPlan } from '../types';

export const CURATED_VERSES: Record<'morning' | 'afternoon' | 'night', CuratedVerse> = {
  morning: {
    id: 'verse-morning',
    slot: 'morning',
    surahNumber: 94,
    surahName: 'Al-Insyirah',
    ayahNumber: 5,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    transliteration: "Fa inna ma'al-'usri yusra, inna ma'al-'usri yusra",
    translation: 'Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan.',
    tadabbur: 'Setiap kesulitan yang kita hadapi dalam ikhtiar mencari nafkah dan menuntut ilmu hari ini dijamin oleh Allah selalu berdampingan dengan kelapangan. Mulai hari dengan prasangka baik dan tawakkal penuh.',
    theme: 'Optimisme & Kelapangan Ikhtiar',
    durationSeconds: 16,
  },
  afternoon: {
    id: 'verse-afternoon',
    slot: 'afternoon',
    surahNumber: 28,
    surahName: 'Al-Qashash',
    ayahNumber: 77,
    arabic: 'وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ ۖ وَلَا تَنْسَ نَصِيبَكَ مِنَ الدُّنْيَا',
    transliteration: "Wabtaghi fima atakallahu ad-dara al-akhirata wa la tansa nasibaka minad-dunya...",
    translation: 'Dan carilah pada apa yang telah dianugerahkan Allah kepadamu (kebahagiaan) negeri akhirat, dan janganlah kamu melupakan bahagianmu dari (kenikmatan) duniawi...',
    tadabbur: 'Keahlian profesional dan rezeki siang hari adalah modal memuliakan keluarga dan menebar maslahat sosial. Keseimbangan etos kerja lahir saat urusan dunia dijadikan wasilah ibadah.',
    theme: 'Integritas & Keseimbangan Kerja',
    durationSeconds: 22,
  },
  night: {
    id: 'verse-night',
    slot: 'night',
    surahNumber: 67,
    surahName: 'Al-Mulk',
    ayahNumber: 2,
    arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
    transliteration: "Alladzi khalaqal-mauta wal-hayata liyabluwakum ayyukum ahsanu 'amala...",
    translation: 'Yang menciptakan mati dan hidup, untuk menguji kamu, siapa di antara kamu yang lebih baik amalnya. Dan Dia Maha Perkasa, Maha Pengampun.',
    tadabbur: 'Malam adalah momen tenang untuk muhasabah. Nilai amal tidak diukur dari kebisingan jumlah semata, melainkan kebersihan niat dan ketulusan ihsan sebelum kita merebahkan raga.',
    theme: 'Muhasabah & Kualitas Amal',
    durationSeconds: 20,
  },
};

/**
 * Calculates current time slot based on local hour
 */
export function getCurrentTimeSlot(now: Date = new Date()): 'morning' | 'afternoon' | 'night' {
  const hour = now.getHours();
  if (hour >= 4 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  return 'night';
}

/**
 * Generates dynamic 3-day sunnah fasting lookahead
 */
export function getFastingLookahead(fajrTimeStr = '04:42'): FastingPlan[] {
  // calculate Imsak as Fajr - 10 mins
  const [fh, fm] = fajrTimeStr.split(':').map(Number);
  let totalMin = fh * 60 + fm - 10;
  if (totalMin < 0) totalMin += 1440;
  const imsakH = Math.floor(totalMin / 60);
  const imsakM = totalMin % 60;
  const imsakStr = `${String(imsakH).padStart(2, '0')}:${String(imsakM).padStart(2, '0')}`;

  return [
    {
      id: 'fast-1',
      name: 'Puasa Sunnah Senin',
      hijriDay: '19 Sha’ban 1445 H',
      gregorianDate: 'Senin, 23 Sep',
      daysAway: 1,
      imsakTime: imsakStr,
      fajrTime: fajrTimeStr,
      niatArabic: 'نَوَيْتُ صَوْمَ يَوْمِ الاِثْنَيْنِ سُنَّةً لِلَّهِ تَعَالَى',
      niatLatin: "Nawaitu shauma yaumil-itsnaini sunnatan lillahi Ta'ala",
      sahurAlarmEnabled: true,
    },
    {
      id: 'fast-2',
      name: 'Puasa Sunnah Kamis',
      hijriDay: '22 Sha’ban 1445 H',
      gregorianDate: 'Kamis, 26 Sep',
      daysAway: 4,
      imsakTime: imsakStr,
      fajrTime: fajrTimeStr,
      niatArabic: 'نَوَيْتُ صَوْمَ يَوْمِ الْخَمِيسِ سُنَّةً لِلَّهِ تَعَالَى',
      niatLatin: "Nawaitu shauma yaumil-khamisi sunnatan lillahi Ta'ala",
      sahurAlarmEnabled: false,
    },
    {
      id: 'fast-3',
      name: 'Ayyamul Bidh (13-15)',
      hijriDay: '13-15 Ramadhan 1445 H',
      gregorianDate: 'Pertengahan Bulan',
      daysAway: 12,
      imsakTime: imsakStr,
      fajrTime: fajrTimeStr,
      niatArabic: 'نَوَيْتُ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى',
      niatLatin: "Nawaitu shauma ayyamil-bidhi sunnatan lillahi Ta'ala",
      sahurAlarmEnabled: false,
    },
  ];
}
