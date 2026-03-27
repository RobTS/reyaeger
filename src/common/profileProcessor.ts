import type { Profile, ProfileStep } from '../types/profile.ts';
import { last } from 'lodash-es';

const interpolateSetpoint = (
  start: number,
  end: number,
  progress: number,
  type: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out',
): number => {
  switch (type) {
    case 'linear':
      return start + (end - start) * progress;
    case 'ease-in':
      return start + (end - start) * Math.pow(progress, 2);
    case 'ease-out':
      return start + (end - start) * (1 - Math.pow(1 - progress, 2));
    case 'ease-in-out':
      return (
        start +
        (end - start) *
          (progress < 0.5
            ? 2 * Math.pow(progress, 2)
            : 1 - Math.pow(-2 * progress + 2, 2) / 2)
      );
    default:
      return end;
  }
};

export class ProfileProcessor {
  private profile: Profile;
  constructor(profile: Profile) {
    this.profile = profile;
  }

  getConfigAtTime(
    millis: number,
  ): { setpoint: number; fanValue: number | undefined } | undefined {
    if (!this.profile) return;
    let previousStep: ProfileStep | undefined = undefined;
    for (const step of this.profile.steps) {
      const stepDurationMs = step.duration * 1000;
      if (millis > stepDurationMs) {
        millis -= stepDurationMs;
        previousStep = step;
        continue;
      } else {
        return {
          setpoint: step.interpolation
            ? Math.floor(
                interpolateSetpoint(
                  previousStep?.setpoint || 0,
                  step.setpoint,
                  millis / stepDurationMs,
                  step.interpolation,
                ) * 10,
              ) / 10
            : step.setpoint,
          fanValue: step.fanValue,
        };
      }
    }
    const lastValue = last(this.profile.steps);
    if (!lastValue) return;
    return {
      fanValue: lastValue.fanValue,
      setpoint: lastValue.setpoint,
    };
  }
}
