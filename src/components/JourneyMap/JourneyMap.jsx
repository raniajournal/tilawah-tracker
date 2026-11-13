import React, { useEffect, useRef } from 'react';
import './JourneyMap.css';
import { JUZ_DATA, calculateJuzProgress } from '../../juzUtils';

const SEGMENTS = [
  { id: 1, title: '🌅 1. Golden Sunrise', startJuz: 1, endJuz: 6, className: 'bg-sunrise', ribbonClass: 'ribbon-sunrise', ribbonSide: 'left' },
  { id: 2, title: '🏜️ 2. Dawn Springs', startJuz: 7, endJuz: 12, className: 'bg-desert', ribbonClass: 'ribbon-desert', ribbonSide: 'left' },
  { id: 3, title: '🌴 3. Palm Valley', startJuz: 13, endJuz: 18, className: 'bg-valley', ribbonClass: 'ribbon-valley', ribbonSide: 'right' },
  { id: 4, title: '🏮 4. Lantern Trail', startJuz: 19, endJuz: 24, className: 'bg-lantern', ribbonClass: 'ribbon-lantern', ribbonSide: 'right' },
  { id: 5, title: '✨ 5. Starry Night', startJuz: 25, endJuz: 30, className: 'bg-stars', ribbonClass: 'ribbon-stars', ribbonSide: 'left' },
];

const SEGMENT_NET_HEIGHT = 600;
const TOTAL_MAP_HEIGHT = SEGMENTS.length * SEGMENT_NET_HEIGHT + 80;

const getWaveX = (juzNumber) => {
  return 50 + Math.sin(juzNumber * 0.8) * 26;
};

const getNodeY = (juzNumber) => {
  const idx = juzNumber - 1;
  const segIndex = Math.floor(idx / 6);
  const posInSeg = idx % 6;
  return segIndex * SEGMENT_NET_HEIGHT + 95 + posInSeg * 86;
};

const generateContinuousPath = () => {
  const startX = getWaveX(1);
  const startY = getNodeY(1);
  let d = `M ${startX} ${startY} `;

  for (let juz = 2; juz <= 30; juz++) {
    const prevX = getWaveX(juz - 1);
    const prevY = getNodeY(juz - 1);
    const x = getWaveX(juz);
    const y = getNodeY(juz);
    const midY = (prevY + y) / 2;

    d += `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y} `;
  }
  return d;
};

const DEFAULT_GOLD_POLYS = ["#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#fef08a"];

const JourneyMap = ({ juzProgress, journeyMode, displayActiveJuz, toggleJourneyMode, birdPolys = DEFAULT_GOLD_POLYS }) => {
  const activeNodeRef = useRef(null);
  const polys = birdPolys && birdPolys.length === 6 ? birdPolys : DEFAULT_GOLD_POLYS;

  useEffect(() => {
    if (activeNodeRef.current) {
      const timer = setTimeout(() => {
        activeNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [displayActiveJuz]);

  return (
    <div className="map-outer-wrapper">
      <div className="map-paper-box">
        
        {/* KOTAK PENGATURAN MODE PERJALANAN */}
        <div className="mode-toggle-header">
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
        </div>

        {/* KANVAS UTAMA PETA */}
        <div className="map-viewport" style={{ height: `${TOTAL_MAP_HEIGHT}px` }}>
          
          {/* LAYER 1: 5 SEKSI GAMBAR LATAR BELAKANG & RIBBON TAG */}
          <div className="backgrounds-stack">
            {SEGMENTS.map((seg) => (
              <div key={seg.id} className={`oasis-segment ${seg.className}`}>
                <div className={`ribbon-wrapper ${seg.ribbonSide === 'right' ? 'ribbon-right' : 'ribbon-left'}`}>
                  <div className={`ribbon-tag ${seg.ribbonClass}`}>
                    {seg.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LAYER 2: JALUR GARIS MENYAMBUNG & 30 TITIK JUZ */}
          <div className="nodes-scroller">
            
            <svg
              className="continuous-path-svg"
              viewBox={`0 0 100 ${TOTAL_MAP_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <path
                d={generateContinuousPath()}
                fill="none"
                stroke="rgba(255, 255, 255, 0.82)"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {juzProgress.map((juz) => {
              const totalAyah = JUZ_DATA[juz.juz - 1].totalAyahs;
              const progressData = calculateJuzProgress(juz.ayatRead, totalAyah);
              const isLocked = journeyMode === 'LINEAR' && juz.juz > displayActiveJuz;
              const isActive = juz.juz === displayActiveJuz;

              const completedQuarters = progressData.quarters.filter(Boolean).length;
              const progressDegrees = completedQuarters * 90;

              const xPos = getWaveX(juz.juz);
              const yPos = getNodeY(juz.juz);

              return (
                <div
                  key={juz.juz}
                  ref={isActive ? activeNodeRef : null}
                  className={`juz-node-point ${isActive ? 'active-node' : ''}`}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}px`,
                  }}
                >
                  <div
                    className={`organic-ring ${isLocked ? 'locked' : ''} ${juz.isCompleted ? 'completed' : ''}`}
                    style={{
                      background: isLocked
                        ? '#cbd5e1'
                        : `conic-gradient(#f59e0b ${progressDegrees}deg, rgba(255, 255, 255, 0.75) 0deg)`,
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
                  </div>

                  {isActive && (
                    <div className="origami-bird-marker" title="Posisi Tilawahmu Saat Ini">
                      <div className="bird-svg-wrapper">
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                          <polygon fill={polys[0]} points="394.6,183.3 226,306.9 285.4,117.7" />
                          <polygon fill={polys[1]} points="394.6,183.3 496.1,232.7 226,306.9" />
                          <polygon fill={polys[2]} points="226,306.9 148.9,252.3 35.5,233.1" />
                          <polygon fill={polys[3]} points="226,306.9 313.2,465 313.2,351" />
                          <polygon fill={polys[4]} points="226,306.9 176.6,393 216.5,335.7" />
                          <polygon fill={polys[5]} points="226,306.9 285.4,117.7 148.9,252.3" />
                        </svg>
                      </div>
                      <div className="shadow-cast" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
