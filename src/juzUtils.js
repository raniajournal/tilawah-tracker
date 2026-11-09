// ==========================================
// DATA BATAS 30 JUZ AL-QUR'AN (STANDAR MADINAH)
// ==========================================
export const JUZ_DATA = [
  { juz: 1, totalAyahs: 148, start: { surah: 1, ayah: 1 }, end: { surah: 2, ayah: 141 } },
  { juz: 2, totalAyahs: 111, start: { surah: 2, ayah: 142 }, end: { surah: 2, ayah: 252 } },
  { juz: 3, totalAyahs: 126, start: { surah: 2, ayah: 253 }, end: { surah: 3, ayah: 92 } },
  { juz: 4, totalAyahs: 131, start: { surah: 3, ayah: 93 }, end: { surah: 4, ayah: 23 } },
  { juz: 5, totalAyahs: 124, start: { surah: 4, ayah: 24 }, end: { surah: 4, ayah: 147 } },
  { juz: 6, totalAyahs: 110, start: { surah: 4, ayah: 148 }, end: { surah: 5, ayah: 81 } },
  { juz: 7, totalAyahs: 149, start: { surah: 5, ayah: 82 }, end: { surah: 6, ayah: 110 } },
  { juz: 8, totalAyahs: 142, start: { surah: 6, ayah: 111 }, end: { surah: 7, ayah: 87 } },
  { juz: 9, totalAyahs: 159, start: { surah: 7, ayah: 88 }, end: { surah: 8, ayah: 40 } },
  { juz: 10, totalAyahs: 127, start: { surah: 8, ayah: 41 }, end: { surah: 9, ayah: 92 } },
  { juz: 11, totalAyahs: 151, start: { surah: 9, ayah: 93 }, end: { surah: 11, ayah: 5 } },
  { juz: 12, totalAyahs: 170, start: { surah: 11, ayah: 6 }, end: { surah: 12, ayah: 52 } },
  { juz: 13, totalAyahs: 154, start: { surah: 12, ayah: 53 }, end: { surah: 14, ayah: 52 } },
  { juz: 14, totalAyahs: 227, start: { surah: 15, ayah: 1 }, end: { surah: 16, ayah: 128 } },
  { juz: 15, totalAyahs: 185, start: { surah: 17, ayah: 1 }, end: { surah: 18, ayah: 74 } },
  { juz: 16, totalAyahs: 269, start: { surah: 18, ayah: 75 }, end: { surah: 20, ayah: 135 } },
  { juz: 17, totalAyahs: 190, start: { surah: 21, ayah: 1 }, end: { surah: 22, ayah: 78 } },
  { juz: 18, totalAyahs: 202, start: { surah: 23, ayah: 1 }, end: { surah: 25, ayah: 20 } },
  { juz: 19, totalAyahs: 339, start: { surah: 25, ayah: 21 }, end: { surah: 27, ayah: 55 } },
  { juz: 20, totalAyahs: 171, start: { surah: 27, ayah: 56 }, end: { surah: 29, ayah: 45 } },
  { juz: 21, totalAyahs: 178, start: { surah: 29, ayah: 46 }, end: { surah: 33, ayah: 30 } },
  { juz: 22, totalAyahs: 169, start: { surah: 33, ayah: 31 }, end: { surah: 36, ayah: 27 } },
  { juz: 23, totalAyahs: 357, start: { surah: 36, ayah: 28 }, end: { surah: 39, ayah: 31 } },
  { juz: 24, totalAyahs: 175, start: { surah: 39, ayah: 32 }, end: { surah: 41, ayah: 46 } },
  { juz: 25, totalAyahs: 246, start: { surah: 41, ayah: 47 }, end: { surah: 45, ayah: 37 } },
  { juz: 26, totalAyahs: 195, start: { surah: 46, ayah: 1 }, end: { surah: 51, ayah: 30 } },
  { juz: 27, totalAyahs: 399, start: { surah: 51, ayah: 31 }, end: { surah: 57, ayah: 29 } },
  { juz: 28, totalAyahs: 137, start: { surah: 58, ayah: 1 }, end: { surah: 66, ayah: 12 } },
  { juz: 29, totalAyahs: 431, start: { surah: 67, ayah: 1 }, end: { surah: 77, ayah: 50 } },
  { juz: 30, totalAyahs: 564, start: { surah: 78, ayah: 1 }, end: { surah: 114, ayah: 6 } }
];

// ==========================================
// FUNGSI PENCARI JUZ BERDASARKAN SURAH & AYAT
// ==========================================
/**
 * Mencari target Juz dari input Surah dan Ayat
 * @param {number} surahNumber - Nomor Surah (1 - 114)
 * @param {number} ayahNumber - Nomor Ayat
 * @returns {object} - Objek data Juz yang ditemukan
 */
export const getJuzFromSurahAndAyah = (surahNumber, ayahNumber) => {
  return JUZ_DATA.find(juz => {
    // Cek apakah posisinya SETELAH atau SAMA DENGAN batas awal Juz
    const isAfterStart = (surahNumber > juz.start.surah) || 
                         (surahNumber === juz.start.surah && ayahNumber >= juz.start.ayah);
    
    // Cek apakah posisinya SEBELUM atau SAMA DENGAN batas akhir Juz
    const isBeforeEnd = (surahNumber < juz.end.surah) || 
                        (surahNumber === juz.end.surah && ayahNumber <= juz.end.ayah);
    
    return isAfterStart && isBeforeEnd;
  });
};

// ==========================================
// FUNGSI PENGHITUNG PERSENTASE (UNTUK 1/4 JUZ)
// ==========================================
/**
 * Menghitung persentase progress dan status 1/4 (Quarter) untuk UI Peta
 * @param {number} ayatRead - Jumlah ayat yang sudah dibaca di Juz ini
 * @param {number} totalAyahs - Total keseluruhan ayat di Juz ini
 * @returns {object} - Persentase dan array status 4 titik (quarters)
 */
export const calculateJuzProgress = (ayatRead, totalAyahs) => {
  const percentage = Math.min((ayatRead / totalAyahs) * 100, 100);
  
  // Status menyala untuk 4 titik (Quarter)
  const quarters = [
    percentage >= 25,  // Titik 1 (1/4)
    percentage >= 50,  // Titik 2 (2/4)
    percentage >= 75,  // Titik 3 (3/4)
    percentage >= 100  // Full Khatam Juz
  ];

  return { percentage, quarters, isCompleted: percentage >= 100 };
};
