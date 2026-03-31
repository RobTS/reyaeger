import { createAction } from '@reduxjs/toolkit';
import type { NxProfile } from '../../types/profile.ts';

export const resetProfileDraft = createAction<undefined, 'resetProfileDraft'>(
  'resetProfileDraft',
);

export const prefillProfileDraft = createAction<
  NxProfile,
  'prefillProfileDraft'
>('prefillProfileDraft');

export const addFanPhase = createAction<{ index?: number }, 'addFanPhase'>(
  'addFanPhase',
);

export const changeFanPhase = createAction<
  {
    index: number;
    time?: number;
    fanSpeed?: number;
  },
  'changeFanPhase'
>('changeFanPhase');

export const removeFanPhase = createAction<
  {
    index: number;
  },
  'removeFanPhase'
>('removeFanPhase');

export const addHeaterPhase = createAction<
  { index?: number },
  'addHeaterPhase'
>('addHeaterPhase');

export const changeHeaterPhase = createAction<
  {
    index: number;
    temperature?: number;
    time?: number;
  },
  'changeHeaterPhase'
>('changeHeaterPhase');

export const removeHeaterPhase = createAction<
  {
    index: number;
  },
  'removeHeaterPhase'
>('removeHeaterPhase');

export const setProfileName = createAction<
  {
    name: string;
  },
  'setProfileName'
>('setProfileName');

export const setProfileDuration = createAction<
  {
    durationSeconds: number;
  },
  'setProfileDuration'
>('setProfileDuration');
