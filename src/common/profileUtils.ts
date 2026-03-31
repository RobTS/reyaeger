import { isNumber, last, times } from 'lodash-es';
import { getCurveForPoints } from './splineUtils.ts';
import type {
  FanPhase,
  HeaterPhase,
  LegacyProfile,
  LegacyProfileStep,
  NxProfile,
} from '../types/profile.ts';
import { DateTime } from 'luxon';

export const convertNxProfileToLegacyProfile = (profileDraft: NxProfile) => {
  const duration = last(profileDraft.heaterPhases)!.time;

  const heaterCurve = getCurveForPoints(
    profileDraft.heaterPhases.map((p) => [p.time, p.temperature]),
    duration,
  );
  const fanCurve = getCurveForPoints(
    profileDraft.fanPhases.map((p) => [p.time, p.fanSpeed]),
    duration,
  );

  return {
    steps: times(duration).map((i): LegacyProfileStep => {
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
};

export const convertLegacyToNxProfile = (
  profileDraft: LegacyProfile,
  options: { name?: string } = {},
): NxProfile => {
  const heaterPhases: HeaterPhase[] = [];
  const fanPhases: FanPhase[] = [];

  if (profileDraft.steps[0]) {
    heaterPhases.push({
      time: 0,
      temperature: profileDraft.steps[0].setpoint,
    });
    fanPhases.push({
      time: 0,
      fanSpeed: profileDraft.steps[0].fanValue || 50,
    });
  }
  let duration = 0;
  profileDraft.steps.forEach((step) => {
    if (!step.duration) return;
    duration += step.duration;
    if (isNumber(step.setpoint)) {
      heaterPhases.push({
        time: duration,
        temperature: step.setpoint,
      });
    }
    if (isNumber(step.fanValue)) {
      fanPhases.push({
        time: duration,
        fanSpeed: step.fanValue,
      });
    }
  });

  return {
    name: `${options.name || `ConvertedProfile_${DateTime.now().toFormat('yyyy-MM-dd_hh-mm')}`}`,
    fanPhases,
    heaterPhases,
    createdAt: DateTime.now().toISOTime(),
  };
};
