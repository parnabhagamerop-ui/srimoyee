/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Layers,
  Gamepad2,
  Heart,
  Settings,
  X,
  Droplets,
  Award,
  BookOpen,
  Sliders,
  ChevronRight
} from 'lucide-react';

import { DailyLog, CycleSettings, UserStats, AccessoryType, FlowIntensity, UserProfile } from './types';
import { getInitialLogs, calculateCyclePrediction, formatDateStr, parseDateStr } from './utils';
import { ACCESSORIES, PHASE_INFO } from './data';
import Mascot from './components/Mascot';
import CalendarView from './components/CalendarView';
import SymptomLogger from './components/SymptomLogger';
import InsightsView from './components/InsightsView';
import FunZone from './components/FunZone';
import ChatView from './components/ChatView';
import Onboarding from './components/Onboarding';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  saveBackupToDrive,
  findBackupFile,
  loadBackupFromDrive,
  BackupData
} from './drive';

export default function App() {
  // Load initial data from LocalStorage or use fallback
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('flowy_period_logs');
    return saved ? JSON.parse(saved) : getInitialLogs();
  });

  const [settings, setSettings] = useState<CycleSettings>(() => {
    const saved = localStorage.getItem('flowy_cycle_settings');
    return saved ? JSON.parse(saved) : { cycleLength: 28, periodLength: 5 };
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('flowy_user_stats');
    return saved ? JSON.parse(saved) : {
      sparklePoints: 45, // give them some initial points to buy accessories!
      boughtAccessories: [],
      selectedAccessory: 'none',
      waterGoal: 8
    };
  });

  // Today helper
  const getTodayStr = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());
  const [activeTab, setActiveTab] = useState<'companion' | 'calendar' | 'insights' | 'funzone' | 'chat'>('companion');
  const [showShopModal, setShowShopModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('flowy_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Google Drive Cloud Backup state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'not_found'>('idle');
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('flowy_last_backup_time');
  });

  // Setup Google Drive Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleDriveLogin = async () => {
    try {
      setBackupStatus('idle');
      setRestoreStatus('idle');
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleDriveLogout = async () => {
    try {
      await logout();
      setDriveUser(null);
      setDriveToken(null);
      setBackupStatus('idle');
      setRestoreStatus('idle');
    } catch (err) {
      console.error('Google Logout failed:', err);
    }
  };

  const handleBackupToDrive = async () => {
    if (!driveToken) return;
    setBackupStatus('loading');
    setRestoreStatus('idle');
    try {
      const backupData: BackupData = {
        logs,
        settings,
        stats,
        profile,
        backupTime: new Date().toISOString()
      };
      await saveBackupToDrive(driveToken, backupData);
      const timeStr = new Date().toLocaleString();
      setLastBackupTime(timeStr);
      localStorage.setItem('flowy_last_backup_time', timeStr);
      setBackupStatus('success');
    } catch (err) {
      console.error('Backup failed:', err);
      setBackupStatus('error');
    }
  };

  const handleRestoreFromDrive = async () => {
    if (!driveToken) return;
    
    const confirmRestore = window.confirm(
      '⚠️ This will overwrite your current period tracker history and settings with the Google Drive backup. Are you sure?'
    );
    if (!confirmRestore) return;

    setRestoreStatus('loading');
    setBackupStatus('idle');
    try {
      const fileInfo = await findBackupFile(driveToken);
      if (!fileInfo) {
        setRestoreStatus('not_found');
        return;
      }

      const backupData = await loadBackupFromDrive(driveToken, fileInfo.id);
      
      if (backupData.logs) {
        setLogs(backupData.logs);
      }
      if (backupData.settings) {
        setSettings(backupData.settings);
      }
      if (backupData.stats) {
        setStats(backupData.stats);
      }
      if (backupData.profile) {
        setProfile(backupData.profile);
      }
      
      setRestoreStatus('success');
      if (backupData.backupTime) {
        const timeStr = new Date(backupData.backupTime).toLocaleString();
        setLastBackupTime(timeStr);
        localStorage.setItem('flowy_last_backup_time', timeStr);
      }
    } catch (err) {
      console.error('Restore failed:', err);
      setRestoreStatus('error');
    }
  };

  // Sync to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('flowy_period_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('flowy_cycle_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('flowy_user_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('flowy_user_profile', JSON.stringify(profile));
    }
  }, [profile]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);

    const newSettings: CycleSettings = {
      cycleLength: newProfile.cycleLength,
      periodLength: newProfile.periodDuration
    };
    setSettings(newSettings);

    // Populate actual continuous period start logs based on lastPeriodDate
    const start = parseDateStr(newProfile.lastPeriodDate);
    const updatedLogs = [...logs];

    for (let i = 0; i < newProfile.periodDuration; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = formatDateStr(currentDate);

      const existingIdx = updatedLogs.findIndex(l => l.dateStr === dateStr);
      const initialSymptomList = i === 1 && newProfile.symptoms.length > 0 ? [newProfile.symptoms[0]] : [];
      
      const newLog: DailyLog = {
        dateStr,
        flow: i === 0 || i === newProfile.periodDuration - 1 ? 'spotty' : 'normal',
        symptoms: initialSymptomList,
        mood: 'marshmallow',
        waterIntake: 6,
        notes: i === 0 ? 'My period started! 🩸' : 'Onboarded cycle flow.'
      };

      if (existingIdx >= 0) {
        updatedLogs[existingIdx] = {
          ...updatedLogs[existingIdx],
          flow: newLog.flow,
          notes: newLog.notes
        };
      } else {
        updatedLogs.push(newLog);
      }
    }

    setLogs(updatedLogs);

    // Award 50 bonus sparkles!
    setStats(prev => ({
      ...prev,
      sparklePoints: prev.sparklePoints + 50
    }));
  };

  const handleSettingsPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Photo size should be less than 2MB! 🥺');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => prev ? { ...prev, profilePhoto: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recalculate cycle predictions based on current logs and settings
  const prediction = calculateCyclePrediction(logs, settings);

  // Quick period toggle for today
  const handleTogglePeriodToday = () => {
    const todayStr = getTodayStr();
    const existingIndex = logs.findIndex(l => l.dateStr === todayStr);

    let updatedLogs = [...logs];
    if (existingIndex >= 0) {
      const currentFlow = logs[existingIndex].flow;
      const nextFlow: FlowIntensity = currentFlow && currentFlow !== 'none' ? 'none' : 'normal';
      
      updatedLogs[existingIndex] = {
        ...logs[existingIndex],
        flow: nextFlow
      };

      // Sparkle bonus if turning period ON
      if (nextFlow === 'normal') {
        handleAwardSparkles(15);
      }
    } else {
      updatedLogs.push({
        dateStr: todayStr,
        flow: 'normal',
        symptoms: [],
        mood: 'marshmallow',
        waterIntake: 0,
        notes: 'Period started today! 🩸'
      });
      handleAwardSparkles(15);
    }

    setLogs(updatedLogs);
    setSelectedDateStr(todayStr); // jump to today in logger
  };

  // Check if period is active today
  const isPeriodActiveToday = () => {
    const todayStr = getTodayStr();
    const todayLog = logs.find(l => l.dateStr === todayStr);
    return !!(todayLog && todayLog.flow && todayLog.flow !== 'none');
  };

  // Add Sparkles
  const handleAwardSparkles = (points: number) => {
    setStats(prev => ({
      ...prev,
      sparklePoints: prev.sparklePoints + points
    }));
  };

  // Save/update log for a single day
  const handleSaveLog = (updatedLog: DailyLog) => {
    const index = logs.findIndex(l => l.dateStr === updatedLog.dateStr);
    let newLogs = [...logs];

    if (index >= 0) {
      newLogs[index] = updatedLog;
    } else {
      newLogs.push(updatedLog);
    }
    setLogs(newLogs);
    // Award sparkles for any log save!
    handleAwardSparkles(15);
  };

  // Water intake logging
  const handleLogWaterForSelected = (glasses: number) => {
    const index = logs.findIndex(l => l.dateStr === selectedDateStr);
    let newLogs = [...logs];

    if (index >= 0) {
      newLogs[index] = {
        ...logs[index],
        waterIntake: glasses
      };
    } else {
      newLogs.push({
        dateStr: selectedDateStr,
        flow: 'none',
        symptoms: [],
        mood: '',
        waterIntake: glasses,
        notes: ''
      });
    }
    setLogs(newLogs);
  };

  // Handle accessorizing shop actions
  const handleBuyOrEquipAccessory = (accId: AccessoryType, cost: number) => {
    const isBought = stats.boughtAccessories.includes(accId);

    if (isBought) {
      // Toggle Equip/Unequip
      setStats(prev => ({
        ...prev,
        selectedAccessory: prev.selectedAccessory === accId ? 'none' : accId
      }));
    } else {
      // Buy
      if (stats.sparklePoints >= cost) {
        setStats(prev => ({
          ...prev,
          sparklePoints: prev.sparklePoints - cost,
          boughtAccessories: [...prev.boughtAccessories, accId],
          selectedAccessory: accId
        }));
      } else {
        alert("Not enough sparkles! Tap Lulu or log symptoms to get more! ✨");
      }
    }
  };

  const getSelectedDayLog = () => {
    return logs.find(l => l.dateStr === selectedDateStr);
  };

  const activePhaseDetails = PHASE_INFO[prediction.phase];

  return (
    <div id="app-root" className="min-h-screen bg-[#FFF0F5] py-6 px-4 flex justify-center items-center font-sans antialiased">
      
      {/* Mobile Frame Container with solid Bento offset shadow */}
      <div id="mobile-mockup-frame" className="w-full max-w-md bg-[#FFFFFF] border-bubbly rounded-[40px] shadow-[12px_12px_0px_0px_#3D0C11] flex flex-col overflow-hidden relative aspect-[9/19] max-h-[850px] min-h-[760px]">
        
        {/* Mobile Status Notch Area */}
        <div className="bg-[#FFF0F5] h-7 flex items-center justify-between px-6 border-b-3 border-[#3D0C11] select-none">
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] font-mono font-bold text-[#3D0C11]">Flowy Cellular</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 border border-[#3D0C11]"></div>
          </div>
          <div className="w-20 h-4 bg-[#3D0C11] rounded-b-xl border-x-2 border-b-2 border-[#3D0C11]"></div>
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] font-mono font-bold text-[#3D0C11]">100% 🔋</span>
          </div>
        </div>

        {profile === null ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Dynamic App Header */}
        <header className="bg-white px-5 py-4 flex items-center justify-between border-b-4 border-[#3D0C11] select-none">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-pink-200 border-2 border-[#3D0C11] flex items-center justify-center text-lg shadow-sm overflow-hidden shrink-0">
              {profile.profilePhoto ? (
                profile.profilePhoto.startsWith('data:image/') ? (
                  <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.profilePhoto}</span>
                )
              ) : (
                <span>🌸</span>
              )}
            </div>
            <div>
              <h1 className="font-mono text-sm font-black tracking-tight text-[#3D0C11] leading-none max-w-[120px] truncate" title={profile.name}>
                {profile.name}
              </h1>
              <span className="text-[8px] font-sans font-black text-[#FF7597] uppercase tracking-wider">
                Cycle Owner
              </span>
            </div>
          </div>

          {/* Quick Stats Block (Sparkles / Closet / Settings) */}
          <div className="flex items-center gap-2">
            {/* Sparkle counter */}
            <motion.div
              onClick={() => setShowShopModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-amber-50 hover:bg-amber-100 border-bubbly-sm rounded-2xl py-1 px-3 flex items-center gap-1 cursor-pointer"
            >
              <span className="text-sm">✨</span>
              <span className="text-xs font-mono font-black text-amber-600">{stats.sparklePoints}</span>
            </motion.div>

            {/* Customize / Dress Up Button */}
            <button
              onClick={() => setShowShopModal(true)}
              className="p-1.5 border-bubbly-sm rounded-xl bg-pink-50 hover:bg-pink-100 cursor-pointer text-pink-600 transition-all"
              title="Dress up Lulu"
            >
              🎀
            </button>

            {/* Cycle Parameters Settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 border-bubbly-sm rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-600 transition-all"
              title="Cycle Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body (Scrollable container) */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-none">
          <AnimatePresence mode="wait">
            {activeTab === 'companion' && (
              <motion.div
                key="companion"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-4"
              >
                {/* Companion Mascot Box */}
                <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF6E3] border-bubbly rounded-3xl p-3.5 bubbly-shadow">
                  
                  {/* Phase Sticker info bubble */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-mono font-black text-pink-600 bg-pink-50 border-bubbly-sm border-pink-200 py-0.5 px-2.5 rounded-full">
                      Lulu is cozy!
                    </span>
                    <span className="text-[10px] font-sans font-bold text-gray-500">
                      Phase: <strong className="text-amber-600 uppercase">{prediction.phase}</strong>
                    </span>
                  </div>

                  {/* SVG Animated Mascot */}
                  <Mascot
                    phase={prediction.phase}
                    currentMoodId={getSelectedDayLog()?.mood || 'marshmallow'}
                    selectedAccessory={stats.selectedAccessory}
                    sparklePoints={stats.sparklePoints}
                    onPoke={() => handleAwardSparkles(2)}
                  />
                </div>

                {/* Quick Period Logging / Action Slider for today */}
                <div className="bg-white border-bubbly rounded-3xl p-4.5 bubbly-shadow flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-mono text-sm font-black text-gray-800 leading-tight">
                        Period Started Today? 🩸
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Tap to toggle menstruation logs
                      </p>
                    </div>

                    <motion.button
                      onClick={handleTogglePeriodToday}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ backgroundColor: isPeriodActiveToday() ? '#FF7597' : '#F3F4F6' }}
                      className={`py-2 px-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isPeriodActiveToday()
                          ? 'border-gray-800 text-white font-black bubbly-shadow-sm'
                          : 'border-gray-200 text-gray-600 font-bold'
                      }`}
                    >
                      {isPeriodActiveToday() ? 'Started! 🩸' : 'None 🌸'}
                    </motion.button>
                  </div>
                </div>

                {/* Short statistics overview widgets */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    className={`border-2 rounded-3xl p-3.5 flex flex-col gap-1 relative overflow-hidden transition-all duration-300 ${
                      prediction.phase === 'menstrual' ? 'bento-card-pink' :
                      prediction.phase === 'follicular' ? 'bento-card-green' :
                      prediction.phase === 'ovulatory' ? 'bento-card-yellow' :
                      prediction.phase === 'luteal' ? 'bento-card-purple' :
                      'bento-card-white'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-extrabold uppercase opacity-80">Season of body</span>
                    <h4 className="font-mono text-sm font-black truncate">
                      {prediction.phase.toUpperCase()}
                    </h4>
                    <p className="text-[10px] leading-tight mt-0.5 line-clamp-2 opacity-90">
                      {activePhaseDetails.title} Phase
                    </p>
                  </div>

                  <div className="bento-card-purple border-2 rounded-3xl p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-extrabold uppercase opacity-80">Hormone vibe</span>
                      <h4 className="font-mono text-sm font-black mt-0.5">
                        {getSelectedDayLog()?.mood ? getSelectedDayLog()?.mood.toUpperCase() : 'COZY'}
                      </h4>
                    </div>
                    <span className="text-[10px] mt-2 font-bold leading-none opacity-90">
                      Logged today
                    </span>
                  </div>
                </div>

                {/* Quick Navigation Card */}
                <div
                  onClick={() => setActiveTab('calendar')}
                  className="bg-pink-50 hover:bg-pink-100/80 border-bubbly-sm rounded-2xl p-3 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <div className="text-left">
                      <p className="text-xs font-black text-pink-800 leading-none">View Cute Period Calendar</p>
                      <p className="text-[10px] text-pink-500 leading-none mt-0.5">Log custom symptoms & moods</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-pink-600" />
                </div>

              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-4"
              >
                {/* Custom Month Calendar view */}
                <CalendarView
                  logs={logs}
                  prediction={prediction}
                  selectedDateStr={selectedDateStr}
                  onSelectDate={setSelectedDateStr}
                />

                {/* Day Logger block */}
                <SymptomLogger
                  dateStr={selectedDateStr}
                  existingLog={getSelectedDayLog()}
                  onSaveLog={handleSaveLog}
                  sparklePoints={stats.sparklePoints}
                />
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {/* Predictions & Seasons detailed info */}
                <InsightsView prediction={prediction} />
              </motion.div>
            )}

            {activeTab === 'funzone' && (
              <motion.div
                key="funzone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {/* Play room water tracker and clicker buster */}
                <FunZone
                  waterIntake={getSelectedDayLog()?.waterIntake || 0}
                  waterGoal={stats.waterGoal}
                  onLogWater={handleLogWaterForSelected}
                  sparklePoints={stats.sparklePoints}
                  onAddSparkles={handleAwardSparkles}
                />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <ChatView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Beautiful Whimsical Footer Tab Bar */}
        <nav className="absolute bottom-0 inset-x-0 bg-white border-t-3 border-[#3D0C11] px-2 py-2.5 flex justify-around items-center select-none z-20">
          {[
            { id: 'companion', label: 'Lulu', bangla: 'Ghor', icon: '🏠' },
            { id: 'calendar', label: 'Calendar', bangla: 'Masik', icon: '📅' },
            { id: 'insights', label: 'Seasons', bangla: 'Mon', icon: '📊' },
            { id: 'chat', label: 'Pavoo AI', bangla: 'Chat', icon: '💬' },
            { id: 'funzone', label: 'Playroom', bangla: 'Moja', icon: '🎮' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all relative ${
                  isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`text-xl p-1.5 rounded-xl border-2 transition-all ${
                    isActive ? 'bg-[#FFCAD4] border-[#3D0C11] bubbly-shadow-sm' : 'bg-transparent border-transparent'
                  }`}
                >
                  {tab.icon}
                </div>
                <span className="text-[9px] font-mono font-black text-[#3D0C11] leading-none mt-1">
                  {tab.label}
                </span>
                <span className="text-[7px] font-sans font-bold text-[#FF7597] leading-none">
                  {tab.bangla}
                </span>
              </button>
            );
          })}
        </nav>

        {/* MODAL: ACCESSORY DRESS SHOP */}
        <AnimatePresence>
          {showShopModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 p-4"
            >
              <motion.div
                initial={{ y: 200, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 200, scale: 0.95 }}
                transition={{ type: 'spring', damping: 18 }}
                className="w-full bg-white border-bubbly rounded-3xl p-5 flex flex-col gap-4 bubbly-shadow max-h-[85%] overflow-y-auto"
              >
                {/* Header of closet shop */}
                <div className="flex items-center justify-between pb-2.5 border-b-2 border-dashed border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">👗</span>
                    <div>
                      <h4 className="font-mono text-base font-black text-gray-800 leading-none">Lulu's Cute Closet</h4>
                      <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">Dress Up Lulu</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowShopModal(false)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer border-2 border-gray-300"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Sparkle counter inside closet */}
                <div className="bg-amber-50 border-bubbly-sm rounded-2xl p-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-600 animate-pulse" /> Your Sparkles:
                  </span>
                  <span className="font-mono text-base font-black text-amber-600">✨ {stats.sparklePoints}</span>
                </div>

                {/* Closet Shelf Items */}
                <div className="flex flex-col gap-2.5">
                  {/* Option None / Standard */}
                  <div className="flex items-center justify-between p-2.5 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 bg-white border-bubbly-sm rounded-xl flex items-center justify-center text-xl shadow-sm">
                        🌸
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800">Original Lulu</p>
                        <p className="text-[10px] text-gray-400">Pure squishy blob state</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipAccessory('none', 0)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 cursor-pointer transition-all ${
                        stats.selectedAccessory === 'none'
                          ? 'bg-[#3D0C11] text-white border-[#3D0C11]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {stats.selectedAccessory === 'none' ? 'Equipped' : 'Use'}
                    </button>
                  </div>

                  {ACCESSORIES.map(acc => {
                    const isBought = stats.boughtAccessories.includes(acc.id);
                    const isEquipped = stats.selectedAccessory === acc.id;

                    return (
                      <div
                        key={acc.id}
                        className={`flex items-center justify-between p-2.5 border-2 rounded-2xl transition-all ${
                          isEquipped ? 'border-[#3D0C11] bg-[#FFCAD4]/30' : 'border-gray-100 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 bg-white border-bubbly-sm rounded-xl flex items-center justify-center text-2xl shadow-sm">
                            {acc.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-gray-800">{acc.name}</p>
                            <p className="text-[10px] text-pink-500 font-bold">{acc.banglaName}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyOrEquipAccessory(acc.id, acc.cost)}
                          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 cursor-pointer transition-all ${
                            isEquipped
                              ? 'bg-[#FFCAD4] text-[#3D0C11] border-[#3D0C11] bubbly-shadow-sm font-black'
                              : isBought
                              ? 'bg-[#3D0C11] text-white border-[#3D0C11] hover:opacity-90'
                              : 'bg-[#FDFFB6] text-[#3D0C11] border-[#3D0C11] hover:opacity-95 font-black'
                          }`}
                        >
                          {isEquipped ? 'Equipped 🎀' : isBought ? 'Use' : `Buy ✨${acc.cost}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: CYCLE PARAMETERS SETTINGS */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="w-full max-w-sm bg-white border-bubbly rounded-3xl p-5 flex flex-col gap-4.5 bubbly-shadow"
              >
                {/* Header of Settings */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">⚙️</span>
                    <div>
                      <h4 className="font-mono text-base font-black text-gray-800 leading-none">Cycle Setup</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Configure predictions</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer border-2 border-gray-300"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Settings Inputs */}
                <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                  
                  {/* Account Profile info */}
                  {profile && (
                    <div className="space-y-3 pb-3 border-b-2 border-dashed border-gray-100">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono font-black text-gray-700">ACCOUNT PROFILE NAME: 🎀</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile(prev => prev ? { ...prev, name: val } : null);
                          }}
                          className="w-full bg-gray-50 border-2 border-[#3D0C11] rounded-xl px-3 py-1.5 text-xs font-bold text-[#3D0C11]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono font-black text-gray-700">DATE OF BIRTH: 📅</label>
                        <input
                          type="date"
                          value={profile.dob}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile(prev => prev ? { ...prev, dob: val } : null);
                          }}
                          className="w-full bg-gray-50 border-2 border-[#3D0C11] rounded-xl px-3 py-1.5 text-xs font-bold text-[#3D0C11]"
                        />
                      </div>

                      {/* Profile Photo selector in settings */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono font-black text-gray-700">PROFILE PHOTO / AVATAR: 📸</label>
                        <div className="flex items-center gap-2 bg-gray-50 border-2 border-[#3D0C11] rounded-xl p-2">
                          <div className="w-10 h-10 rounded-full border-2 border-[#3D0C11] overflow-hidden shrink-0 bg-pink-100 flex items-center justify-center text-xl shadow-inner">
                            {profile.profilePhoto ? (
                              profile.profilePhoto.startsWith('data:image/') ? (
                                <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{profile.profilePhoto}</span>
                              )
                            ) : (
                              <span>🌸</span>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-1">
                            {/* Preset quick picker */}
                            <div className="flex gap-1 overflow-x-auto py-0.5 max-w-[170px] scrollbar-none">
                              {['🌸', '🍓', '👑', '🧸', '🐱', '🥑', '🦄'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setProfile(prev => prev ? { ...prev, profilePhoto: emoji } : null);
                                  }}
                                  className={`w-6 h-6 rounded-md border text-xs flex items-center justify-center cursor-pointer transition-transform active:scale-90 shrink-0 ${
                                    profile.profilePhoto === emoji ? 'bg-[#FFCAD4] border-[#3D0C11]' : 'bg-white border-gray-200'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>

                            {/* Image upload trigger */}
                            <label className="px-2 py-0.5 bg-white hover:bg-pink-50 text-[#3D0C11] border border-[#3D0C11] rounded-lg text-[9px] font-mono font-black cursor-pointer text-center select-none active:scale-95 transition-all w-fit">
                              Upload 📸
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSettingsPhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slider Average Cycle Length */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-gray-700">
                      <span>Average Cycle: <span className="text-pink-500">(Cycle Length)</span></span>
                      <span>{settings.cycleLength} Days</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={settings.cycleLength}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSettings(prev => ({ ...prev, cycleLength: val }));
                        setProfile(prev => prev ? { ...prev, cycleLength: val } : null);
                      }}
                      className="w-full accent-pink-500 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-400 italic">Default is usually 28 days</span>
                  </div>

                  {/* Slider Average Period Duration */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-gray-700">
                      <span>Average Period: <span className="text-rose-500">(Period Duration)</span></span>
                      <span>{settings.periodLength} Days</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="14"
                      value={settings.periodLength}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSettings(prev => ({ ...prev, periodLength: val }));
                        setProfile(prev => prev ? { ...prev, periodDuration: val } : null);
                      }}
                      className="w-full accent-rose-500 h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-400 italic">Default is usually 5 days</span>
                  </div>

                  {/* Reminder Preferences in Settings */}
                  {profile && (
                    <div className="pt-3 border-t-2 border-dashed border-gray-100 space-y-2">
                      <span className="text-[10px] font-mono font-black text-gray-700 uppercase block">Reminder Toggles: 🔔</span>
                      
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Daily Log Check-in</span>
                        <input
                          type="checkbox"
                          checked={profile.reminderPreferences.dailyLog}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setProfile(prev => prev ? {
                              ...prev,
                              reminderPreferences: { ...prev.reminderPreferences, dailyLog: val }
                            } : null);
                          }}
                          className="w-4 h-4 accent-[#FF7597]"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Period Predictions</span>
                        <input
                          type="checkbox"
                          checked={profile.reminderPreferences.periodPrediction}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setProfile(prev => prev ? {
                              ...prev,
                              reminderPreferences: { ...prev.reminderPreferences, periodPrediction: val }
                            } : null);
                          }}
                          className="w-4 h-4 accent-[#FF7597]"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Cute Health Tips</span>
                        <input
                          type="checkbox"
                          checked={profile.reminderPreferences.cycleHealth}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setProfile(prev => prev ? {
                              ...prev,
                              reminderPreferences: { ...prev.reminderPreferences, cycleHealth: val }
                            } : null);
                          }}
                          className="w-4 h-4 accent-[#FF7597]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Google Drive Backup Section */}
                  <div className="pt-3 border-t-2 border-dashed border-gray-100 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">☁️</span>
                      <span className="text-[10px] font-mono font-black text-gray-700 uppercase block">Google Drive Backup:</span>
                    </div>

                    {!driveToken ? (
                      <div className="bg-slate-50 border-2 border-[#3D0C11] rounded-2xl p-3 flex flex-col items-center gap-2 text-center">
                        <p className="text-[10px] text-gray-600 font-bold leading-tight">
                          Back up your cycle logs and settings to Google Drive!
                        </p>
                        <button
                          type="button"
                          onClick={handleDriveLogin}
                          className="gsi-material-button active:scale-95 transition-all"
                        >
                          <div className="gsi-material-button-state"></div>
                          <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents text-[10px] font-mono font-black">Sign in with Google</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#B9FBC0]/30 border-2 border-emerald-500 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-700">
                          <span className="truncate max-w-[120px] font-mono text-[9px]" title={driveUser?.email || ''}>
                            💚 {driveUser?.email || 'Connected'}
                          </span>
                          <button
                            type="button"
                            onClick={handleDriveLogout}
                            className="text-[9px] text-[#3D0C11] font-mono font-black hover:underline cursor-pointer"
                          >
                            Logout
                          </button>
                        </div>

                        {lastBackupTime && (
                          <p className="text-[9px] font-mono text-gray-500">
                            Last synced: {lastBackupTime}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleBackupToDrive}
                            disabled={backupStatus === 'loading' || restoreStatus === 'loading'}
                            className="py-1.5 px-2 bg-[#B9FBC0] hover:bg-[#a1fab0] text-[#3D0C11] font-mono font-bold text-[10px] rounded-xl cursor-pointer disabled:opacity-50 border-2 border-[#3D0C11] text-center flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            {backupStatus === 'loading' ? 'Syncing...' : 'Back up ☁️'}
                          </button>

                          <button
                            type="button"
                            onClick={handleRestoreFromDrive}
                            disabled={backupStatus === 'loading' || restoreStatus === 'loading'}
                            className="py-1.5 px-2 bg-[#FDFFB6] hover:bg-[#f6f8a8] text-[#3D0C11] font-mono font-bold text-[10px] rounded-xl cursor-pointer disabled:opacity-50 border-2 border-[#3D0C11] text-center flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            {restoreStatus === 'loading' ? 'Restoring...' : 'Restore 📥'}
                          </button>
                        </div>

                        {backupStatus === 'success' && (
                          <p className="text-[9px] text-emerald-600 font-bold text-center">
                            ✅ Sync complete!
                          </p>
                        )}
                        {backupStatus === 'error' && (
                          <p className="text-[9px] text-red-500 font-bold text-center">
                            ❌ Backup failed.
                          </p>
                        )}
                        {restoreStatus === 'success' && (
                          <p className="text-[9px] text-emerald-600 font-bold text-center">
                            ✅ Restore complete!
                          </p>
                        )}
                        {restoreStatus === 'not_found' && (
                          <p className="text-[9px] text-amber-600 font-bold text-center">
                            ⚠️ No backup found.
                          </p>
                        )}
                        {restoreStatus === 'error' && (
                          <p className="text-[9px] text-red-500 font-bold text-center">
                            ❌ Restore failed.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => setShowSettingsModal(false)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-mono font-bold text-xs rounded-2xl border-2 border-gray-800 bubbly-shadow-sm cursor-pointer"
                >
                  Save and Apply!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}

      </div>
    </div>
  );
}
