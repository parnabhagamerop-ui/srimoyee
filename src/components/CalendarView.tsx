import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { DailyLog, CyclePrediction } from '../types';
import { formatDateStr, parseDateStr } from '../utils';

interface CalendarViewProps {
  logs: DailyLog[];
  prediction: CyclePrediction;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export default function CalendarView({
  logs,
  prediction,
  selectedDateStr,
  onSelectDate
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Initialize to selected date or today
    return parseDateStr(selectedDateStr);
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    onSelectDate(formatDateStr(new Date()));
  };

  const monthNames = [
    'January 🍓', 'February 🍫', 'March 🌸', 'April 🌱',
    'May ☀️', 'June 🍒', 'July 🍉', 'August 🌻',
    'September 🍁', 'October 🎃', 'November 🧣', 'December 🎄'
  ];

  const banglaMonthNames = [
    'Jan (Mash-1)', 'Feb (Mash-2)', 'Mar (Mash-3)', 'Apr (Mash-4)',
    'May (Mash-5)', 'Jun (Mash-6)', 'Jul (Mash-7)', 'Aug (Mash-8)',
    'Sep (Mash-9)', 'Oct (Mash-10)', 'Nov (Mash-11)', 'Dec (Mash-12)'
  ];

  // Grid dates generator
  const daysGrid: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(new Date(year, month, d));
  }

  // Check state of each date
  const getDateStatus = (date: Date) => {
    const dStr = formatDateStr(date);
    const log = logs.find(l => l.dateStr === dStr);
    
    const isLoggedPeriod = log && log.flow && log.flow !== 'none';
    
    // Cycle prediction comparisons
    const dateMs = date.getTime();
    
    // Predicted Period window (range of periodLength starting at nextPeriodStartDate)
    const nextStart = parseDateStr(prediction.nextPeriodStartDate);
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 5); // default 5 days
    const isPredictedPeriod = dateMs >= nextStart.getTime() && dateMs < nextEnd.getTime();

    // Fertile Window
    const fertStart = parseDateStr(prediction.fertileWindowStart);
    const fertEnd = parseDateStr(prediction.fertileWindowEnd);
    const isFertile = dateMs >= fertStart.getTime() && dateMs <= fertEnd.getTime();

    // Ovulation Date
    const isOvulation = dStr === prediction.ovulationDate;

    // Is Today
    const todayStr = formatDateStr(new Date());
    const isToday = dStr === todayStr;

    return {
      isLoggedPeriod,
      isPredictedPeriod,
      isFertile,
      isOvulation,
      isToday,
      hasLog: !!log && (log.symptoms.length > 0 || log.mood || log.waterIntake > 0),
      log
    };
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div id="calendar-view-root" className="bg-white border-bubbly rounded-3xl p-4 bubbly-shadow mb-6">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-left">
          <h3 className="font-mono text-lg font-bold text-gray-800">
            {monthNames[month]} {year}
          </h3>
          <p className="text-xs font-sans text-pink-500 font-semibold uppercase tracking-wider">
            {banglaMonthNames[month]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border-bubbly-sm hover:bg-pink-100 transition-all cursor-pointer bg-pink-50 text-gray-700"
            title="Ager Mash"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-mono font-bold border-bubbly-sm rounded-xl hover:bg-accent transition-all cursor-pointer bg-white"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border-bubbly-sm hover:bg-pink-100 transition-all cursor-pointer bg-pink-50 text-gray-700"
            title="Porer Mash"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdays.map((day, i) => (
          <div
            key={day}
            className={`text-center font-mono text-xs font-bold py-1 ${
              i === 0 || i === 6 ? 'text-pink-500' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysGrid.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square bg-transparent"></div>;
          }

          const dStr = formatDateStr(date);
          const isSelected = dStr === selectedDateStr;
          const {
            isLoggedPeriod,
            isPredictedPeriod,
            isFertile,
            isOvulation,
            isToday,
            hasLog,
            log
          } = getDateStatus(date);

          // Dynamic cell styling based on status
          let cellBg = 'bg-gray-50 hover:bg-pink-50';
          let borderStyle = 'border-2 border-transparent';
          let textColor = 'text-gray-700';

          if (isLoggedPeriod) {
            cellBg = 'bg-[#FF7597]/20 hover:bg-[#FF7597]/30';
            borderStyle = 'border-2 border-[#FF7597]';
            textColor = 'text-pink-700 font-bold';
          } else if (isPredictedPeriod) {
            cellBg = 'bg-pink-50/70 hover:bg-pink-100/80 pattern-slashes';
            borderStyle = 'border-2 border-dashed border-pink-400';
            textColor = 'text-pink-600 font-medium';
          } else if (isFertile) {
            cellBg = 'bg-yellow-50 hover:bg-yellow-100';
            borderStyle = 'border-2 border-amber-300';
            textColor = 'text-amber-800 font-medium';
          }

          if (isSelected) {
            borderStyle = 'border-3 border-[#3D0C11]';
          }

          return (
            <motion.button
              key={dStr}
              onClick={() => onSelectDate(dStr)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 relative transition-all cursor-pointer ${cellBg} ${borderStyle} ${textColor}`}
            >
              {/* Little indicators */}
              <div className="absolute top-1 left-1.5 flex items-center justify-center">
                {isLoggedPeriod && <span className="text-[10px]" title="Flow recorded">🩸</span>}
                {!isLoggedPeriod && isPredictedPeriod && <span className="text-[9px] opacity-70">🩸</span>}
                {!isLoggedPeriod && !isPredictedPeriod && isFertile && !isOvulation && (
                  <span className="text-[10px]" title="Fertile window">🌸</span>
                )}
                {isOvulation && (
                  <span className="text-[11px] text-amber-500 animate-pulse" title="Ovulation day">✨</span>
                )}
              </div>

              {/* Day Number */}
              <span className={`text-sm font-mono mt-2 ${isToday ? 'bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs' : ''}`}>
                {date.getDate()}
              </span>

              {/* Dot indicator if there's custom log data (water/symptom/notes) */}
              <div className="flex gap-0.5 mt-0.5 justify-center min-h-[5px] w-full">
                {hasLog && (
                  <div className="w-1 h-1 bg-teal-500 rounded-full" title="Logged activity"></div>
                )}
                {log && log.waterIntake > 0 && (
                  <div className="w-1 h-1 bg-sky-400 rounded-full" title="Water logged"></div>
                )}
                {log && log.mood && (
                  <div className="w-1 h-1 bg-amber-400 rounded-full" title="Mood logged"></div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-sans text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-lg bg-[#FF7597]/20 border border-[#FF7597] flex items-center justify-center text-[10px]">🩸</span>
          <span>Logged Period (Masik)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-lg bg-pink-50/70 border border-dashed border-pink-400 flex items-center justify-center text-[10px]">☁️</span>
          <span>Predicted Period (Anumanic)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-lg bg-yellow-50 border border-amber-300 flex items-center justify-center text-[10px]">🌸</span>
          <span>Fertile Window (Ushor)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-[10px] text-amber-500">✨</span>
          <span>Ovulation (Dimbasfot)</span>
        </div>
      </div>
    </div>
  );
}
