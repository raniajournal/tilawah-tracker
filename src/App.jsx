import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

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
];

const getProgressBarColor = (percent) => {
  if (percent < 50) return "#fcd34d";
  if (percent < 100) return "#fb923c";
  return "#2b7a5f";
};

const getLastNDays = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [date, setDate] = useState("");
  const [startAyah, setStartAyah] = useState("");
  const [endAyah, setEndAyah] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProgress(docSnap.data().progress || {});
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

  const saveTracking = async (isComplete = false) => {
    if (!user) return;
    
    let readCount = progress[selectedSurah.id]?.read || 0;
    let newHistory = progress[selectedSurah.id]?.history || [];
    const currentTime = Date.now();
    let ayahsAdded = 0; 
    
    // Fitur PINTAR: Menambahkan ID unik (berbasis timestamp) untuk tiap riwayat
    // Ini krusial agar kita bisa menghapus item yang spesifik nantinya
    const historyId = currentTime.toString(); 

    if (isComplete) {
      ayahsAdded = selectedSurah.ayahs - readCount;
      readCount = selectedSurah.ayahs;
      newHistory.unshift({ id: historyId, date, note: "Selesai 100%", timestamp: currentTime, ayahsAdded });
    } else {
      const end = parseInt(endAyah);
      const start = parseInt(startAyah);
      if (end > readCount) {
        ayahsAdded = (end - start) + 1;
        readCount = end;
      }
      newHistory.unshift({ id: historyId, date, note: `Ayat ${startAyah} - ${endAyah}`, timestamp: currentTime, ayahsAdded });
    }

    const updatedProgress = {
      ...progress,
      [selectedSurah.id]: { read: readCount, history: newHistory }
    };

    await setDoc(doc(db, "users", user.uid), { progress: updatedProgress }, { merge: true });
  };

  // Fungsi BARU: Hapus Riwayat
  const deleteHistory = async (historyIdToDelete, surahId) => {
    if (!user) return;

    // Filter riwayat yang tidak sama dengan ID yang mau dihapus
    const currentHistory = progress[surahId]?.history || [];
    const updatedHistory = currentHistory.filter(hist => hist.id !== historyIdToDelete);

    // Hitung ulang 'readCount' maksimum yang tersisa dari sisa riwayat
    let recalculatedReadCount = 0;
    updatedHistory.forEach(hist => {
        if (hist.note === "Selesai 100%") {
            recalculatedReadCount = SURAHS.find(s => s.id === surahId).ayahs;
        } else {
            const match = hist.note.match(/Ayat \d+ - (\d+)/);
            if (match) {
                const endAyahInHistory = parseInt(match[1]);
                if (endAyahInHistory > recalculatedReadCount) {
                    recalculatedReadCount = endAyahInHistory;
                }
            }
        }
    });

    const updatedProgress = {
      ...progress,
      [surahId]: { read: recalculatedReadCount, history: updatedHistory }
    };

    await setDoc(doc(db, "users", user.uid), { progress: updatedProgress }, { merge: true });
  };


  let latestSurahObj = SURAHS[0];
  let latestNote = "Belum ada riwayat";
  let maxTimestamp = 0;

  Object.entries(progress).forEach(([strId, data]) => {
    if (data.history && data.history.length > 0) {
      const firstHist = data.history[0];
      if (firstHist.timestamp && firstHist.timestamp > maxTimestamp) {
        maxTimestamp = firstHist.timestamp;
        latestSurahObj = SURAHS.find(s => s.id === parseInt(strId));
        latestNote = firstHist.note;
      }
    }
  });

  const totalAyahs = 6236;
  const readAyahs = Object.keys(progress).reduce((acc, key) => acc + (progress[key].read || 0), 0);
  const globalPercentage = ((readAyahs / totalAyahs) * 100).toFixed(1);
  const globalBarColor = getProgressBarColor(globalPercentage);

  const dailyStats = {};
  Object.entries(progress).forEach(([strId, data]) => {
    const surahName = SURAHS.find(s => s.id === parseInt(strId))?.name;
    if (data.history) {
      data.history.forEach(hist => {
        if (!dailyStats[hist.date]) dailyStats[hist.date] = { ayahs: 0, surahs: new Set() };
        
        let ayahsRead = hist.ayahsAdded;
        if (ayahsRead === undefined) {
           const match = hist.note.match(/Ayat (\d+) - (\d+)/);
           ayahsRead = match ? (parseInt(match[2]) - parseInt(match[1]) + 1) : 0;
        }

        dailyStats[hist.date].ayahs += ayahsRead;
        dailyStats[hist.date].surahs.add(surahName);
      });
    }
  });

  const last7Days = getLastNDays(7);
  const last28Days = getLastNDays(28);
  const maxAyahs7D = Math.max(...last7Days.map(d => dailyStats[d]?.ayahs || 0), 10);

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f3ec' }}>
        <h1 style={{ color: '#2b7a5f' }}>Tilawah Tracker</h1>
        <p>Catat progress ngaji kamu dengan visual estetik</p>
        <button onClick={handleLogin} className="btn-primary" style={{ width: '200px' }}>Login dengan Google</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ------------------ DASHBOARD ------------------ */}
      {activeTab === "dashboard" && (
        <>
          <div className="curved-header">
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>Tilawah Tracker</h1>
            <p style={{ margin: '0 auto 20px auto', maxWidth: '90%', fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
              Catat progress tilawahmu ayat per ayat. Semoga Allah memudahkan langkahmu mengkhatamkan Al-Quran.
            </p>
            <h3 style={{ margin: '0', fontWeight: 'normal' }}>Assalamu'alaikum, {user.displayName.split(" ")[0]}!</h3>
            <h1 style={{ fontSize: '3rem', margin: '5px 0' }}>{globalPercentage}%</h1>
            <div style={{ background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '5px 15px', borderRadius: '20px', marginBottom: '10px' }}>
              🎯 Posisi Saat Ini: <b>{latestSurahObj ? latestSurahObj.juz : "Juz 1"}</b>
            </div>
            <p style={{ margin: '0' }}>Khatam Progress • {readAyahs} / 6.236 Ayat</p>
            <div className="header-progress-bg">
              <div className="header-progress-fill" style={{ width: `${globalPercentage}%`, background: globalBarColor }}></div>
            </div>
            <button onClick={() => signOut(auth)} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 15px', borderRadius: '20px', marginTop: '15px' }}>Logout</button>
          </div>

          <div className="floating-bookmark">
            <div>
              <h4 style={{ margin: 0, color: '#2b7a5f' }}>Lanjut {latestSurahObj ? latestSurahObj.name : "Baca"}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{latestNote}</p>
            </div>
            <button onClick={() => openSurah(latestSurahObj)} className="btn-primary" style={{ width: 'auto' }}>Buka</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', padding: '0 1.5rem 1rem 1.5rem' }}>
            {SURAHS.map((surah) => {
              const surahProgress = progress[surah.id]?.read || 0;
              const percent = Math.round((surahProgress / surah.ayahs) * 100);
              const barColor = getProgressBarColor(percent);
              const isKhatam = percent === 100;
              
              return (
                <div key={surah.id} className="paper-cut-card" onClick={() => openSurah(surah)} style={{ position: 'relative' }}>
                  {isKhatam && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#2b7a5f', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>✨ Khatam</div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.8)', color: '#888', padding: '2px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                    {surah.juz}
                  </div>

                  {surah.id <= 20 ? (
                    <img src={`/images/${String(surah.id).padStart(2, '0')}.webp`} alt={surah.name} className="surah-image" />
                  ) : (
                    <div className="surah-image" style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#888' }}>Icon</div>
                  )}
                  <h4 style={{ margin: '5px 0 0 0' }}>{surah.id}. {surah.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', margin: '0 0 8px 0' }}>"{surah.meaning}"</p>
                  
                  <div className="progress-bar-bg" style={{ height: '6px', margin: '0 0 5px 0' }}>
                    <div className="progress-bar-fill" style={{ width: `${percent}%`, background: barColor }}></div>
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: '#888' }}>{percent}% ({surahProgress}/{surah.ayahs})</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ------------------ STATISTIK ------------------ */}
      {activeTab === "statistik" && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ color: '#2b7a5f', marginTop: '10px' }}>Statistik Tilawah</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Pantau konsistensi ibadahmu di sini.</p>
          <div className="chart-card">
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Pencapaian 7 Hari Terakhir</h4>
            <div className="chart-container">
              {last7Days.map((d, index) => {
                const ayahs = dailyStats[d]?.ayahs || 0;
                const barHeight = Math.max((ayahs / maxAyahs7D) * 100, 5);
                return (
                  <div key={index} className="bar-wrapper">
                    <span style={{ fontSize: '0.7rem', color: '#2b7a5f', fontWeight: 'bold' }}>{ayahs > 0 ? ayahs : ''}</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ height: `${ayahs > 0 ? barHeight : 0}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#888', marginTop: '5px' }}>{d.split('-')[2]}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '15px', padding: '10px', background: '#f7f3ec', borderRadius: '10px', fontSize: '0.85rem' }}>
              <b>Dibaca Hari Ini: </b> 
              {dailyStats[new Date().toISOString().split('T')[0]]?.surahs.size > 0 
                ? Array.from(dailyStats[new Date().toISOString().split('T')[0]].surahs).join(", ") 
                : "Belum ada. Yuk, tilawah!"}
            </div>
          </div>

          <div className="chart-card">
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Jejak Konsistensi (28 Hari)</h4>
            <div className="heatmap-grid">
              {last28Days.map((d, index) => {
                const ayahs = dailyStats[d]?.ayahs || 0;
                let bgColor = "#f7f3ec";
                if (ayahs > 0 && ayahs <= 10) bgColor = "#c2dfd1";
                if (ayahs > 10 && ayahs <= 50) bgColor = "#2b7a5f";
                if (ayahs > 50) bgColor = "#1e5441";
                return (
                  <div key={index} className="heatmap-box" style={{ background: bgColor }} title={`${d}: ${ayahs} Ayat`}>
                    {ayahs > 0 && "✓"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ BOTTOM NAV ------------------ */}
      <div className="bottom-nav">
        <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span style={{ fontSize: '1.5rem' }}>🏠</span> Dashboard
        </button>
        <button className={`nav-btn ${activeTab === 'statistik' ? 'active' : ''}`} onClick={() => setActiveTab('statistik')}>
          <span style={{ fontSize: '1.5rem' }}>📊</span> Statistik
        </button>
      </div>

      {/* ------------------ MODAL POP-UP (DENGAN TONG SAMPAH) ------------------ */}
      {selectedSurah && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setSelectedSurah(null)}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedSurah(null)}>&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              {selectedSurah.id <= 20 ? (
                <img src={`/images/${String(selectedSurah.id).padStart(2, '0')}.webp`} alt={selectedSurah.name} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'contain', marginBottom: '10px' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#888', marginBottom: '10px', margin: '0 auto' }}>Icon</div>
              )}
              <h2 style={{ margin: '0', color: '#2b7a5f' }}>{selectedSurah.name}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontStyle: 'italic' }}>"{selectedSurah.meaning}"</p>
              <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#555', padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold' }}>
                {selectedSurah.juz}
              </div>
            </div>
            
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${(progress[selectedSurah.id]?.read || 0) / selectedSurah.ayahs * 100}%`, background: getProgressBarColor((progress[selectedSurah.id]?.read || 0) / selectedSurah.ayahs * 100) }}></div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>{progress[selectedSurah.id]?.read || 0} dari {selectedSurah.ayahs} Ayat terselesaikan</p>

            <div style={{ marginTop: '20px' }}>
              <label>Tanggal:</label>
              <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Dari Ayat:</label>
                  <input type="number" className="input-field" value={startAyah} onChange={(e) => setStartAyah(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Sampai Ayat:</label>
                  <input type="number" className="input-field" value={endAyah} onChange={(e) => setEndAyah(e.target.value)} />
                </div>
              </div>
              <button onClick={() => saveTracking(false)} className="btn-primary">Simpan Progress</button>
              <button onClick={() => saveTracking(true)} className="btn-gold" style={{ background: '#2b7a5f' }}>Tandai Selesai 100%</button>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <h4>Riwayat Surat Ini</h4>
              <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: '0' }}>
                {(progress[selectedSurah.id]?.history || []).map((hist, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem', color: '#555' }}>
                    <div>
                      <span style={{ color: '#888', marginRight: '10px' }}>{hist.date}</span>
                      <b>{hist.note}</b>
                    </div>
                    {/* Tombol Hapus (Tong Sampah) */}
                    {hist.id && (
                      <button 
                        onClick={() => deleteHistory(hist.id, selectedSurah.id)}
                        style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                        title="Hapus riwayat ini"
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}