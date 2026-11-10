import React from 'react';
import './JourneyMap.css';
import { JUZ_DATA, calculateJuzProgress } from '../../juzUtils';

const ZONES = [
  { id: 1, title: "THE DAWN SPRINGS", icon: "🌅", startJuz: 1, endJuz: 5, bgClass: "zone-dawn" },
  { id: 2, title: "THE PALM VALLEY", icon: "🌴", startJuz: 6, endJuz: 15, bgClass: "zone-palm" },
  { id: 3, title: "THE LANTERN TRAIL", icon: "🏮", startJuz: 16, endJuz: 25, bgClass: "zone-lantern" },
  { id: 4, title: "THE STARRY SKY FINALE", icon: "✨", startJuz: 26, endJuz: 30, bgClass: "zone-starry" }
];

// FUNGSI MEMBUAT JALUR MELIUK (BEZIER CURVE SVG) PRESISI DI TENGAH LINGKARAN
const generateDashedPath = (count) => {
  if (count <= 1) return "";
  let d = `M 25 50 `;
  for (let i = 1; i < count; i++) {
    const prevX = (i - 1) % 2 === 0 ? 25 : 75;
    const x = i % 2 === 0 ? 25 : 75;
    const prevY = (i - 1) * 100 + 50;
    const y = i * 100 + 50;
    d += `C ${prevX} ${prevY + 45}, ${x} ${y - 45}, ${x} ${y} `;
  }
  return d;
};

const JourneyMap = ({ juzProgress, journeyMode, displayActiveJuz, toggleJourneyMode }) => {
  return (
    <div className="map-outer-wrapper">
      <div className="map-paper-box">
        <div className="journey-zones-wrapper">
          {ZONES.map((zone) => {
            const zoneJuzData = juzProgress.filter(j => j.juz >= zone.startJuz && j.juz <= zone.endJuz);
            const nodeCount = zoneJuzData.length;

            return (
              <div key={zone.id} className={`zone-section ${zone.bgClass}`}>
                
                {/* Tampilkan kotak pengaturan tepat di atas hamparan pasir Zona 1 */}
                {zone.id === 1 && (
                  <div className="mode-toggle-box">
                    <h3 style={{ margin: '0 0 5px 0', color: '#1e5441' }}>Pengaturan Perjalanan</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Pilih gayamu menaklukkan 30 Juz</p>
                    <div className="mode-buttons">
                      <button
                        className={`btn-mode ${journeyMode === 'LINEAR' ? 'active' : ''}`}
                        onClick={() => toggleJourneyMode('LINEAR')}
                      >
                        ⛺ Ekspedisi Linear
                      </button>
                      <button
                        className={`btn-mode ${journeyMode === 'FREE' ? 'active' : ''}`}
                        onClick={() => toggleJourneyMode('FREE')}
                      >
                        🦅 Jelajah Bebas
                      </button>
                    </div>
                  </div>
                )}

                {/* JUDUL ZONA */}
                <div className="zone-header">
                  <div className="zone-icon">{zone.icon}</div>
                  <h2 className="zone-title">{zone.title}</h2>
                </div>

                <div className="journey-path-container">
                  {/* GARIS JAHITAN MELIUK */}
                  <svg className="dashed-path-svg" viewBox={`0 0 100 ${nodeCount * 100}`} preserveAspectRatio="none">
                    <path
                      d={generateDashedPath(nodeCount)}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.85)"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {zoneJuzData.map((juz, index) => {
                    const totalAyah = JUZ_DATA[juz.juz - 1].totalAyahs;
                    const progressData = calculateJuzProgress(juz.ayatRead, totalAyah);
                    const isLocked = journeyMode === 'LINEAR' && juz.juz > displayActiveJuz;

                    const positionClass = index % 2 === 0 ? 'pos-left' : 'pos-right';
                    const completedQuarters = progressData.quarters.filter(Boolean).length;
                    const progressDegrees = completedQuarters * 90;

                    return (
                      <div key={juz.juz} className={`juz-node-wrapper ${positionClass}`}>
                        <div
                          className={`organic-ring ${isLocked ? 'locked' : ''} ${juz.isCompleted ? 'completed' : ''}`}
                          style={{
                            background: isLocked
                              ? '#cbd5e1'
                              : `conic-gradient(#f59e0b ${progressDegrees}deg, rgba(255,255,255,0.7) 0deg)`
                          }}
                        >
                          <div className="organic-inner">
                            {isLocked ? (
                              <>
                                <span className="juz-number locked-text">{juz.juz}</span>
                                <div className="lock-overlay">🔒</div>
                              </>
                            ) : (
                              <span className="juz-number">{juz.juz}</span>
                            )}
                          </div>

                          {/* BURUNG BANGAU ORIGAMI 3D */}
                          {displayActiveJuz === juz.juz && !juz.isCompleted && (
                            <div className="origami-bird" title="Posisi Anda Saat Ini">
                              <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                <polygon fill="#fde047" points="394.6,183.3 226,306.9 285.4,117.7" />
                                <polygon fill="#facc15" points="394.6,183.3 496.1,232.7 226,306.9" />
                                <polygon fill="#eab308" points="226,306.9 148.9,252.3 35.5,233.1" />
                                <polygon fill="#ca8a04" points="226,306.9 313.2,465 313.2,351" />
                                <polygon fill="#a16207" points="226,306.9 176.6,393 216.5,335.7" />
                                <polygon fill="#fef08a" points="226,306.9 285.4,117.7 148.9,252.3" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
