export type FlowIntensity = 'none' | 'spotty' | 'normal' | 'heavy';

export interface Symptom {
  id: string;
  name: string;
  banglaName: string;
  icon: string;
  category: 'physical' | 'emotional' | 'craving' | 'energy';
  description: string;
}

export interface Mood {
  id: string;
  name: string;
  banglaName: string;
  emoji: string;
  color: string;
  description: string;
}

export interface DailyLog {
  dateStr: string; // YYYY-MM-DD
  flow: FlowIntensity;
  symptoms: string[]; // Symptom IDs
  mood: string; // Mood ID
  waterIntake: number; // in glasses (e.g. 0 to 12)
  notes: string;
  crampGameScore?: number;
}

export interface CycleSettings {
  cycleLength: number; // Default 28
  periodLength: number; // Default 5
}

export type AccessoryType = 'none' | 'crown' | 'sunglasses' | 'scarf' | 'ribbon' | 'sleepmask';

export interface MascotAccessory {
  id: AccessoryType;
  name: string;
  banglaName: string;
  icon: string;
  emoji: string;
  cost: number; // in "Sparkle points"
}

export interface UserStats {
  sparklePoints: number; // earned by logging, drinking water, or playing the mini-game
  boughtAccessories: AccessoryType[];
  selectedAccessory: AccessoryType;
  waterGoal: number; // Default 8 glasses
}

export interface CyclePrediction {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  phaseProgress: number; // 0 to 100
  daysUntilNext: number;
  nextPeriodStartDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
}

export interface UserProfile {
  name: string;
  dob: string; // YYYY-MM-DD
  lastPeriodDate: string; // YYYY-MM-DD
  cycleLength: number;
  periodDuration: number;
  symptoms: string[]; // typical symptom IDs
  reminderPreferences: {
    dailyLog: boolean;
    periodPrediction: boolean;
    cycleHealth: boolean;
  };
  profilePhoto?: string; // base64 string or emoji
}

