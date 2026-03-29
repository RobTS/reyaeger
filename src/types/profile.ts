export type Profile = {
  steps: ProfileStep[];
};

export type ProfileStep = {
  interpolation?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  setpoint: number;
  duration: number;
  fanValue?: number;
};

export interface HeaterPhase {
  time: number;
  temperature: number;
}

export interface FanPhase {
  time: number;
  fanSpeed: number;
}

export interface NxProfile {
  id: string;
  name: string;
  targetTemperature: number;
  targetTime: number; // seconds
  heaterPhases: HeaterPhase[];
  fanPhases: FanPhase[];
  createdAt: string;
}
