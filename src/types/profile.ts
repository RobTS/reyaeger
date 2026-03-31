export type LegacyProfile = {
  steps: LegacyProfileStep[];
};

export type LegacyProfileStep = {
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
  name: string;
  createdAt?: string;
  heaterPhases: HeaterPhase[];
  fanPhases: FanPhase[];
}
