import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Heart, Smile, HelpCircle, Save, Sparkles, Notebook } from 'lucide-react';
import { DailyLog, FlowIntensity } from '../types';
import { CUTE_SYMPTOMS, CUTE_MOODS } from '../data';

interface SymptomLoggerProps {
  dateStr: string;
  existingLog?: DailyLog;
  onSaveLog: (log: DailyLog) => void;
  sparklePoints: number;
}

export default function SymptomLogger({
  dateStr,
  existingLog,
  onSaveLog,
  sparklePoints
}: SymptomLoggerProps) {
  // Local state for the selected day log
  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync state when date or existing log changes
  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'none');
      setSelectedSymptoms(existingLog.symptoms || []);
      setSelectedMood(existingLog.mood || '');
      setWaterIntake(existingLog.waterIntake || 0);
      setNotes(existingLog.notes || '');
    } else {
      setFlow('none');
      setSelectedSymptoms([]);
      setSelectedMood('');
      setWaterIntake(0);
      setNotes('');
    }
  }, [dateStr, existingLog]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const updatedLog: DailyLog = {
      dateStr,
      flow,
      symptoms: selectedSymptoms,
      mood: selectedMood,
      waterIntake,
      notes
    };
    onSaveLog(updatedLog);

    // Show a super cute success notification
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2500);
  };

  const flowOptions: { value: FlowIntensity; label: string; bangla: string; icon: string; color: string }[] = [
    { value: 'none', label: 'No Period', bangla: 'Masik Chara 🌸', icon: '🌸', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { value: 'spotty', label: 'Spotting', bangla: 'Khub Alpo 💧', icon: '💧', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
    { value: 'normal', label: 'Medium', bangla: 'Shabhabik 🩸', icon: '🩸', color: 'bg-[#FF7597]/10 text-pink-700 hover:bg-[#FF7597]/20' },
    { value: 'heavy', label: 'Heavy Volcano', bangla: 'Ekdom Bonna 🌋', icon: '🌋', color: 'bg-red-50 text-red-700 hover:bg-red-100' }
  ];

  // Helper to format date nicely
  const displayDate = () => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }) + ` (${d}/${m})`;
  };

  return (
    <div id="symptom-logger-container" className="flex flex-col gap-5 w-full relative">
      
      {/* Logger Title */}
      <div className="bg-amber-100 border-bubbly rounded-3xl p-4 bubbly-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wide">Logging for date:</span>
          <h2 className="font-mono text-lg font-black text-gray-800 flex items-center gap-1.5 mt-0.5">
            <Notebook size={20} className="text-amber-700" /> {displayDate()}
          </h2>
        </div>
        <div className="bg-white px-3 py-1 rounded-2xl border-bubbly-sm flex items-center gap-1">
          <span className="text-xs font-bold text-gray-700">Sparkles:</span>
          <span className="text-xs font-mono font-black text-yellow-500">✨ {sparklePoints}</span>
        </div>
      </div>

      {/* Period Flow Selector */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <h3 className="font-mono text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
          🩸 Flow Intensity <span className="text-xs font-normal text-gray-500">(Masik Probah)</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          {flowOptions.map(option => {
            const isSelected = flow === option.value;
            return (
              <motion.button
                key={option.value}
                onClick={() => setFlow(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'border-gray-800 bg-[#FF7597]/20 font-bold bubbly-shadow-inset'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-xs font-bold text-gray-800 leading-tight">{option.label}</span>
                <span className="text-[10px] text-gray-500 font-medium">{option.bangla}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mood Selector */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <h3 className="font-mono text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
          🥰 Daily Mood <span className="text-xs font-normal text-gray-500">(Ajker Mon)</span>
        </h3>
        
        <div className="flex flex-wrap gap-2.5 justify-center">
          {CUTE_MOODS.map(m => {
            const isSelected = selectedMood === m.id;
            return (
              <motion.button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: isSelected ? m.color : '#F9FAFB' }}
                className={`py-2 px-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected ? 'border-gray-800 font-bold bubbly-shadow-sm' : 'border-gray-200'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-800 leading-none">{m.name}</p>
                  <p className="text-[9px] text-gray-500 leading-none mt-0.5">{m.banglaName}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Symptom Logger stickers */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <h3 className="font-mono text-sm font-black text-gray-800 mb-1 flex items-center gap-1.5">
          ⚡ Symptom Stickers <span className="text-xs font-normal text-gray-500">(Sharirik Obostha)</span>
        </h3>
        <p className="text-[11px] text-gray-400 mb-3">Tap on all that apply to paste them onto today's note!</p>
        
        <div className="grid grid-cols-2 gap-2.5">
          {CUTE_SYMPTOMS.map(s => {
            const isSelected = selectedSymptoms.includes(s.id);
            return (
              <motion.button
                key={s.id}
                onClick={() => toggleSymptom(s.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-start gap-2.5 p-2.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-gray-800 bg-amber-50 font-bold bubbly-shadow-sm'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="text-2xl p-1 bg-white border-bubbly-sm rounded-xl">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-gray-800 truncate">{s.name}</h4>
                  <p className="text-[10px] text-pink-500 font-bold truncate">{s.banglaName}</p>
                  <p className="text-[9px] text-gray-400 leading-tight mt-0.5 hidden sm:block">{s.description}</p>
                </div>
                {isSelected && (
                  <div className="bg-emerald-400 border-bubbly-sm p-0.5 rounded-full mt-1">
                    <Check size={8} className="text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Cozy Handwritten Note Section */}
      <div className="bg-[#FFFDF0] border-bubbly rounded-3xl p-5 bubbly-shadow relative overflow-hidden">
        {/* Binder circles to make it look like a real page */}
        <div className="absolute top-2 left-6 flex gap-2">
          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border border-gray-400"></div>
          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border border-gray-400"></div>
        </div>

        <h3 className="font-mono text-sm font-black text-gray-800 mb-2 pl-4 flex items-center gap-1.5">
          📝 Cozy Diary Note <span className="text-xs font-normal text-gray-500">(Gopon Diary)</span>
        </h3>
        
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Today my uterus is feeling a bit cranky, need chocolate... (Write anything you want here!)"
          className="w-full h-24 p-3 bg-transparent border-t border-b border-dashed border-amber-300 focus:outline-none text-xs font-sans text-gray-800 leading-relaxed resize-none pl-4 placeholder:italic placeholder:text-gray-400"
        ></textarea>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-4 bg-[#FF7597] hover:bg-[#E05E7E] text-white font-mono font-black text-base border-bubbly rounded-3xl bubbly-shadow cursor-pointer flex items-center justify-center gap-2 text-shadow-sm"
      >
        <Save size={20} />
        Save Today's Vibe! (+15 Sparkles)
      </motion.button>

      {/* Floating Success Toast Notification */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 border-bubbly-sm shadow-2xl z-50 text-xs font-sans font-bold"
          >
            <div className="bg-yellow-400 text-gray-900 rounded-full p-1">
              <Sparkles size={14} className="animate-spin" />
            </div>
            <span>Logged! You earned +15 Sparkles! ✨</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
