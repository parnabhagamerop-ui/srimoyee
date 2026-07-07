import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarRange, Sparkles, HeartHandshake, Info, ArrowRight } from 'lucide-react';
import { CyclePrediction } from '../types';
import { PHASE_INFO } from '../data';

interface InsightsViewProps {
  prediction: CyclePrediction;
}

export default function InsightsView({ prediction }: InsightsViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const phaseDetails = PHASE_INFO[prediction.phase];

  const funFaqs = [
    {
      q: "Why do I crave fuchka, chips & chocolate right now? 🍫",
      a: "Because your hormones are hosting a mini-party! Progesterone makes your body burn energy a bit faster, shouting 'FEED THE BEAST!' Don't worry, snacking is 100% uterus-approved! 🍕"
    },
    {
      q: "Why is my uterus throwing a violent tantrum? 🌋",
      a: "It's doing a deep-cleaning ritual! When there's no baby egg, the uterus gets slightly dramatic, packs its bags, and sheds its walls like wallpaper. Give it a warm hug (hot bottle) and say 'Thank you, next!' 💆‍♀️"
    },
    {
      q: "Am I glowing today or is it just the mirror? ✨",
      a: "It's real! During the Ovulatory phase, Estrogen levels peak. This increases blood flow to your skin, giving you a beautiful, cute natural blush. You are officially a sparkly goddess today! 💅"
    },
    {
      q: "Why am I crying over a cute dog video? 😭",
      a: "That's your progesterone dropping during the Luteal/Autumn phase. Your emotional radar goes to 200% sensitivity. Cry as much as you want, tears are just sparkling heart-juices! 🌸"
    }
  ];

  const getPhaseIcon = (p: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal') => {
    switch (p) {
      case 'menstrual':
        return '❄️⛄'; // Winter / Menstrual
      case 'follicular':
        return '🌱🦋'; // Spring / Follicular
      case 'ovulatory':
        return '✨👑'; // Summer / Ovulatory
      case 'luteal':
        return '🍂🍪'; // Autumn / Luteal
    }
  };

  return (
    <div id="insights-view-root" className="flex flex-col gap-5 w-full">
      
      {/* Dynamic Phase Card */}
      <div
        className={`border-bubbly rounded-3xl p-5 bubbly-shadow flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${
          prediction.phase === 'menstrual' ? 'bento-card-pink' :
          prediction.phase === 'follicular' ? 'bento-card-green' :
          prediction.phase === 'ovulatory' ? 'bento-card-yellow' :
          prediction.phase === 'luteal' ? 'bento-card-purple' :
          'bento-card-white'
        }`}
      >
        <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-15 rotate-12 select-none">
          {getPhaseIcon(prediction.phase)}
        </div>

        <div>
          <span className="text-[10px] font-mono font-black px-2.5 py-1 bg-black/30 border-bubbly-sm rounded-full text-white">
            Current Cycle Status:
          </span>
          <h2 className="font-mono text-2xl font-black mt-2 flex items-center gap-2">
            <span>{phaseDetails.title}</span>
            <span className="text-xl">{getPhaseIcon(prediction.phase).split(' ')[0]}</span>
          </h2>
          <p className="text-xs font-sans font-bold uppercase tracking-wider mt-0.5 opacity-90">
            {phaseDetails.banglaTitle}
          </p>
        </div>

        {/* Phase progress bar */}
        <div className="w-full">
          <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5 opacity-90">
            <span>Phase Journey:</span>
            <span>{prediction.phaseProgress}%</span>
          </div>
          <div className="w-full h-4 bg-black/25 border-bubbly-sm rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.phaseProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ backgroundColor: phaseDetails.color }}
              className="h-full rounded-full"
            ></motion.div>
          </div>
        </div>

        {/* Playful cartoon descriptions */}
        <div className="bg-black/25 border-bubbly-sm border-dashed rounded-2xl p-3.5 text-xs leading-relaxed font-sans text-white">
          <p className="font-bold mb-1 text-white flex items-center gap-1">💡 What is happening:</p>
          <p className="mb-2 opacity-95">{phaseDetails.description}</p>
          <p className="italic text-pink-300 font-semibold">🌸 {phaseDetails.banglaDesc}</p>
        </div>
      </div>

      {/* Days Countdown Card */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-mono text-base font-black text-gray-800 mb-1 flex items-center gap-1">
            <CalendarRange size={18} className="text-pink-500" /> Predictions Tracker
          </h3>
          <p className="text-xs text-gray-500 leading-tight">
            Our little cartoon calculator predicts your next calendar cycles.
          </p>
          
          <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] font-sans font-bold text-gray-600">
            <div className="bg-pink-50 p-2 rounded-xl border-bubbly-sm border-dashed">
              <p className="text-pink-700">Next Period starts:</p>
              <p className="font-mono text-gray-800 mt-0.5">{prediction.nextPeriodStartDate}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-xl border-bubbly-sm border-dashed">
              <p className="text-amber-700">Next Ovulation date:</p>
              <p className="font-mono text-gray-800 mt-0.5">{prediction.ovulationDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-pink-100 border-bubbly rounded-2xl p-3.5 text-center flex flex-col justify-center items-center min-w-[90px] bubbly-shadow-sm">
          <p className="text-[10px] font-mono font-black text-pink-800 leading-none">NEXT MENSTRUATION IN</p>
          <p className="font-mono text-3xl font-black text-pink-600 my-1">{prediction.daysUntilNext}</p>
          <p className="text-[10px] font-bold text-pink-800 leading-none">DAYS 🩸</p>
        </div>
      </div>

      {/* Cycle Phase Flow Chart */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <h3 className="font-mono text-sm font-black text-gray-800 mb-4 flex items-center gap-1.5">
          🔄 The Four Seasons of Your Body
        </h3>

        <div className="flex flex-col gap-3">
          {[
            { phaseName: 'menstrual', label: '1. Winter (Menstrual)', period: 'Days 1-5', desc: 'Rest and repair', icon: '❄️' },
            { phaseName: 'follicular', label: '2. Spring (Follicular)', period: 'Days 6-11', desc: 'Energy rising', icon: '🌱' },
            { phaseName: 'ovulatory', label: '3. Summer (Ovulation)', period: 'Days 12-16', desc: 'Confidence & glow', icon: '✨' },
            { phaseName: 'luteal', label: '4. Autumn (Luteal)', period: 'Days 17-28', desc: 'Cozy retreat', icon: '🍂' }
          ].map((item, idx) => {
            const isCurrent = prediction.phase === item.phaseName;
            return (
              <div
                key={item.phaseName}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'border-gray-800 bg-amber-50 bubbly-shadow-sm font-bold'
                    : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <div className={`text-xl p-1.5 rounded-xl border-bubbly-sm ${isCurrent ? 'bg-amber-200' : 'bg-white'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-gray-800">{item.label}</h4>
                    {isCurrent && (
                      <span className="text-[9px] bg-red-400 text-white font-mono px-1.5 py-0.5 rounded-full animate-pulse uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{item.desc} • {item.period}</p>
                </div>
                {isCurrent && <ArrowRight size={14} className="text-amber-600 animate-bounce-horizontal" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fun FAQ / Mythbusters */}
      <div className="bg-white border-bubbly rounded-3xl p-5 bubbly-shadow">
        <h3 className="font-mono text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
          💡 Uterus Myths & Secrets <span className="text-xs font-normal text-gray-500">(Did You Know?)</span>
        </h3>

        <div className="flex flex-col gap-2.5">
          {funFaqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-2xl overflow-hidden transition-all bg-gray-50/50"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-3.5 text-left font-sans font-bold text-xs text-gray-800 flex justify-between items-center gap-2 cursor-pointer hover:bg-gray-100/50 transition-all"
                >
                  <span className="leading-tight">{faq.q}</span>
                  <span className="text-gray-400 font-mono text-sm">{isOpen ? '▼' : '▶'}</span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-amber-50/50 border-t-2 border-dashed border-gray-200 text-xs font-sans text-gray-700 leading-relaxed pl-4">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
