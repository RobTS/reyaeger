import { last, times } from 'lodash-es';
import { getCurveForPoints } from './splineUtils.ts';
import type { NxProfile, ProfileStep } from '../types/profile.ts';

export const convertToLegacyProfile = (profileDraft: NxProfile) => {
  const duration = last(profileDraft.heaterPhases)!.time;

  const heaterCurve = getCurveForPoints(
    profileDraft.heaterPhases.map((p) => [p.time, p.temperature]),
    duration,
  );
  const fanCurve = getCurveForPoints(
    profileDraft.fanPhases.map((p) => [p.time, p.fanSpeed]),
    duration,
  );

  const legacyProfile = {
    steps: times(duration).map((i): ProfileStep => {
      const heaterValue = heaterCurve[i]!;
      const previousHeaterValue = heaterCurve[i - 1];
      const duration = previousHeaterValue
        ? heaterValue[0] - previousHeaterValue[0]
        : 1;

      return {
        duration,
        fanValue: fanCurve[i]![1],
        setpoint: heaterValue[1],
      };
    }),
  };
  return legacyProfile;
};
