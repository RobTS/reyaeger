import type { LegacyProfile, NxProfile } from '../types/profile.ts';
import { convertNxProfileToLegacyProfile } from './profileUtils.ts';
import { cloneDeep, last } from 'lodash-es';

export class ProfileProcessor {
  private legacyProfile: LegacyProfile;
  constructor(profile: NxProfile) {
    // Extend Profile by 1s to correctly perform last instructions
    const copy = cloneDeep(profile);
    const lastHeaterPhase = last(copy.heaterPhases);
    if (lastHeaterPhase)
      copy.heaterPhases.push({
        ...lastHeaterPhase,
        time: lastHeaterPhase.time + 1,
      });
    const lastFanPhase = last(copy.fanPhases);
    if (lastFanPhase)
      copy.fanPhases.push({
        ...lastFanPhase,
        time: lastFanPhase.time + 1,
      });
    this.legacyProfile = convertNxProfileToLegacyProfile(profile);
  }

  getConfigAtTime(
    millis: number,
  ): { setpoint: number; fanValue: number } | undefined {
    if (!this.legacyProfile) return;
    for (const step of this.legacyProfile.steps) {
      const stepDurationMs = step.duration * 1000;
      if (millis > stepDurationMs) {
        millis -= stepDurationMs;
        continue;
      } else {
        return {
          setpoint: Math.max(Math.min(step.setpoint, 250), 0),
          fanValue: Math.max(Math.min(step.fanValue ?? 50, 100), 0),
        };
      }
    }
  }
}
