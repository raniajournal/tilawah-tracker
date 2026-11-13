import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { JUZ_DATA, getJuzFromSurahAndAyah } from "./juzUtils";
import JourneyMap from "./components/JourneyMap/JourneyMap";

const SURAHS = [
  { id: 1, name: "Al-Fatihah", meaning: "Pembukaan", ayahs: 7, juz: "Juz 1" },
  { id: 2, name: "Al-Baqarah", meaning: "Sapi Betina", ayahs: 286, juz: "Juz 1 - 3" },
  { id: 3, name: "Ali 'Imran", meaning: "Keluarga 'Imran", ayahs: 200, juz: "Juz 3 - 4" },
  { id: 4, name: "An-Nisa'", meaning: "Wanita", ayahs: 176, juz: "Juz 4 - 6" },
  { id: 5, name: "Al-Ma'idah", meaning: "Jamuan", ayahs: 120, juz: "Juz 6 - 7" },
  { id: 6, name: "Al-An'am", meaning: "Binatang Ternak", ayahs: 165, juz: "Juz 7 - 8" },
  { id: 7, name: "Al-A'raf", meaning: "Tempat yang Tertinggi", ayahs: 206, juz: "Juz 8 - 9" },
  { id: 8, name: "Al-Anfal", meaning: "Harta Rampasan Perang", ayahs: 75, juz: "Juz 9 - 10" },
  { id: 9, name: "At-Taubah", meaning: "Pengampunan", ayahs: 129, juz: "Juz 10 - 11" },
  { id: 10, name: "Yunus", meaning: "Nabi Yunus", ayahs: 109, juz: "Juz 11" },
  { id: 11, name: "Hud", meaning: "Nabi Hud", ayahs: 123, juz: "Juz 11 - 12" },
  { id: 12, name: "Yusuf", meaning: "Nabi Yusuf", ayahs: 111, juz: "Juz 12 - 13" },
  { id: 13, name: "Ar-Ra'd", meaning: "Guruh", ayahs: 43, juz: "Juz 13" },
  { id: 14, name: "Ibrahim", meaning: "Nabi Ibrahim", ayahs: 52, juz: "Juz 13" },
  { id: 15, name: "Al-Hijr", meaning: "Lembah Al-Hijr", ayahs: 99, juz: "Juz 14" },
  { id: 16, name: "An-Nahl", meaning: "Lebah", ayahs: 128, juz: "Juz 14" },
  { id: 17, name: "Al-Isra'", meaning: "Perjalanan Malam", ayahs: 111, juz: "Juz 15" },
  { id: 18, name: "Al-Kahf", meaning: "Penghuni Gua", ayahs: 110, juz: "Juz 15 - 16" },
  { id: 19, name: "Maryam", meaning: "Siti Maryam", ayahs: 98, juz: "Juz 16" },
  { id: 20, name: "Taha", meaning: "Ta Ha", ayahs: 135, juz: "Juz 16" },
  { id: 21, name: "Al-Anbiya", meaning: "Nabi-Nabi", ayahs: 112, juz: "Juz 17" },
  { id: 22, name: "Al-Hajj", meaning: "Haji", ayahs: 78, juz: "Juz 17" },
  { id: 23, name: "Al-Mu'minun", meaning: "Orang-Orang Mukmin", ayahs: 118, juz: "Juz 18" },
  { id: 24, name: "An-Nur", meaning: "Cahaya", ayahs: 64, juz: "Juz 18" },
  { id: 25, name: "Al-Furqan", meaning: "Pembeda", ayahs: 77, juz: "Juz 18 - 19" },
  { id: 26, name: "Asy-Syu'ara'", meaning: "Para Penyair", ayahs: 227, juz: "Juz 19" },
  { id: 27, name: "An-Naml", meaning: "Semut", ayahs: 93, juz: "Juz 19 - 20" },
  { id: 28, name: "Al-Qasas", meaning: "Kisah-Kisah", ayahs: 88, juz: "Juz 20" },
  { id: 29, name: "Al-'Ankabut", meaning: "Laba-Laba", ayahs: 69, juz: "Juz 20 - 21" },
  { id: 30, name: "Ar-Rum", meaning: "Bangsa Romawi", ayahs: 60, juz: "Juz 21" },
  { id: 31, name: "Luqman", meaning: "Luqman", ayahs: 34, juz: "Juz 21" },
  { id: 32, name: "As-Sajdah", meaning: "Sujud", ayahs: 30, juz: "Juz 21" },
  { id: 33, name: "Al-Ahzab", meaning: "Golongan Bersekutu", ayahs: 73, juz: "Juz 21 - 22" },
  { id: 34, name: "Saba'", meaning: "Kaum Saba'", ayahs: 54, juz: "Juz 22" },
  { id: 35, name: "Fatir", meaning: "Pencipta", ayahs: 45, juz: "Juz 22" },
  { id: 36, name: "Yasin", meaning: "Ya Sin", ayahs: 83, juz: "Juz 22 - 23" },
  { id: 37, name: "As-Saffat", meaning: "Barisan-Barisan", ayahs: 182, juz: "Juz 23" },
  { id: 38, name: "Sad", meaning: "Sad", ayahs: 88, juz: "Juz 23" },
  { id: 39, name: "Az-Zumar", meaning: "Rombongan-Rombongan", ayahs: 75, juz: "Juz 23 - 24" },
  { id: 40, name: "Ghafir", meaning: "Yang Mengampuni", ayahs: 85, juz: "Juz 24" },
  { id: 41, name: "Fussilat", meaning: "Yang Dijelaskan", ayahs: 54, juz: "Juz 24 - 25" },
  { id: 42, name: "Asy-Syura", meaning: "Musyawarah", ayahs: 53, juz: "Juz 25" },
  { id: 43, name: "Az-Zukhruf", meaning: "Perhiasan", ayahs: 89, juz: "Juz 25" },
  { id: 44, name: "Ad-Dukhan", meaning: "Kabut", ayahs: 59, juz: "Juz 25" },
  { id: 45, name: "Al-Jasiyah", meaning: "Yang Berlutut", ayahs: 37, juz: "Juz 25" },
  { id: 46, name: "Al-Ahqaf", meaning: "Bukit Pasir", ayahs: 35, juz: "Juz 26" },
  { id: 47, name: "Muhammad", meaning: "Nabi Muhammad", ayahs: 38, juz: "Juz 26" },
  { id: 48, name: "Al-Fath", meaning: "Kemenangan", ayahs: 29, juz: "Juz 26" },
  { id: 49, name: "Al-Hujurat", meaning: "Kamar-Kamar", ayahs: 18, juz: "Juz 26" },
  { id: 50, name: "Qaf", meaning: "Qaf", ayahs: 45, juz: "Juz 26" },
  { id: 51, name: "Az-Zariyat", meaning: "Angin Menerbangkan", ayahs: 60, juz: "Juz 26 - 27" },
  { id: 52, name: "At-Tur", meaning: "Bukit", ayahs: 49, juz: "Juz 27" },
  { id: 53, name: "An-Najm", meaning: "Bintang", ayahs: 62, juz: "Juz 27" },
  { id: 54, name: "Al-Qamar", meaning: "Bulan", ayahs: 55, juz: "Juz 27" },
  { id: 55, name: "Ar-Rahman", meaning: "Yang Maha Pengasih", ayahs: 78, juz: "Juz 27" },
  { id: 56, name: "Al-Waqi'ah", meaning: "Hari Kiamat", ayahs: 96, juz: "Juz 27" },
  { id: 57, name: "Al-Hadid", meaning: "Besi", ayahs: 29, juz: "Juz 27" },
  { id: 58, name: "Al-Mujadilah", meaning: "Gugatan", ayahs: 22, juz: "Juz 28" },
  { id: 59, name: "Al-Hasyr", meaning: "Pengusiran", ayahs: 24, juz: "Juz 28" },
  { id: 60, name: "Al-Mumtahanah", meaning: "Wanita yang Diuji", ayahs: 13, juz: "Juz 28" },
  { id: 61, name: "As-Saff", meaning: "Barisan", ayahs: 14, juz: "Juz 28" },
  { id: 62, name: "Al-Jumu'ah", meaning: "Hari Jumat", ayahs: 11, juz: "Juz 28" },
  { id: 63, name: "Al-Munafiqun", meaning: "Orang Munafik", ayahs: 11, juz: "Juz 28" },
  { id: 64, name: "At-Tagabun", meaning: "Hari Penampakan", ayahs: 18, juz: "Juz 28" },
  { id: 65, name: "At-Talaq", meaning: "Talak", ayahs: 12, juz: "Juz 28" },
  { id: 66, name: "At-Tahrim", meaning: "Pengharaman", ayahs: 12, juz: "Juz 28" },
  { id: 67, name: "Al-Mulk", meaning: "Kerajaan", ayahs: 30, juz: "Juz 29" },
  { id: 68, name: "Al-Qalam", meaning: "Pena", ayahs: 52, juz: "Juz 29" },
  { id: 69, name: "Al-Haqqah", meaning: "Hari Kiamat", ayahs: 52, juz: "Juz 29" },
  { id: 70, name: "Al-Ma'arij", meaning: "Tempat Naik", ayahs: 44, juz: "Juz 29" },
  { id: 71, name: "Nuh", meaning: "Nabi Nuh", ayahs: 28, juz: "Juz 29" },
  { id: 72, name: "Al-Jinn", meaning: "Jin", ayahs: 28, juz: "Juz 29" },
  { id: 73, name: "Al-Muzzammil", meaning: "Orang Berselimut", ayahs: 20, juz: "Juz 29" },
  { id: 74, name: "Al-Muddassir", meaning: "Orang Berkemul", ayahs: 56, juz: "Juz 29" },
  { id: 75, name: "Al-Qiyamah", meaning: "Hari Kiamat", ayahs: 40, juz: "Juz 29" },
  { id: 76, name: "Al-Insan", meaning: "Manusia", ayahs: 31, juz: "Juz 29" },
  { id: 77, name: "Al-Mursalat", meaning: "Malaikat Utusan", ayahs: 50, juz: "Juz 29" },
  { id: 78, name: "An-Naba'", meaning: "Berita Besar", ayahs: 40, juz: "Juz 30" },
  { id: 79, name: "An-Nazi'at", meaning: "Malaikat Mencabut", ayahs: 46, juz: "Juz 30" },
  { id: 80, name: "'Abasa", meaning: "Bermuka Masam", ayahs: 42, juz: "Juz 30" },
  { id: 81, name: "At-Takwir", meaning: "Menggulung", ayahs: 29, juz: "Juz 30" },
  { id: 82, name: "Al-Infitar", meaning: "Terbelah", ayahs: 19, juz: "Juz 30" },
  { id: 83, name: "Al-Mutaffifin", meaning: "Orang Curang", ayahs: 36, juz: "Juz 30" },
  { id: 84, name: "Al-Insyiqaq", meaning: "Terbelah", ayahs: 25, juz: "Juz 30" },
  { id: 85, name: "Al-Buruj", meaning: "Gugusan Bintang", ayahs: 22, juz: "Juz 30" },
  { id: 86, name: "At-Tariq", meaning: "Datang Malam Hari", ayahs: 17, juz: "Juz 30" },
  { id: 87, name: "Al-A'la", meaning: "Paling Tinggi", ayahs: 19, juz: "Juz 30" },
  { id: 88, name: "Al-Gasyiyah", meaning: "Hari Kiamat", ayahs: 26, juz: "Juz 30" },
  { id: 89, name: "Al-Fajr", meaning: "Fajar", ayahs: 30, juz: "Juz 30" },
  { id: 90, name: "Al-Balad", meaning: "Negeri", ayahs: 20, juz: "Juz 30" },
  { id: 91, name: "Asy-Syams", meaning: "Matahari", ayahs: 15, juz: "Juz 30" },
  { id: 92, name: "Al-Lail", meaning: "Malam", ayahs: 21, juz: "Juz 30" },
  { id: 93, name: "Ad-Duha", meaning: "Waktu Duha", ayahs: 11, juz: "Juz 30" },
  { id: 94, name: "Asy-Syarh", meaning: "Melapangkan", ayahs: 8, juz: "Juz 30" },
  { id: 95, name: "At-Tin", meaning: "Buah Tin", ayahs: 8, juz: "Juz 30" },
  { id: 96, name: "Al-'Alaq", meaning: "Segumpal Darah", ayahs: 19, juz: "Juz 30" },
  { id: 97, name: "Al-Qadr", meaning: "Kemuliaan", ayahs: 5, juz: "Juz 30" },
  { id: 98, name: "Al-Bayyinah", meaning: "Bukti Nyata", ayahs: 8, juz: "Juz 30" },
  { id: 99, name: "Az-Zalzalah", meaning: "Kegoncangan", ayahs: 8, juz: "Juz 30" },
  { id: 100, name: "Al-'Adiyat", meaning: "Kuda Berlari", ayahs: 11, juz: "Juz 30" },
  { id: 101, name: "Al-Qari'ah", meaning: "Hari Kiamat", ayahs: 11, juz: "Juz 30" },
  { id: 102, name: "At-Takasur", meaning: "Bermegah-megahan", ayahs: 8, juz: "Juz 30" },
  { id: 103, name: "Al-'Asr", meaning: "Masa", ayahs: 3, juz: "Juz 30" },
  { id: 104, name: "Al-Humazah", meaning: "Pengumpat", ayahs: 9, juz: "Juz 30" },
  { id: 105, name: "Al-Fil", meaning: "Gajah", ayahs: 5, juz: "Juz 30" },
  { id: 106, name: "Quraisy", meaning: "Suku Quraisy", ayahs: 4, juz: "Juz 30" },
  { id: 107, name: "Al-Ma'un", meaning: "Barang Berguna", ayahs: 7, juz: "Juz 30" },
  { id: 108, name: "Al-Kausar", meaning: "Nikmat Berlimpah", ayahs: 3, juz: "Juz 30" },
  { id: 109, name: "Al-Kafirun", meaning: "Orang Kafir", ayahs: 6, juz: "Juz 30" },
  { id: 110, name: "An-Nasr", meaning: "Pertolongan", ayahs: 3, juz: "Juz 30" },
  { id: 111, name: "Al-Lahab", meaning: "Gejolak Api", ayahs: 5, juz: "Juz 30" },
  { id: 112, name: "Al-Ikhlas", meaning: "Ikhlas", ayahs: 4, juz: "Juz 30" },
  { id: 113, name: "Al-Falaq", meaning: "Waktu Subuh", ayahs: 5, juz: "Juz 30" },
  { id: 114, name: "An-Nas", meaning: "Manusia", ayahs: 6, juz: "Juz 30" }
];

const getProgressBarColor = (percent) => {
  if (percent < 50) return "#fcd34d";
  if (percent < 100) return "#fb923c";
  return "#2b7a5f";
};

const getLastNDays = (n) => {
  const dates = [];
  const dayNames = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push({
      fullDate: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      dateNum: d.getDate(),
      monthNum: d.getMonth() + 1
    });
  }
  return dates;
};

// Menghasilkan daftar tanggal YYYY-MM-DD di antara dua tanggal
const getDatesBetween = (startDateStr, endDateStr) => {
  const dates = [];
  if (!startDateStr || !endDateStr) return dates;
  let curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const computeJuzMapFromProgress = (progressObj) => {
  const newJuzMap = Array.from({ length: 30 }, (_, i) => ({
    juz: i + 1, ayatRead: 0, isCompleted: false
  }));
  if (!JUZ_DATA || JUZ_DATA.length === 0) return newJuzMap;

  JUZ_DATA.forEach((juz, index) => {
    let ayahsInThisJuzRead = 0;
    for (let s = juz.start.surah; s <= juz.end.surah; s++) {
      const readCount = progressObj[s]?.read || 0;
      if (readCount === 0) continue;

      if (juz.start.surah === juz.end.surah) {
        if (readCount >= juz.start.ayah) ayahsInThisJuzRead += Math.min(readCount, juz.end.ayah) - juz.start.ayah + 1;
      } else if (s === juz.start.surah) {
        if (readCount >= juz.start.ayah) ayahsInThisJuzRead += readCount - juz.start.ayah + 1;
      } else if (s === juz.end.surah) {
        ayahsInThisJuzRead += Math.min(readCount, juz.end.ayah);
      } else {
        ayahsInThisJuzRead += readCount;
      }
    }
    newJuzMap[index].ayatRead = ayahsInThisJuzRead;
    newJuzMap[index].isCompleted = ayahsInThisJuzRead >= juz.totalAyahs;
  });
  return newJuzMap;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState({ khatamCount: 1, startDate: new Date().toISOString().split('T')[0] });
  const [target, setTarget] = useState({ type: 'daily', value: 20 });

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("7");

  const [date, setDate] = useState("");
  const [startAyah, setStartAyah] = useState("");
  const [endAyah, setEndAyah] = useState("");
  const [tempTargetType, setTempTargetType] = useState("daily");
  const [tempTargetValue, setTempTargetValue] = useState("");

  const [journeyMode, setJourneyMode] = useState("FREE");
  const [activeJuz, setActiveJuz] = useState(1);

  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneZone, setMilestoneZone] = useState(null);

  // STATE STREAK & PAUSE HAID
  const [isHaidPaused, setIsHaidPaused] = useState(false);
  const [pausedDates, setPausedDates] = useState([]);
  const [lastPauseStart, setLastPauseStart] = useState(null);
  const [showHaidModal, setShowHaidModal] = useState(false);
  const [haidStartInput, setHaidStartInput] = useState("");
  const [haidEndInput, setHaidEndInput] = useState("");

  const juzProgress = useMemo(() => computeJuzMapFromProgress(progress), [progress]);
  const [longestStreak, setLongestStreak] = useState(0);

  // STATE UNTUK HALAMAN LENCANA
  const [showBadgesOverlay, setShowBadgesOverlay] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProgress(data.progress || {});
            setStats(data.stats || { khatamCount: 1, startDate: new Date().toISOString().split('T')[0] });
            setTarget(data.target || { type: 'daily', value: 20 });
            if (data.journeyMode) setJourneyMode(data.journeyMode);
            if (data.activeJuz) setActiveJuz(data.activeJuz);
            if (typeof data.isHaidPaused === "boolean") setIsHaidPaused(data.isHaidPaused);
            if (data.pausedDates) setPausedDates(data.pausedDates);
            if (data.lastPauseStart !== undefined) setLastPauseStart(data.lastPauseStart);
            if (data.longestStreak !== undefined) setLongestStreak(data.longestStreak);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const openSurah = (surah) => {
    setSelectedSurah(surah);
    const surahData = progress[surah.id] || { read: 0, history: [] };
    setStartAyah(surahData.read >= surah.ayahs ? surah.ayahs : surahData.read + 1);
    setEndAyah("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  const toggleJourneyMode = async (mode) => {
    setJourneyMode(mode);
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { journeyMode: mode }, { merge: true });
  };

  // FUNGSI TOGGLE PAUSE HAID
  const toggleHaidPause = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const nextPauseState = !isHaidPaused;
    let updatedPausedDates = [...pausedDates];
    let nextPauseStart = lastPauseStart;

    if (nextPauseState) {
      // Saat mengaktifkan Pause Haid
      nextPauseStart = todayStr;
      if (!updatedPausedDates.includes(todayStr)) {
        updatedPausedDates.push(todayStr);
      }
    } else {
      // Saat mematikan Pause Haid
      if (lastPauseStart) {
        if (lastPauseStart === todayStr) {
          // Jika dinyalakan & dimatikan di hari yang sama, hapus hari ini dari daftar pause
          updatedPausedDates = updatedPausedDates.filter(d => d !== todayStr);
        } else {
          // Simpan seluruh rentang hari istirahat haid sebelumnya
          const range = getDatesBetween(lastPauseStart, todayStr);
          range.forEach(d => {
            if (!updatedPausedDates.includes(d)) updatedPausedDates.push(d);
          });
        }
      }
      nextPauseStart = null;
    }

    setIsHaidPaused(nextPauseState);
    setPausedDates(updatedPausedDates);
    setLastPauseStart(nextPauseStart);

    await setDoc(doc(db, "users", user.uid), {
      isHaidPaused: nextPauseState,
      pausedDates: updatedPausedDates,
      lastPauseStart: nextPauseStart
    }, { merge: true });
  };

  // FUNGSI SEMENTARA: RESET DATA HAID SAJA (TANPA HAPUS RIWAYAT TILAWAH)
  const resetHaidTrial = async () => {
    if (!user) return;
    if (window.confirm("Reset data uji coba haid saja? (Riwayat tilawah tetap aman)")) {
      setIsHaidPaused(false);
      setPausedDates([]);
      setLastPauseStart(null);

      await setDoc(doc(db, "users", user.uid), {
        isHaidPaused: false,
        pausedDates: [],
        lastPauseStart: null
      }, { merge: true });
    }
  };

  const saveManualHaid = async () => {
    if (!user) return;
    if (!haidStartInput || !haidEndInput) {
      alert("Pilih tanggal awal dan akhir istirahatmu!");
      return;
    }
    
    // Ambil rentang tanggal dan gabungkan dengan data yang sudah ada
    const range = getDatesBetween(haidStartInput, haidEndInput);
    const newPausedDates = [...new Set([...pausedDates, ...range])]; // Set mencegah duplikat
    
    setPausedDates(newPausedDates);
    await setDoc(doc(db, "users", user.uid), {
      pausedDates: newPausedDates
    }, { merge: true });

    setShowHaidModal(false);
    setHaidStartInput("");
    setHaidEndInput("");
  };
  
  const saveTracking = async (isComplete = false) => {
    if (!user) return;
    let readCount = progress[selectedSurah.id]?.read || 0;
    let newHistory = [...(progress[selectedSurah.id]?.history || [])];
    const currentTime = Date.now();
    let ayahsAdded = 0;
    const historyId = currentTime.toString();
    const end = parseInt(endAyah);
    const start = parseInt(startAyah);

    if (isComplete || end === selectedSurah.ayahs) {
      ayahsAdded = isComplete ? (selectedSurah.ayahs - readCount) : ((end - start) + 1);
      if (ayahsAdded < 0) ayahsAdded = 0;
      readCount = selectedSurah.ayahs;
      newHistory.unshift({ id: historyId, date, note: "Selesai 100%", timestamp: currentTime, ayahsAdded });
    } else {
      if (end > readCount) {
        ayahsAdded = (end - start) + 1;
        readCount = end;
      }
      newHistory.unshift({ id: historyId, date, note: `Ayat ${startAyah} - ${endAyah}`, timestamp: currentTime, ayahsAdded });
    }

    const updatedProgress = { ...progress, [selectedSurah.id]: { read: readCount, history: newHistory } };
    const updatedJuzMap = computeJuzMapFromProgress(updatedProgress);

    let newActiveJuz = activeJuz;
    const targetEnd = isComplete ? selectedSurah.ayahs : parseInt(endAyah);
    const targetJuzData = getJuzFromSurahAndAyah(selectedSurah.id, targetEnd);

    if (targetJuzData && ayahsAdded > 0 && journeyMode === 'FREE') {
      newActiveJuz = targetJuzData.juz;
    }

    const milestoneZones = [
      { id: 1, title: "GOLDEN SUNRISE", icon: "🌅", startJuz: 1, endJuz: 6, boundarySurah: 5, boundaryAyah: 81 },
      { id: 2, title: "DAWN SPRINGS", icon: "🏜️", startJuz: 7, endJuz: 12, boundarySurah: 12, boundaryAyah: 52 },
      { id: 3, title: "PALM VALLEY", icon: "🌴", startJuz: 13, endJuz: 18, boundarySurah: 25, boundaryAyah: 20 },
      { id: 4, title: "LANTERN TRAIL", icon: "🏮", startJuz: 19, endJuz: 24, boundarySurah: 41, boundaryAyah: 46 },
      { id: 5, title: "STARRY NIGHT", icon: "✨", startJuz: 25, endJuz: 30, boundarySurah: 114, boundaryAyah: 6 }
    ];

    const oldSurahRead = progress[selectedSurah.id]?.read || 0;

    for (const z of milestoneZones) {
      const wasJuzCompleted = juzProgress[z.endJuz - 1]?.isCompleted;
      const isNowJuzCompleted = updatedJuzMap[z.endJuz - 1]?.isCompleted;

      const crossedBoundaryInThisSurah =
        selectedSurah.id === z.boundarySurah &&
        oldSurahRead < z.boundaryAyah &&
        readCount >= z.boundaryAyah;

      if ((!wasJuzCompleted && isNowJuzCompleted) || crossedBoundaryInThisSurah) {
        setMilestoneZone(z);
        setShowMilestone(true);
        break;
      }
    }

    setActiveJuz(newActiveJuz);
    setStartAyah(readCount >= selectedSurah.ayahs ? selectedSurah.ayahs : readCount + 1);
    setEndAyah("");

    // --- Kalkulasi untuk Longest Streak (Real-time update) ---
    // Karena kita baru menambah data hari ini, currentStreak dari useMemo mungkin belum terupdate.
    // Kita hitung manual estimasi streak baru jika hari ini membaca.
    const todayStr = new Date().toISOString().split('T')[0];
    let estimatedNewStreak = currentStreak;
    if ((dailyStats[todayStr] || 0) === 0) {
      estimatedNewStreak = currentStreak + 1; // Ditambah 1 karena hari ini baru baca
    }
    
    let newLongestStreak = longestStreak;
    if (estimatedNewStreak > longestStreak) {
      newLongestStreak = estimatedNewStreak;
      setLongestStreak(newLongestStreak);
    }
    
    await setDoc(doc(db, "users", user.uid), {
      progress: updatedProgress,
      journeyMode: journeyMode,
      activeJuz: newActiveJuz
      longestStreak: newLongestStreak
    }, { merge: true });
  };

  const deleteHistory = async (indexToDelete, surahId) => {
    if (!user) return;
    const currentHistory = progress[surahId]?.history || [];
    const updatedHistory = currentHistory.filter((_, idx) => idx !== indexToDelete);
    let recalculatedReadCount = 0;
    updatedHistory.forEach(hist => {
      if (hist.note === "Selesai 100%") recalculatedReadCount = SURAHS.find(s => s.id === surahId).ayahs;
      else {
        const match = hist.note.match(/Ayat \d+ - (\d+)/);
        if (match && parseInt(match[1]) > recalculatedReadCount) recalculatedReadCount = parseInt(match[1]);
      }
    });
    const updatedProgress = { ...progress, [surahId]: { read: recalculatedReadCount, history: updatedHistory } };
    await setDoc(doc(db, "users", user.uid), { progress: updatedProgress }, { merge: true });
  };

  const saveTarget = async () => {
    if (!user) return;
    const newTarget = { type: tempTargetType, value: tempTargetValue };
    await setDoc(doc(db, "users", user.uid), { target: newTarget }, { merge: true });
    setShowTargetModal(false);
  };

  const resetKhatam = async () => {
    if (!user) return;
    if (window.confirm("Alhamdulillah! Yakin ingin mengulang khataman baru? Progress akan di-reset jadi 0%.")) {
      const todayDate = new Date().toISOString().split('T')[0];
      const newKhatamRecord = { khatamKe: stats.khatamCount, startDate: stats.startDate, endDate: todayDate };
      const existingHistory = stats.khatamHistory || [];
      const newStats = { khatamCount: stats.khatamCount + 1, startDate: todayDate, khatamHistory: [newKhatamRecord, ...existingHistory] };
      await setDoc(doc(db, "users", user.uid), { progress: {}, stats: newStats, activeJuz: 1 }, { merge: true });
    }
  };

  const totalAyahs = 6236;
  const readAyahs = Object.keys(progress).reduce((acc, key) => acc + (progress[key].read || 0), 0);
  const globalPercentage = ((readAyahs / totalAyahs) * 100).toFixed(1);

  let latestSurahObj = SURAHS[0];
  let latestNote = "Belum ada riwayat";
  let maxTimestamp = 0;
  Object.entries(progress).forEach(([strId, data]) => {
    if (data.history && data.history.length > 0 && data.history[0].timestamp > maxTimestamp) {
      maxTimestamp = data.history[0].timestamp;
      latestSurahObj = SURAHS.find(s => s.id === parseInt(strId));
      latestNote = data.history[0].note;
    }
  });

  const todayDateObj = new Date();
  const startDateObj = new Date(stats.startDate);
  let daysElapsed = Math.ceil(Math.abs(todayDateObj - startDateObj) / (1000 * 60 * 60 * 24)) || 1;
  const avgAyahsPerDay = Math.round(readAyahs / daysElapsed);

  let smartTargetText = "";
  if (target.type === "daily") smartTargetText = `${target.value} Ayat/hari`;
  else if (target.type === "date") {
    const targetDateObj = new Date(target.value);
    const timeLeft = Math.ceil((targetDateObj - todayDateObj) / (1000 * 60 * 60 * 24));
    smartTargetText = timeLeft > 0 ? `${Math.ceil((totalAyahs - readAyahs) / timeLeft)} Ayat/hari (Deadline: ${target.value})` : "Tenggat waktu terlewati";
  }

  const allGlobalHistory = useMemo(() => {
    let all = [];
    Object.entries(progress).forEach(([strId, data]) => {
      const surah = SURAHS.find(s => s.id === parseInt(strId));
      if (data.history && surah) data.history.forEach(hist => all.push({ ...hist, surahName: surah.name, surahId: surah.id, totalAyahs: surah.ayahs }));
    });
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }, [progress]);

  const filteredGlobalHistory = useMemo(() => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - parseInt(historyFilter));
    return allGlobalHistory.filter(h => new Date(h.date) >= limitDate);
  }, [allGlobalHistory, historyFilter]);

  const dailyStats = useMemo(() => {
    const map = {};
    allGlobalHistory.forEach(hist => {
      if (!map[hist.date]) map[hist.date] = 0;
      map[hist.date] += (hist.ayahsAdded || 0);
    });
    return map;
  }, [allGlobalHistory]);

  // DAFTAR LENGKAP TANGGAL PAUSE HAID (Termasuk rentang aktif saat tombol sedang menyala)
  const effectivePausedSet = useMemo(() => {
    const set = new Set(pausedDates);
    const todayStr = new Date().toISOString().split('T')[0];
    if (isHaidPaused) {
      set.add(todayStr);
      if (lastPauseStart) {
        getDatesBetween(lastPauseStart, todayStr).forEach(d => set.add(d));
      }
    }
    return set;
  }, [pausedDates, isHaidPaused, lastPauseStart]);

  // KALKULASI STREAK HARIAN (MENGUNCI STREAK SAAT PAUSE HAID AKTIF)
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const hasRead = (dailyStats[dateStr] || 0) > 0;
      const isPausedDay = effectivePausedSet.has(dateStr);

      if (hasRead) {
        streak++;
      } else if (isPausedDay) {
        // Streak aman dikunci (tidak hangus ke 0, tapi tidak bertambah)
        continue;
      } else {
        // Jika hari ini (i === 0) belum sempat baca, jangan hanguskan streak kemarin dulu
        if (i === 0) continue;
        // Jika hari kemarin/sebelumnya kosong dan tidak di-pause, rantai streak berhenti di sini
        break;
      }
    }
    return streak;
  }, [dailyStats, effectivePausedSet]);

  const last7Days = getLastNDays(7);
  const last28Days = getLastNDays(28);
  const maxAyahs7D = Math.max(...last7Days.map(d => dailyStats[d.fullDate] || 0), 10);
  const filteredSurahs = SURAHS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.meaning.toLowerCase().includes(searchQuery.toLowerCase()));

  let displayActiveJuz = activeJuz;
  if (journeyMode === 'LINEAR') {
    const firstUnfinished = juzProgress.find(j => !j.isCompleted);
    displayActiveJuz = firstUnfinished ? firstUnfinished.juz : 30;
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-glass-box">
          <h1 style={{ color: '#1e5441', margin: '0 0 10px 0', fontSize: '2rem' }}>Tilawah Tracker</h1>
          <div style={{ width: '50px', height: '3px', background: '#2b7a5f', margin: '15px auto' }}></div>
          <p className="login-hadith">
            "Bacalah Al-Qur`an, sebab Al-Qur`an akan datang di hari kiamat kelak sebagai pemberi syafaat kepada para pembacanya." <br />
            <span style={{ fontSize: '0.8rem', color: '#555' }}>— HR Muslim No. 804</span>
          </p>
          <p className="login-motivation">
            Catat progress tilawah Qur'anmu setiap hari, ayat demi ayat, surat demi surat, dan bangun kebiasaan indah yang mendekatkan hatimu pada-Nya.
          </p>
          <button onClick={handleLogin} className="btn-google">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER DASHBOARD */}
      <div className="curved-header">
        <button
          onClick={() => signOut(auth)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', backdropFilter: 'blur(5px)' }}
          title="Keluar"
        >
          Keluar
        </button>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>Tilawah Tracker</h1>
        <h3 style={{ margin: '0', fontWeight: 'normal' }}>Assalamu'alaikum, {user.displayName.split(" ")[0]}!</h3>
        <div className="glass-stat-card">
          <div className="stat-row"><span>🗓️ Mulai Khataman:</span><b>{stats.startDate}</b></div>
          <div className="stat-row"><span>🏆 Status:</span><b>Khatam ke-{stats.khatamCount}</b></div>
          <div className="stat-row"><span>📈 Rata-rata:</span><b>{avgAyahsPerDay} Ayat / hari</b></div>
          <div className="stat-row"><span>🎯 Target Harian:</span><b>{smartTargetText}</b></div>
          <div className="stat-row"><span>📌 Posisi Saat Ini:</span><b>{latestSurahObj ? latestSurahObj.juz : "Juz 1"}</b></div>
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <h1 style={{ fontSize: '3rem', margin: '5px 0', color: 'white' }}>{globalPercentage}%</h1>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>{readAyahs} / 6.236 Ayat</p>
            <div className="header-progress-bg">
              <div className="header-progress-fill" style={{ width: `${globalPercentage}%`, background: getProgressBarColor(globalPercentage) }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => { setTempTargetType(target.type); setTempTargetValue(target.value); setShowTargetModal(true); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>⚙️ Set Target</button>
            {globalPercentage === "100.0" && <button onClick={resetKhatam} style={{ background: '#fcd34d', border: 'none', color: '#2b7a5f', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Mulai Khataman Baru</button>}
          </div>
        </div>
      </div>

      {/* MODAL POP-UP BOOK MILESTONE */}
      {showMilestone && milestoneZone && (
        <div className="milestone-overlay" onClick={() => setShowMilestone(false)}>
          <div className="milestone-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-book-effect">
              <div className="sticker-badge">
                <span className="badge-icon">{milestoneZone.icon}</span>
              </div>
              <h2 style={{ color: '#2b7a5f', marginTop: '20px' }}>Alhamdulillah!</h2>
              <p>Kamu berhasil menamatkan wilayah<br /><b>{milestoneZone.title}</b></p>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>(Juz {milestoneZone.startJuz} s/d {milestoneZone.endJuz})</p>
              <button className="btn-primary" onClick={() => setShowMilestone(false)}>Lanjutkan Perjalanan</button>
            </div>
          </div>
        </div>
      )}

      {showTargetModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowTargetModal(false)}>
          <div className="target-modal">
            <h3 style={{ marginTop: 0, color: '#2b7a5f' }}>Pilih Mode Target</h3>
            <label style={{ display: 'block', margin: '15px 0 5px 0' }}>Tipe Target:</label>
            <select className="input-field" value={tempTargetType} onChange={(e) => setTempTargetType(e.target.value)}>
              <option value="daily">1. Target Harian (Micro-habit)</option>
              <option value="date">2. Target Waktu Khatam (Kalkulator)</option>
            </select>
            {tempTargetType === "daily" ? (
              <>
                <label style={{ display: 'block', margin: '15px 0 5px 0' }}>Jumlah Ayat per Hari:</label>
                <input type="number" className="input-field" value={tempTargetValue} onChange={(e) => setTempTargetValue(e.target.value)} />
              </>
            ) : (
              <>
                <label style={{ display: 'block', margin: '15px 0 5px 0' }}>Tanggal Ingin Khatam:</label>
                <input type="date" className="input-field" value={tempTargetValue} onChange={(e) => setTempTargetValue(e.target.value)} />
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowTargetModal(false)} className="btn-primary" style={{ flex: 1, background: '#ff9ebd', color: 'white' }}>Batal</button>
              <button onClick={saveTarget} className="btn-primary" style={{ flex: 1 }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

     {showHaidModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowHaidModal(false)}>
          <div className="target-modal">
            <h3 style={{ marginTop: 0, color: '#e76f51' }}>🌸 Input Manual Haid</h3>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Lupa klik tombol pause kemarin? Masukkan rentang tanggalnya di sini agar streak kamu tidak hangus.</p>
            
            <label style={{ display: 'block', margin: '15px 0 5px 0' }}>Dari Tanggal:</label>
            <input type="date" className="input-field" value={haidStartInput} onChange={(e) => setHaidStartInput(e.target.value)} />
            
            <label style={{ display: 'block', margin: '15px 0 5px 0' }}>Sampai Tanggal:</label>
            <input type="date" className="input-field" value={haidEndInput} onChange={(e) => setHaidEndInput(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowHaidModal(false)} className="btn-primary" style={{ flex: 1, background: '#e2e8f0', color: '#555' }}>Batal</button>
              <button onClick={saveManualHaid} className="btn-primary" style={{ flex: 1, background: '#e76f51' }}>Simpan Tanggal</button>
            </div>
          </div>
        </div>
      )}
      
      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <>
          <div className="floating-bookmark">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔖</span>
              <div>
                <h4 style={{ margin: 0, color: '#2b7a5f' }}>Lanjut {latestSurahObj ? latestSurahObj.name : "Baca"}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{latestNote}</p>
              </div>
            </div>
            <button onClick={() => openSurah(latestSurahObj)} className="btn-primary" style={{ width: 'auto' }}>Buka</button>
          </div>
          <div className="search-container">
            <input type="text" className="search-input" placeholder="🔍 Cari nama surat atau artinya..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', padding: '0 1.5rem 1rem 1.5rem' }}>
            {filteredSurahs.map((surah) => {
              const surahProgress = progress[surah.id]?.read || 0;
              const percent = Math.round((surahProgress / surah.ayahs) * 100);
              return (
                <div key={surah.id} className="paper-cut-card" onClick={() => openSurah(surah)} style={{ position: 'relative' }}>
                  {percent === 100 && <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#2b7a5f', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>✨ Khatam</div>}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.8)', color: '#888', padding: '2px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 'bold' }}>{surah.juz}</div>
                  <img src={`/images/${String(surah.id).padStart(2, '0')}.webp`} alt={surah.name} className="surah-image" />
                  <h4 style={{ margin: '5px 0 0 0' }}>{surah.id}. {surah.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', margin: '0 0 8px 0' }}>"{surah.meaning}"</p>
                  <div className="progress-bar-bg" style={{ height: '6px', margin: '5px 0' }}>
                    <div className="progress-bar-fill" style={{ width: `${percent}%`, background: getProgressBarColor(percent) }}></div>
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: '#888' }}>{percent}% ({surahProgress}/{surah.ayahs})</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* JOURNEY MAP TAB */}
      {activeTab === "peta" && (
        <JourneyMap
          juzProgress={juzProgress}
          journeyMode={journeyMode}
          displayActiveJuz={displayActiveJuz}
          toggleJourneyMode={toggleJourneyMode}
        />
      )}

      {/* STATISTIK TAB (DENGAN STREAK HARIAN & PAUSE HAID DI PALING ATAS) */}
      {activeTab === "statistik" && (
        <div className="stats-container">
          
          {/* 1. KARTU STREAK HARIAN & PAUSE HAID */}
          <div className={`streak-card-wrapper ${isHaidPaused ? 'is-paused' : ''}`}>
            <div className="streak-header">
              
              {/* KIRI: INFO STREAK */}
              <div className="streak-info-left">
                <span className="streak-number">{currentStreak} Hari</span>
                <span className="streak-label">
                  {isHaidPaused ? 'Streak Dikunci (Haid)' : 'Streak Tilawah Aktif'}
                </span>
                <span className="longest-streak-label">
                  Rekor Terlama: <b>{longestStreak} Hari</b>
                </span>
              </div>

              {/* KANAN: ANIMASI API & TOMBOL */}
              <div className="streak-action-right">
                <div className={`campfire-container ${isHaidPaused ? 'paused' : 'burning'}`}>
                  <img
                    src={isHaidPaused ? "/images/fire-pause.webp" : "/images/fire-active.webp"}
                    alt="Streak Status"
                    className={`streak-logo-img ${isHaidPaused ? 'mode-sleep' : 'mode-pulse'}`}
                  />
                </div>
                
                {/* GRUP TOMBOL DI BAWAH API */}
                <div className="streak-buttons-group">
                   <button
                    onClick={() => setShowHaidModal(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0, opacity: 0.7 }}
                    title="Set Manual Tanggal Haid"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={toggleHaidPause}
                    className={`btn-pause-haid ${isHaidPaused ? 'active-paused' : ''}`}
                  >
                    {isHaidPaused ? '⏸️ Mode Istirahat' : '🌸 Siklus Haid'}
                  </button>
                </div>

                {/* TOMBOL RESET TRIAL */}
                {(isHaidPaused || (Array.isArray(pausedDates) && pausedDates.length > 0)) && (
                   <button
                     onClick={resetHaidTrial}
                     className="btn-reset-trial"
                     title="Bersihkan data uji coba haid"
                   >
                     🔄 Reset Trial
                   </button>
                )}
              </div>

            </div>

            <p className="streak-hint-text">
              {isHaidPaused
                ? "Streak kamu dikunci dengan aman selama masa haid. Selamat beristirahat!"
                : "Baca minimal 1 ayat setiap hari untuk menjaga api unggun tetap menyala!"}
            </p>
          </div>

          {/* 2. GRAFIK 7 HARI TERAKHIR */}
          <div className="chart-card">
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Pencapaian 7 Hari Terakhir</h4>
            <div className="chart-container" style={{ height: '140px' }}>
              {last7Days.map((dObj, index) => {
                const ayahs = dailyStats[dObj.fullDate] || 0;
                const barHeight = Math.max((ayahs / maxAyahs7D) * 100, 5);
                return (
                  <div key={index} className="bar-wrapper">
                    <span style={{ fontSize: '0.7rem', color: '#2b7a5f', fontWeight: 'bold' }}>{ayahs > 0 ? ayahs : ''}</span>
                    <div className="bar-bg"><div className="bar-fill" style={{ height: `${ayahs > 0 ? barHeight : 0}%` }}></div></div>
                    <div className="date-label"><b>{dObj.dayName}</b><br />{dObj.dateNum}/{dObj.monthNum}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* SPOILER ROW KOLEKSI LENCANA */}
          <div 
            className="spoiler-badges-card"
            onClick={() => setShowBadgesOverlay(true)}
            style={{ 
              background: '#fff', 
              borderRadius: '20px', 
              padding: '18px 20px', 
              margin: '15px', 
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Koleksi Lencana</h4>
              <span style={{ fontSize: '0.8rem', color: '#2b7a5f', fontWeight: 'bold' }}>Lihat Semua &gt;</span>
            </div>
            
            {/* Deretan lencana contoh (sementara) */}
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
               <div style={{ width: '45px', height: '45px', background: '#f1f0ea', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', opacity: 0.5 }}>🏆</div>
               <div style={{ width: '45px', height: '45px', background: '#f1f0ea', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', opacity: 0.5 }}>🏆</div>
               <div style={{ width: '45px', height: '45px', background: '#f1f0ea', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', opacity: 0.5 }}>🏆</div>
               <div style={{ width: '45px', height: '45px', background: '#f1f0ea', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', opacity: 0.5 }}>🏆</div>
            </div>
          </div>
          
          {/* 3. KALENDER KONSISTENSI 28 HARI (DENGAN WARNA KHUSUS HAID) */}
          <div className="chart-card">
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Kalender Konsistensi (28 Hari)</h4>
            <div className="heatmap-grid">
              {last28Days.map((dObj, index) => {
                const ayahs = dailyStats[dObj.fullDate] || 0;
                const isPausedDate = effectivePausedSet.has(dObj.fullDate);

                let bgColor = "#ebedf0";
                let textColor = "#888";
                let borderStyle = "none";
                let tooltipText = `${dObj.fullDate}: ${ayahs} Ayat`;

                if (ayahs > 0 && ayahs <= 15) { bgColor = "#c2dfd1"; textColor = "#2b7a5f"; }
                else if (ayahs > 15 && ayahs <= 40) { bgColor = "#7ebc9f"; textColor = "white"; }
                else if (ayahs > 40 && ayahs <= 80) { bgColor = "#2b7a5f"; textColor = "white"; }
                else if (ayahs > 80) { bgColor = "#1e5441"; textColor = "white"; }
                else if (isPausedDate) {
                  // Warna pink pastel khusus hari istirahat haid
                  bgColor = "#ffd6e7"; 
                  textColor = "#c9184a"; 
                  borderStyle = "1.5px solid #ff8fa3";
                  tooltipText = `${dObj.fullDate}: Mode Istirahat (Haid) 🌸`;
                }

                return (
                  <div
                    key={index}
                    className="heatmap-box"
                    style={{ background: bgColor, color: textColor, border: borderStyle, boxSizing: 'border-box' }}
                    title={tooltipText}
                  >
                    {dObj.dateNum}
                  </div>
                );
              })}
            </div>
            <div className="heatmap-legend" style={{ flexWrap: 'wrap' }}>
              <span style={{ marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <div className="legend-box" style={{ background: '#ffd6e7', border: '1px solid #ff8fa3' }}></div>
                Istirahat (Haid)
              </span>
              <span>Sedikit</span>
              <div className="legend-box" style={{ background: '#ebedf0' }}></div>
              <div className="legend-box" style={{ background: '#c2dfd1' }}></div>
              <div className="legend-box" style={{ background: '#7ebc9f' }}></div>
              <div className="legend-box" style={{ background: '#2b7a5f' }}></div>
              <div className="legend-box" style={{ background: '#1e5441' }}></div>
              <span>Banyak</span>
            </div>
          </div>
        </div>
      )}

      {/* RIWAYAT (LOG) TAB */}
      {activeTab === "log" && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ color: '#2b7a5f', margin: '0 0 15px 0' }}>Riwayat Tilawah</h2>
          {stats.khatamHistory && stats.khatamHistory.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#fb923c', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>✨ <span>Catatan Khatam</span></h4>
              <div className="receipt-container" style={{ padding: '10px 15px' }}>
                {stats.khatamHistory.map((kh, idx) => (
                  <div key={idx} className="receipt-item" style={{ borderBottom: '1px dashed #d1cbbd', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#2b7a5f', fontSize: '0.9rem' }}>🏆 Khatam ke-{kh.khatamKe}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{kh.startDate} s/d {kh.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="filter-toggle">
            <button className={`filter-btn ${historyFilter === "7" ? "active" : ""}`} onClick={() => setHistoryFilter("7")}>7 Hari Terakhir</button>
            <button className={`filter-btn ${historyFilter === "30" ? "active" : ""}`} onClick={() => setHistoryFilter("30")}>30 Hari Terakhir</button>
          </div>
          <div className="receipt-container" style={{ maxHeight: 'none', paddingBottom: '20px', marginBottom: '80px' }}>
            {filteredGlobalHistory.length > 0 ? (
              filteredGlobalHistory.map((hist, i) => (
                <div key={i} className="receipt-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                    <span className="receipt-date">{hist.date}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2b7a5f', background: '#e6f2ed', padding: '2px 8px', borderRadius: '5px' }}>+{hist.ayahsAdded || 0} Ayat</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{hist.surahName} <span style={{ color: '#aaa', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '5px' }}>({hist.totalAyahs} ayat)</span></span>
                    <span className="receipt-note">{hist.note}</span>
                  </div>
                </div>
              ))
            ) : (<div style={{ textAlign: 'center', color: '#888', marginTop: '10px', padding: '20px' }}><p>Belum ada riwayat tilawah di periode ini.</p></div>)}
          </div>
        </div>
      )}

      {/* NAVBAR BAWAH */}
      <div className="bottom-nav">
        <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span style={{ fontSize: '1.4rem' }}>🏠</span> Dashboard</button>
        <button className={`nav-btn ${activeTab === 'statistik' ? 'active' : ''}`} onClick={() => setActiveTab('statistik')}><span style={{ fontSize: '1.4rem' }}>📊</span> Statistik</button>
        <button className={`nav-btn ${activeTab === 'peta' ? 'active' : ''}`} onClick={() => setActiveTab('peta')}><span style={{ fontSize: '1.4rem' }}>🗺️</span> Journey</button>
        <button className={`nav-btn ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}><span style={{ fontSize: '1.4rem' }}>📜</span> Riwayat</button>
      </div>

      {/* MODAL SURAH */}
      {selectedSurah && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setSelectedSurah(null)}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedSurah(null)}>&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <img src={`/images/${String(selectedSurah.id).padStart(2, '0')}.webp`} alt={selectedSurah.name} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'contain', marginBottom: '10px' }} />
              <h2 style={{ margin: '0', color: '#2b7a5f' }}>{selectedSurah.name}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontStyle: 'italic' }}>"{selectedSurah.meaning}"</p>
              <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#555', padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold' }}>{selectedSurah.juz}</div>
              <h3 style={{ margin: '15px 0 5px 0', color: '#2b7a5f', fontSize: '1.5rem' }}>
                {Math.round(((progress[selectedSurah.id]?.read || 0) / selectedSurah.ayahs) * 100)}%
                <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal', marginLeft: '8px' }}>({progress[selectedSurah.id]?.read || 0} / {selectedSurah.ayahs} Ayat)</span>
              </h3>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${(progress[selectedSurah.id]?.read || 0) / selectedSurah.ayahs * 100}%`, background: getProgressBarColor((progress[selectedSurah.id]?.read || 0) / selectedSurah.ayahs * 100) }}></div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <label>Tanggal:</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label>Dari Ayat:</label><input type="number" className="input-field" value={startAyah} onChange={(e) => setStartAyah(e.target.value)} /></div>
                <div style={{ flex: 1 }}><label>Sampai Ayat:</label><input type="number" className="input-field" value={endAyah} onChange={(e) => setEndAyah(e.target.value)} /></div>
              </div>
              <button onClick={() => saveTracking(false)} className="btn-primary">Simpan Progress</button>
              <button onClick={() => saveTracking(true)} className="btn-gold" style={{ background: '#2b7a5f' }}>Tandai Selesai 100%</button>
            </div>
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <h4 style={{ marginBottom: '5px' }}>Riwayat Surat Ini</h4>
              <div className="receipt-container">
                {(progress[selectedSurah.id]?.history || []).map((hist, i) => (
                  <div key={i} className="receipt-item">
                    <div><span className="receipt-date">{hist.date}</span><span className="receipt-note">{hist.note}</span></div>
                    <button onClick={() => deleteHistory(i, selectedSurah.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' }} title="Hapus">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* OVERLAY PODIUM LENCANA (FULL SCREEN) */}
      {showBadgesOverlay && (
        <div className="badges-fullscreen-overlay">
          
          {/* HEADER NAVIGASI */}
          <div className="badges-header">
            <button onClick={() => setShowBadgesOverlay(false)} className="back-btn">
              &larr; Kembali
            </button>
            <h2>Pencapaianku</h2>
          </div>

          {/* AREA PODIUM SPOTLIGHT */}
          <div className="podium-section">
            {/* Nanti lencana raksasa yang dipilih akan muncul di sini */}
            <div className="spotlight-badge placeholder">
              <span style={{ fontSize: '4rem', opacity: 0.3 }}>🏆</span>
            </div>
            <div className="podium-stand"></div>
            <h3 className="badge-title">Koleksi Lencana</h3>
            <p className="badge-date">Terus tilawah untuk membuka lencana pertamamu!</p>
          </div>

          {/* GALERI KATEGORI */}
          <div className="badges-gallery-scroll">
            
            <div className="badge-category">
              <h4>Jejak Ayat</h4>
              <div className="badge-grid">
                {/* Kotak-kotak lencana */}
                <div className="badge-item locked"></div>
                <div className="badge-item locked"></div>
                <div className="badge-item locked"></div>
              </div>
            </div>

            <div className="badge-category">
              <h4>Misi Surat</h4>
              <div className="badge-grid">
                <div className="badge-item locked"></div>
                <div className="badge-item locked"></div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
