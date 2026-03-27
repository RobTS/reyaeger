export type Profile = {
  steps: ProfileStep[];
};

export type ProfileStep = {
  interpolation?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  setpoint: number;
  duration: number;
  fanValue?: number;
};
