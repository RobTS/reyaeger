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
  const duration = Math.max(
    last(profileDraft.heaterPhases)?.time || 0,
    last(profileDraft.fanPhases)?.time || 0,
  );
  if (!duration) return { steps: [] };
  const steps: LegacyProfileStep[] = times(duration + 1).map(() => ({
    duration: 1,
    setpoint: 0,
    fanValue: 0,
    interpolation: 'linear',
  }));
  getCurveForPoints(
    profileDraft.heaterPhases.map((p) => [p.time, p.temperature]),
    duration * 4,
  ).forEach(([time, temp]) => {
    if (steps[Math.floor(time)]) steps[Math.floor(time)]!.setpoint = temp;
  });
  getCurveForPoints(
    profileDraft.fanPhases.map((p) => [p.time, p.fanSpeed]),
    duration * 4,
  ).forEach(([time, fanValue]) => {
    if (steps[Math.floor(time)]) steps[Math.floor(time)]!.fanValue = fanValue;
  });
  return {
    steps,
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
