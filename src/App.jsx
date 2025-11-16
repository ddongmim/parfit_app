import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion, useAnimation, useMotionValue } from "framer-motion";

const PINK = "#e85298";
const MINT = "#64c0ab";

export default function ParfitUiBeta() {
  const globalStyle = (
  <style>{`
    /* 🌟 모든 브라우저에서 스크롤바 완전 제거 */
    *::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
    }

    ::-webkit-scrollbar { display: none; }
    * { 
      -ms-overflow-style: none; 
      scrollbar-width: none; 
    }
  `}</style>
);


  
  const [activeTab, setActiveTab] = useState("home");
  const [remoteState, setRemoteState] = useState({ PACO: false, TV: false, 에어컨: false, 공기청정기: false });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playlist] = useState([
    { title: "내 이름 맑음", artist: "QWER", duration: 188, album: "/assets/album_1.png" },
    { title: "Stacey Ryan", artist: "Fall In Love Alone", duration: 200, album: "/assets/album_2.png" },
    { title: "HAPPY", artist: "DAY6 (데이식스)", duration: 210, album: "/assets/album_3.png" },
  ]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Guestbook (log) states
  const [guestbookInput, setGuestbookInput] = useState("");
  const [guestbookEntries, setGuestbookEntries] = useState([]);

  // load guestbook from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("guestbook_entries");
      if (saved) {
        setGuestbookEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load guestbook entries", e);
    }
  }, []);

  const refWidth = 1125;
  const refHeight = 2436;
  const screenHeight = 812;
  const screenWidth = Math.round((screenHeight * refWidth) / refHeight);

  const sheetHeight = (screenHeight * 7) / 8;
  const handleVisible = 90;
  const expandedY = 0;
  const collapsedY = sheetHeight - handleVisible;

  const controls = useAnimation();
  const sheetY = useMotionValue(expandedY);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    controls.set({ y: expandedY });
    sheetY.set(expandedY);
  }, []);

  const handleDragEnd = async (event, info) => {
    const threshold = 50;
    if (info.offset.y > threshold) {
      await controls.start({ y: collapsedY, transition: { type: "spring", stiffness: 250, damping: 30 } });
      sheetY.set(collapsedY);
      setIsCollapsed(true);
    } else {
      await controls.start({ y: expandedY, transition: { type: "spring", stiffness: 250, damping: 30 } });
      sheetY.set(expandedY);
      setIsCollapsed(false);
    }
  };

  const toggleDevice = (device) => {
    setRemoteState((prev) => ({ ...prev, [device]: !prev[device] }));
  };

  const handleToggleFromProtrusion = async () => {
    if (isCollapsed) {
      await controls.start({ y: expandedY, transition: { type: "spring", stiffness: 260, damping: 30 } });
      sheetY.set(expandedY);
      setIsCollapsed(false);
    } else {
      await controls.start({ y: collapsedY, transition: { type: "spring", stiffness: 260, damping: 30 } });
      sheetY.set(collapsedY);
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < playlist[currentTrack].duration) {
            return prev + 1;
          } else {
            handleNext();
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleProgressChange = (e) => setProgress(Number(e.target.value));
  const handleNext = () => setCurrentTrack((prev) => (prev + 1) % playlist.length);
  // reset progress whenever track changes
  useEffect(() => {
    setProgress(0);
  }, [currentTrack]);

  const handlePrev = () => setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);

  // guestbook submit
  const handleGuestbookSubmit = () => {
    if (!guestbookInput.trim()) return;
    const newEntry = { id: Date.now(), text: guestbookInput.trim(), date: new Date().toLocaleString() };
    const updated = [newEntry, ...guestbookEntries];
    setGuestbookEntries(updated);
    try {
      localStorage.setItem("guestbook_entries", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save guestbook entries", e);
    }
    setGuestbookInput("");
  };

  return (
    <div className="relative overflow-hidden" style={{ height: `${screenHeight}px`, width: `${screenWidth}px`, fontFamily: "Pretendard, Inter, sans-serif", margin: "0 auto" }}>
      {/* 전체 배경 그라데이션 */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${PINK} 0%, ${MINT} 100%)` }} />

      {/* 상단: 로고 / 알람 / 메뉴 (사라짐 처리 when collapsed) */}
      <motion.div initial={false} animate={{ opacity: isCollapsed ? 0 : 1 }} transition={{ duration: 0.3 }} style={{ pointerEvents: isCollapsed ? "none" : "auto" }} className="absolute top-12 left-4 right-4 z-30 flex items-center justify-between">
        <img src="/assets/logo.png" alt="logo" style={{ height: 20 }} />
        <div className="flex items-center gap-3">
          <img src="/assets/alarm.png" alt="alarm" style={{ height: 20 }} />
          <img src="/assets/menu.png" alt="menu" style={{ height: 20 }} />
        </div>
      </motion.div>

      {/* AI 음성대화 UI (탭바를 내렸을 때만 표시) */}
      {isCollapsed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-32 text-white" style={{ pointerEvents: "auto" }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 140, height: 140, borderRadius: 999, border: "4px solid white" }}
          />

          <motion.div
            className="mt-6 text-center flex flex-col gap-3"
            style={{ maxWidth: "80%" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ fontSize: 19, fontWeight: 700 }}>
              마음이 많이 상했어요... 오늘은 평소보다 차분한 분위기로 조명을 조정했어요.
            </div>
            <div style={{ fontSize: 15, opacity: 0.7 }}>
              오늘 어떤 복잡한 일이 있었나요?
            </div>
            <div style={{ fontSize: 13, opacity: 0.5 }}>
              안녕하세요 철수!
            </div>
          </motion.div>

          <motion.div
            className="absolute flex justify-center w-full"
            style={{ bottom: "150px", pointerEvents: "auto" }}
            whileTap={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <div style={{ width: 70, height: 70, borderRadius: 999, background: "white", opacity: 0.95 }} />
          </motion.div>
        </div>
      )}




      {/* 시트(하단 탭바) - 드래그 가능 */}
      <motion.div drag="y" dragElastic={0.3} dragConstraints={{ top: expandedY, bottom: collapsedY }} onDragEnd={handleDragEnd} animate={controls} style={{ y: sheetY }} className="absolute left-0 right-0 bottom-0 z-20 flex justify-center">
        <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-t-3xl px-5 pt-3 pb-6" style={{ width: "100%", height: `${sheetHeight}px`, boxSizing: "border-box" }}>
          <div className="flex justify-center">
            <div onClick={handleToggleFromProtrusion} style={{ width: 160, height: 7, borderRadius: 999, background: "#e85298", cursor: "pointer" }} />
          </div>

          <div style={{ height: sheetHeight - 100, overflow: "auto", paddingTop: 16 }}>
            {/* HOME content */}
            {activeTab === "home" && (
              <div>
                <div className="text-sm font-bold mb-3">PACO의 제안</div>
                <div className="rounded-2xl bg-white/80 shadow-inner border border-gray-100 p-3 mb-6 relative space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/assets/weather.png" alt="날씨" style={{ width: 60, height: 60, borderRadius: 12 }} />
                    <div>
                      <div className="text-sm">비 / 최고 21° 최저 16°</div>
                      <div className="text-xs text-gray-500">현재 온도 18°</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-6">
                    오늘은 비 소식이 있네요. 지난번처럼 기분이 조금 가라앉을 수도 있겠어요. 하지만 괜찮아요. 제가 기분을 조금 끌어올려 드릴게요.
                  </div>

                  <div className="rounded-2xl bg-white p-3 flex flex-col items-center shadow space-y-4">
                    <div className="flex items-center gap-3 w-full mb-3">
                      <img src={playlist[currentTrack].album} alt="album" style={{ width: 60, height: 60, borderRadius: 12 }} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{playlist[currentTrack].title}</div>
                        <div className="text-xs text-gray-500">{playlist[currentTrack].artist}</div>
                        <input type="range" min="0" max={playlist[currentTrack].duration} value={progress} onChange={handleProgressChange} className="w-full" />
                        <div className="text-[10px] text-gray-500 flex justify-between">
                          <span>{Math.floor(progress / 60)}:{String(progress % 60).padStart(2, '0')}</span>
                          <span>{Math.floor(playlist[currentTrack].duration / 60)}:{String(playlist[currentTrack].duration % 60).padStart(2, '0')}</span>
                        </div>
                      </div>
                      <button className="absolute top-3 right-5 text-gray-400 text-lg">+</button>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-3">
                      <img src={shuffle ? "/assets/shuffle_on.png" : "/assets/shuffle_off.png"} alt="shuffle" onClick={() => setShuffle(!shuffle)} style={{ width: 24, cursor: "pointer" }} />
                      <img src="/assets/prev.png" alt="prev" onClick={handlePrev} style={{ width: 24, cursor: "pointer" }} />
                      <img src={isPlaying ? "/assets/pause.png" : "/assets/play.png"} alt="play-pause" onClick={togglePlay} style={{ width: 20, cursor: "pointer" }} />
                      <img src="/assets/next.png" alt="next" onClick={handleNext} style={{ width: 24, cursor: "pointer" }} />
                      <img src={repeat ? "/assets/repeat_on.png" : "/assets/repeat_off.png"} alt="repeat" onClick={() => setRepeat(!repeat)} style={{ width: 24, cursor: "pointer" }} />
                    </div>
                  </div>
                </div>

                <div className="text-sm font-bold mb-3">AI 리모컨</div>
                <div className="grid grid-cols-4 gap-3">
                  {Object.keys(remoteState).map((name) => (
                    <div key={name} onClick={() => toggleDevice(name)} className="flex flex-col items-center p-4 rounded-xl shadow-sm cursor-pointer transition-colors duration-200" style={{ background: remoteState[name] ? "#F8D5E2" : "#F3F4F6" }}>
                      <img src={remoteState[name] ? `/assets/${name}_on.png` : `/assets/${name}_off.png`} alt={name} style={{ width: 25, height: 27 }} />
                      <div className="text-xs mt-3">{name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODE / LOG / MY content */}

            {activeTab === "mode" && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow">
                  <div className="font-semibold text-gray-700 text-sm">나의 루틴 만들기</div>
                  <button className="text-[#E6007E] font-bold text-xl">+</button>
                </div>
              </div>
            )}

            {activeTab === "log" && (
              <div className="mt-4 space-y-4">
                {/* 오늘 하루 기록하기 */}
                <div className="p-4 bg-white rounded-2xl shadow text-center font-semibold text-gray-700 text-sm">
                  오늘 하루 기록하기
                </div>

                {/* 달력 */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-600">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow">
                        {i + 1}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full mt-1"
                        style={{
                          background: Math.random() > 0.5 ? "#E6007E" : "#00A88E", // AI 기록 / 사용자 기록 구분
                          opacity: Math.random() > 0.5 ? 0.8 : 0.5,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 메모 입력 */}
                <div className="p-4 bg-white rounded-2xl shadow text-gray-600 text-sm flex flex-col gap-2">
                  <textarea
                    value={guestbookInput}
                    onChange={(e) => setGuestbookInput(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="w-full h-24 bg-gray-50 rounded-xl p-2 outline-none resize-none"
                  />

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setGuestbookInput("");
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-200 text-sm"
                    >
                      취소
                    </button>
                    <button onClick={handleGuestbookSubmit} className="px-4 py-2 rounded-xl bg-[#E6007E] text-white text-sm">
                      메모하기
                    </button>
                  </div>

                  {/* 박명록 리스트 */}
                  <div className="mt-4 space-y-3">
                    {guestbookEntries.length === 0 ? (
                      <div className="text-xs text-gray-400">아직 기록이 없습니다.</div>
                    ) : (
                      guestbookEntries.map((entry) => (
                        <div key={entry.id} className="p-3 bg-white rounded-xl shadow text-sm">
                          <div className="text-xs text-gray-400">{entry.date}</div>
                          <div className="mt-1">{entry.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "my" && (
              <div className="mt-4 space-y-6 text-sm text-gray-700">
                <div className="p-4 bg-white rounded-2xl shadow flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-300" />
                  <div className="flex-1">
                    <div className="font-bold">김철수 님! 반갑습니다!</div>
                    <div className="text-[#E6007E] text-xs mt-1">수정 · 관리</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-gray-800">기기관리</div>
                  <div className="p-4 bg-white rounded-2xl shadow">기기 등록</div>
                  <div className="p-4 bg-white rounded-2xl shadow">기기 해제</div>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-gray-800">알림</div>
                  <div className="p-4 bg-white rounded-2xl shadow">수신 설정</div>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-gray-800">고객 서비스</div>
                  <div className="p-4 bg-white rounded-2xl shadow">공지사항</div>
                  <div className="p-4 bg-white rounded-2xl shadow">자주하는 질문</div>
                </div>

                <div className="space-y-3 mb-10">
                  <div className="font-bold text-gray-800">기타 설정</div>
                  <div className="p-4 bg-white rounded-2xl shadow">햅틱 설정</div>
                  <div className="p-4 bg-white rounded-2xl shadow">사운드 설정</div>
                  <div className="p-4 bg-white rounded-2xl shadow">음성 설정</div>
                  <div className="p-4 bg-white rounded-2xl shadow">우리집 설정</div>
                  <div className="p-4 bg-white rounded-2xl shadow">앱 정보</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 하단 고정 메인 탭 */}
      <motion.div initial={false} animate={{ opacity: isCollapsed ? 0 : 1, y: isCollapsed ? 20 : 0 }} transition={{ duration: 0.3 }} className="absolute left-0 right-0 flex justify-center z-40" style={{ bottom: 18 }}>
        <div className="bg-white/90 rounded-2xl shadow-lg px-6 py-3 flex items-center justify-between w-[90%] max-w-[360px]">
          {[{ id: "home", label: "홈" }, { id: "mode", label: "모드" }, { id: "log", label: "기록" }, { id: "my", label: "마이" }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center text-xs ${activeTab === t.id ? "text-[#E6007E]" : "text-gray-400"}`}>
              <img src={activeTab === t.id ? `/assets/${t.id}_on.png` : `/assets/${t.id}_off.png`} alt={t.label} style={{ width: 20, height: 22, marginBottom: 4 }} />
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

if (typeof document !== "undefined") {
  const root = document.getElementById("root") || document.body.appendChild(document.createElement("div"));
  root.id = "root";
  createRoot(root).render(<ParfitUiBeta />);
}
