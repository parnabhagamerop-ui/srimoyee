import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CycleSettings } from '../types';
import { CUTE_SYMPTOMS } from '../data';
import { Sparkles, Calendar, Heart, Sliders, ChevronRight, ChevronLeft, Bell, Smile, Gift, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 15); // Default to 15 days ago
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${date}`;
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [reminders, setReminders] = useState({
    dailyLog: true,
    periodPrediction: true,
    cycleHealth: true
  });
  const [profilePhoto, setProfilePhoto] = useState('🌸');

  const [validationError, setValidationError] = useState('');

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setValidationError('Photo size should be less than 2MB! 🥺');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    setValidationError('');
    if (step === 2) {
      if (!name.trim()) {
        setValidationError('Prothome tomar namti likho, sweetheart! 🧸');
        return;
      }
      if (!dob) {
        setValidationError('Tomar Jonmo Tarikh (DOB) select koro! 📅');
        return;
      }
    }
    if (step === 3) {
      if (!lastPeriodDate) {
        setValidationError('Last period surur date select koro! 🩸');
        return;
      }
      if (cycleLength < 15 || cycleLength > 60) {
        setValidationError('Cycle length must be between 15 and 60 days! ⏱️');
        return;
      }
      if (periodDuration < 2 || periodDuration > 14) {
        setValidationError('Period duration must be between 2 and 14 days! 🩸');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Completed!
      const profile: UserProfile = {
        name: name.trim(),
        dob,
        lastPeriodDate,
        cycleLength,
        periodDuration,
        symptoms: selectedSymptoms,
        reminderPreferences: reminders,
        profilePhoto
      };
      onComplete(profile);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setValidationError('');
    }
  };

  // Progress Bar percentage
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="absolute inset-0 bg-[#FFF0F5] z-50 flex flex-col p-5 select-none overflow-y-auto">
      {/* Header Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-black text-[#3D0C11] uppercase tracking-wider">
            Create Account • Step {step} of {totalSteps}
          </span>
          <span className="text-xs text-[#FF7597] font-black">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-[#3D0C11] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FFCAD4] border-r-2 border-[#3D0C11]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content Card container */}
      <div className="flex-1 flex flex-col justify-center items-center py-2">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full text-center max-w-sm"
            >
              <div className="w-24 h-24 mx-auto bg-white border-4 border-[#3D0C11] rounded-full flex items-center justify-center text-5xl bubbly-shadow-sm mb-5">
                🍓
              </div>
              <h2 className="font-mono text-2xl font-black text-[#3D0C11] leading-tight mb-2.5">
                Welcome to Pavoo AI!
              </h2>
              <p className="text-xs text-gray-700 font-medium px-4 leading-relaxed">
                Menstrual tracker and cute wellness companion. Let's create your account so we can predict your cycles and track your symptom history together! ✨
              </p>
              
              <div className="mt-6 bg-[#FFCAD4]/30 border-2 border-dashed border-[#3D0C11] p-3 rounded-2xl text-left">
                <span className="text-[10px] font-mono font-black text-[#3D0C11] uppercase block mb-1">🎁 ACCOUNT BONUS:</span>
                <p className="text-[11px] text-gray-800 font-bold flex items-center gap-1">
                  Complete setup to instantly win <span className="text-pink-600">✨50 Sparkles</span> to dress up your companion mascot! 🧸
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col gap-4"
            >
              <div className="text-center">
                <span className="text-2xl">🧸</span>
                <h2 className="font-mono text-xl font-black text-[#3D0C11] mt-1">Hello, Sweetheart!</h2>
                <p className="text-xs text-gray-600 font-bold">Prothome tomar details gulo diye account khulo.</p>
              </div>

              <div className="space-y-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-black text-[#3D0C11]">TOMAR NAME / ডাকনাম: 🎀</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your cute name..."
                    maxLength={20}
                    className="w-full bg-white border-3 border-[#3D0C11] rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:bg-[#FFFDF0] placeholder-gray-400 bubbly-shadow-inset"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-black text-[#3D0C11]">DATE OF BIRTH (DOB): 📅</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white border-3 border-[#3D0C11] rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:bg-[#FFFDF0] text-[#3D0C11]"
                  />
                </div>

                {/* Profile Photo / Avatar Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-black text-[#3D0C11]">PROFILE PHOTO / AVATAR: 📸</label>
                  <div className="flex items-center gap-3 bg-white border-3 border-[#3D0C11] rounded-2xl p-3 bubbly-shadow-sm">
                    {/* Current Avatar Frame */}
                    <div className="w-14 h-14 rounded-full border-2 border-[#3D0C11] overflow-hidden shrink-0 bg-pink-100 flex items-center justify-center text-3xl shadow-inner relative">
                      {profilePhoto.startsWith('data:image/') ? (
                        <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profilePhoto}</span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5">
                      {/* Emoji Quick Selection */}
                      <div className="flex gap-1.5 overflow-x-auto py-0.5 max-w-[200px] scrollbar-none">
                        {['🌸', '🍓', '👑', '🧸', '🐱', '🥑', '🦄'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setProfilePhoto(emoji)}
                            className={`w-7 h-7 rounded-lg border-2 text-sm flex items-center justify-center cursor-pointer transition-transform active:scale-90 shrink-0 ${
                              profilePhoto === emoji ? 'bg-[#FFCAD4] border-[#3D0C11]' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* File Upload Button */}
                      <label className="px-2.5 py-1 bg-[#FFF0F5] hover:bg-[#FFCAD4] text-[#3D0C11] border-2 border-[#3D0C11] rounded-xl text-[10px] font-mono font-black cursor-pointer text-center select-none active:scale-95 transition-all w-fit">
                        Upload Photo 📸
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col gap-4"
            >
              <div className="text-center">
                <span className="text-2xl">🩸</span>
                <h2 className="font-mono text-xl font-black text-[#3D0C11] mt-1">Menstrual Cycle </h2>
                <p className="text-xs text-gray-600 font-bold">Predictive models calculation er jonne details dao.</p>
              </div>

              <div className="space-y-4 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-black text-[#3D0C11]">LAST PERIOD START DATE: 🩸</label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full bg-white border-3 border-[#3D0C11] rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:bg-[#FFFDF0] text-[#3D0C11]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-[#3D0C11]">CYCLE LENGTH (DAYS):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="15"
                        max="60"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(Math.max(15, Math.min(60, Number(e.target.value))))}
                        className="w-full bg-white border-3 border-[#3D0C11] rounded-2xl px-3 py-2 text-sm font-black focus:outline-none text-center"
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 font-bold text-center mt-0.5">(Regularly 28 days)</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-black text-[#3D0C11]">PERIOD DURATION (DAYS):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="2"
                        max="14"
                        value={periodDuration}
                        onChange={(e) => setPeriodDuration(Math.max(2, Math.min(14, Number(e.target.value))))}
                        className="w-full bg-white border-3 border-[#3D0C11] rounded-2xl px-3 py-2 text-sm font-black focus:outline-none text-center"
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 font-bold text-center mt-0.5">(Regularly 5 days)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col gap-3"
            >
              <div className="text-center">
                <span className="text-2xl">⚡</span>
                <h2 className="font-mono text-xl font-black text-[#3D0C11] mt-1">Typical Symptoms</h2>
                <p className="text-xs text-gray-600 font-bold">Tomar periods er somoy shadharonoto ki ki symptom thake?</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {CUTE_SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`flex items-center gap-2 p-2.5 border-2 rounded-2xl text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FFCAD4] border-[#3D0C11] bubbly-shadow-sm font-black'
                          : 'bg-white border-gray-200 hover:border-[#3D0C11]'
                      }`}
                    >
                      <span className="text-lg shrink-0">{symptom.icon}</span>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-mono leading-none font-black truncate text-[#3D0C11]">
                          {symptom.name}
                        </p>
                        <p className="text-[8px] text-gray-500 font-bold truncate mt-0.5">
                          {symptom.banglaName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col gap-4"
            >
              <div className="text-center">
                <span className="text-2xl">🔔</span>
                <h2 className="font-mono text-xl font-black text-[#3D0C11] mt-1">Notification Preferences</h2>
                <p className="text-xs text-gray-600 font-bold">Pavoo kobe kobe reminders pathabe set koro.</p>
              </div>

              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-[#3D0C11] rounded-2xl bubbly-shadow-sm">
                  <div className="flex gap-2.5 items-center">
                    <span className="text-xl">✍️</span>
                    <div>
                      <p className="text-xs font-mono font-black text-[#3D0C11]">Daily Log Reminder</p>
                      <p className="text-[9px] text-gray-500 font-bold">Remind me to log water, symptoms, and cycle notes</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminders.dailyLog}
                    onChange={(e) => setReminders(prev => ({ ...prev, dailyLog: e.target.checked }))}
                    className="w-5 h-5 accent-[#FF7597] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-2 border-[#3D0C11] rounded-2xl bubbly-shadow-sm">
                  <div className="flex gap-2.5 items-center">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-xs font-mono font-black text-[#3D0C11]">Period Predictions</p>
                      <p className="text-[9px] text-gray-500 font-bold">Get alert 2 days before predicted period starts</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminders.periodPrediction}
                    onChange={(e) => setReminders(prev => ({ ...prev, periodPrediction: e.target.checked }))}
                    className="w-5 h-5 accent-[#FF7597] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-2 border-[#3D0C11] rounded-2xl bubbly-shadow-sm">
                  <div className="flex gap-2.5 items-center">
                    <span className="text-xl">🧸</span>
                    <div>
                      <p className="text-xs font-mono font-black text-[#3D0C11]">Cycle Health tips</p>
                      <p className="text-[9px] text-gray-500 font-bold">Lulu or Pavoo wellness & self-care suggestions</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminders.cycleHealth}
                    onChange={(e) => setReminders(prev => ({ ...prev, cycleHealth: e.target.checked }))}
                    className="w-5 h-5 accent-[#FF7597] cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full text-center max-w-sm flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-emerald-100 border-4 border-[#3D0C11] rounded-full flex items-center justify-center text-4xl bubbly-shadow-sm mb-4">
                🎉
              </div>
              <h2 className="font-mono text-2xl font-black text-[#3D0C11] leading-tight mb-1">
                Account Created!
              </h2>
              <p className="text-xs text-pink-600 font-black mb-3">
                Welcome, {name}! ✨🍓
              </p>
              
              <div className="bg-white border-3 border-[#3D0C11] rounded-3xl p-4 bubbly-shadow w-full">
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  Pavoo AI is completely set up with your custom cycle profile. We've unlocked <span className="text-emerald-600">✨50 bonus sparkles</span> as a gift for you! 🎁
                </p>
                <div className="mt-3 bg-[#FDFFB6] border-2 border-[#3D0C11] p-2.5 rounded-2xl inline-flex items-center gap-1.5 font-mono text-xs font-black text-[#3D0C11]">
                  <span>✨ Unlocked:</span>
                  <span>50 Sparkle Points!</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-bold mt-4">
                Tap 'Start Tracking' to open your dashboard.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-100 border-2 border-[#3D0C11] text-[#3D0C11] px-4 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 mb-2.5"
        >
          <AlertCircle size={14} className="text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Navigation Buttons footer */}
      <div className="mt-4 flex gap-3 select-none">
        {step > 1 && step < totalSteps && (
          <button
            onClick={prevStep}
            className="px-5 py-3 bg-white hover:bg-gray-50 text-[#3D0C11] border-3 border-[#3D0C11] rounded-2xl font-mono text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 bubbly-shadow-sm"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        <button
          onClick={nextStep}
          className="flex-1 py-3 bg-[#FFCAD4] hover:bg-[#FFCAD4]/95 text-[#3D0C11] border-3 border-[#3D0C11] rounded-2xl font-mono text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 bubbly-shadow-sm"
        >
          {step === 1 ? 'Start Account Creation 🧸' : step === totalSteps ? 'Start Tracking ✨' : 'Continue'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
